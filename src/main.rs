mod register;
use cpal::SampleFormat;
use cpal::traits::{DeviceTrait, HostTrait};
use rusynth::music_engine::notes::{Voice, init_octave};

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

    let octave = init_octave();
    let voices = vec![
        Voice::new(octave["B"]),
        Voice::new(octave["E"]),
        Voice::new(octave["G"]),
        Voice::new(octave["D"]),
    ];

    match sample_format {
        SampleFormat::F32 => register::play::run::<f32>(&device, config, voices).unwrap(),
        SampleFormat::I16 => register::play::run::<i16>(&device, config, voices).unwrap(),
        SampleFormat::U16 => register::play::run::<u16>(&device, config, voices).unwrap(),
        sample_format => panic!("Unsupported sample format '{sample_format}'"),
    }
}
