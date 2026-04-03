use std::collections::HashMap;

//Error Frameworks
#[derive(Debug, thiserror::Error)]
pub enum NoteError {
    #[error("Cannot Drop Another Octave")]
    OctaveDrop,
    #[error("Cannot Rase Another Octave")]
    OctaveRaise,
}

/// Init HashMap of notes in base octave
///
/// The default root note is C4 at 261.626 [and respective notes]
pub fn init_octave() -> HashMap<&'static str, f32> {
    let mut octave: HashMap<&str, f32> = HashMap::new();

    octave.insert("C", 261.626);
    octave.insert("C#", 277.183);
    octave.insert("D", 293.665);
    octave.insert("D#", 311.127);
    octave.insert("E", 329.628);
    octave.insert("F", 349.228);
    octave.insert("F#", 369.994);
    octave.insert("G", 391.995);
    octave.insert("G#", 415.305);
    octave.insert("A", 440.000);
    octave.insert("A#", 466.164);
    octave.insert("B", 493.883);

    octave
}

pub fn octave_up(octave: &mut HashMap<&str, f32>) {
    for (_, val) in octave.iter_mut() {
        *val *= 2.0;
    }
}

pub fn octave_down(octave: &mut HashMap<&str, f32>) {
    for (_, val) in octave.iter_mut() {
        *val /= 2.0;
    }
}
