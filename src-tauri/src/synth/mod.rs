mod register;

use cpal::traits::{DeviceTrait, HostTrait};
use cpal::{SampleFormat, Stream};
use rusynth::music_engine::notes::{init_octave, Voice};
use std::collections::HashMap;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::{Arc, Mutex};

pub(crate) struct SynthSlot {
    pub(crate) voices: Vec<Voice>,
    pub(crate) playing: Arc<AtomicBool>,
}

/// Shared mixer state accessed by both the audio callback and Tauri commands.
type MixerState = Arc<Mutex<HashMap<String, SynthSlot>>>;

pub struct SynthManager {
    slots: MixerState,
    _stream: Mutex<Option<Stream>>,
}

impl SynthManager {
    pub fn new() -> Self {
        let slots: MixerState = Arc::new(Mutex::new(HashMap::new()));

        let host = cpal::default_host();
        let device = host
            .default_output_device()
            .expect("no output device available");

        let supported_config = device
            .supported_output_configs()
            .expect("error querying configs")
            .next()
            .expect("no supported config")
            .with_max_sample_rate();

        let sample_format = supported_config.sample_format();
        let config: cpal::StreamConfig = supported_config.into();
        let sample_rate = config.sample_rate as f32;
        let channels = config.channels as usize;

        let cb_slots = slots.clone();

        let stream = match sample_format {
            SampleFormat::F32 => {
                register::play::run::<f32>(&device, config, channels, sample_rate, cb_slots)
            }
            SampleFormat::I16 => {
                register::play::run::<i16>(&device, config, channels, sample_rate, cb_slots)
            }
            SampleFormat::U16 => {
                register::play::run::<u16>(&device, config, channels, sample_rate, cb_slots)
            }
            sf => panic!("Unsupported sample format '{sf}'"),
        }
        .expect("failed to create audio stream");

        Self {
            slots,
            _stream: Mutex::new(Some(stream)),
        }
    }
}

#[tauri::command]
pub fn create_synth(id: String, state: tauri::State<'_, SynthManager>) -> Result<(), String> {
    let octave = init_octave();
    let voices = vec![
        Voice::new(octave["B"]),
        Voice::new(octave["E"]),
        Voice::new(octave["G"]),
        Voice::new(octave["D"]),
    ];

    let slot = SynthSlot {
        voices,
        playing: Arc::new(AtomicBool::new(false)),
    };

    state.slots.lock().unwrap().insert(id, slot);
    Ok(())
}

#[tauri::command]
pub fn toggle_synth(id: String, state: tauri::State<'_, SynthManager>) -> Result<bool, String> {
    let slots = state.slots.lock().unwrap();
    let slot = slots.get(&id).ok_or("synth not found")?;
    let was_playing = slot.playing.load(Ordering::Relaxed);
    slot.playing.store(!was_playing, Ordering::Relaxed);
    Ok(!was_playing)
}

#[tauri::command]
pub fn destroy_synth(id: String, state: tauri::State<'_, SynthManager>) -> Result<(), String> {
    let mut slots = state.slots.lock().unwrap();
    slots.remove(&id).ok_or("synth not found")?;
    Ok(())
}
