mod synth;

use synth::SynthManager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .manage(SynthManager::new())
        .invoke_handler(tauri::generate_handler![
            synth::create_synth,
            synth::toggle_synth,
            synth::destroy_synth,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
