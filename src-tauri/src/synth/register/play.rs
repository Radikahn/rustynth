use std::collections::HashMap;
use std::sync::atomic::Ordering;
use std::sync::{Arc, Mutex};

use cpal::{
    FromSample, Sample, SizedSample, Stream,
    traits::{DeviceTrait, StreamTrait},
};
use crate::synth::SynthSlot;

/// Single shared audio stream that mixes all active synth instances.
pub fn run<T>(
    device: &cpal::Device,
    config: cpal::StreamConfig,
    channels: usize,
    sample_rate: f32,
    slots: Arc<Mutex<HashMap<String, SynthSlot>>>,
) -> Result<Stream, anyhow::Error>
where
    T: SizedSample + FromSample<f32>,
{
    let err_fn = |err| eprintln!("an error occurred on stream: {err}");

    let stream = device.build_output_stream(
        &config,
        move |data: &mut [T], _: &cpal::OutputCallbackInfo| {
            let mut slots = slots.lock().unwrap();
            let active_count = slots
                .values()
                .filter(|s| s.playing.load(Ordering::Relaxed))
                .count();

            if active_count == 0 {
                for sample in data.iter_mut() {
                    *sample = Sample::EQUILIBRIUM;
                }
                return;
            }

            let gain = 1.0 / active_count as f32;

            for frame in data.chunks_mut(channels) {
                let mut mix = 0.0f32;
                for slot in slots.values_mut() {
                    if !slot.playing.load(Ordering::Relaxed) {
                        continue;
                    }
                    let mut voice_mix = 0.0f32;
                    let voice_count = slot.voices.len() as f32;
                    for voice in slot.voices.iter_mut() {
                        voice_mix += voice.next_sample(sample_rate);
                    }
                    mix += voice_mix / voice_count;
                }
                mix *= gain;

                let value: T = T::from_sample(mix);
                for sample in frame.iter_mut() {
                    *sample = value;
                }
            }
        },
        err_fn,
        None,
    )?;
    stream.play()?;

    Ok(stream)
}
