use cpal::{
    FromSample, Sample, SampleFormat, SizedSample,
    traits::{DeviceTrait, HostTrait, StreamTrait},
};
use std::collections::HashMap;

use crate::music::notes::octave_up;

mod music;

/// Silence Writer to Buffer
fn write_silence<T: Sample>(data: &mut [T], _: &cpal::OutputCallbackInfo) {
    for sample in data.iter_mut() {
        *sample = Sample::EQUILIBRIUM;
    }
}

/// Write sample to audio buffer
fn write_data<T>(output: &mut [T], channels: usize, next_sample: &mut dyn FnMut() -> f32)
where
    T: Sample + FromSample<f32>,
{
    for frame in output.chunks_mut(channels) {
        let value: T = T::from_sample(next_sample());
        for sample in frame.iter_mut() {
            *sample = value;
        }
    }
}

pub fn run<T>(device: &cpal::Device, config: cpal::StreamConfig) -> Result<(), anyhow::Error>
where
    T: SizedSample + FromSample<f32>,
{
    let mut octave: HashMap<&str, f32> = music::notes::init_octave();

    //test octave changes
    octave_up(&mut octave);

    let sample_rate = config.sample_rate as f32;
    let channels = config.channels as usize;

    let mut sample_clock = 0f32;
    let mut next_value = move || {
        sample_clock = (sample_clock + 1.0) % sample_rate;
        (sample_clock * octave["A"] * std::f32::consts::PI / sample_rate).sin()
    };

    let err_fn = |err| eprintln!("an error occurred on stream: {err}");

    let stream = device.build_output_stream(
        &config,
        move |data: &mut [T], _: &cpal::OutputCallbackInfo| {
            write_data(data, channels, &mut next_value)
        },
        err_fn,
        None,
    )?;
    stream.play()?;

    //duration of note being held
    std::thread::sleep(std::time::Duration::from_millis(1000));

    Ok(())
}

fn main() {
    //support for other audio devices must be enabled at compile time
    // #[allow(unused_mut, unused_assignments)]
    // let mut jack_host_id = Err(HostUnavailable);
    // #[allow(unused_mut, unused_assignments)]
    // let mut pulseaudio_host_id = Err(HostUnavailable);
    // #[allow(unused_mut, unused_assignments)]
    // let mut pipewire_host_id = Err(HostUnavailable);

    let host = cpal::default_host();

    let device = host
        .default_output_device()
        .expect("no output device available");

    let mut supported_configs_range = device
        .supported_output_configs()
        .expect("error while querying configs");

    let supported_config = supported_configs_range
        .next()
        .expect("no supported config?!")
        .with_max_sample_rate();

    let sample_format = supported_config.sample_format();
    let config: cpal::StreamConfig = supported_config.into();
    match sample_format {
        SampleFormat::F32 => run::<f32>(&device, config).unwrap(),
        SampleFormat::I16 => run::<i16>(&device, config).unwrap(),
        SampleFormat::U16 => run::<u16>(&device, config).unwrap(),
        sample_format => panic!("Unsupported sample format '{sample_format}'"),
    }
}
