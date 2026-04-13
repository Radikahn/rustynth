use std::collections::HashMap;
use std::sync::atomic::Ordering;
use std::sync::{Arc, Mutex};

use cpal::{
    FromSample, SizedSample, Stream,
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

            // ~5ms fade to eliminate clicks on toggle and gain changes
            let fade_step = 1.0 / (0.005 * sample_rate);

            for frame in data.chunks_mut(channels) {
                let mut mix = 0.0f32;
                let mut amp_sum = 0.0f32;

                for slot in slots.values_mut() {
                    let target = if slot.playing.load(Ordering::Relaxed) {
                        1.0
                    } else {
                        0.0
                    };

                    if slot.amplitude < target {
                        slot.amplitude = (slot.amplitude + fade_step).min(target);
                    } else if slot.amplitude > target {
                        slot.amplitude = (slot.amplitude - fade_step).max(target);
                    }

                    if slot.amplitude <= 0.0 {
                        continue;
                    }

                    amp_sum += slot.amplitude;
                    let mut voice_mix = 0.0f32;
                    let voice_count = slot.voices.len() as f32;
                    for voice in slot.voices.iter_mut() {
                        voice_mix += voice.next_sample(sample_rate);
                    }
                    mix += (voice_mix / voice_count) * slot.amplitude;
                }

                // Smoothly normalize when combined amplitudes exceed 1.0
                if amp_sum > 1.0 {
                    mix /= amp_sum;
                }

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
