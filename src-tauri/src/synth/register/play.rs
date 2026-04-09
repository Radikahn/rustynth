use cpal::{
    FromSample, Sample, SizedSample,
    traits::{DeviceTrait, StreamTrait},
};
use rusynth::music_engine::notes::Voice;

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

pub fn run<T>(
    device: &cpal::Device,
    config: cpal::StreamConfig,
    mut voices: Vec<Voice>,
) -> Result<(), anyhow::Error>
where
    T: SizedSample + FromSample<f32>,
{
    let sample_rate = config.sample_rate as f32;
    let channels = config.channels as usize;

    let max_polyphony = voices.len() as f32;
    let mut next_value = move || {
        let mut mix = 0.0f32;

        for voice in voices.iter_mut() {
            mix += voice.next_sample(sample_rate);
        }

        mix / max_polyphony
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
