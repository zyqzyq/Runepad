use super::*;

fn snapshot_with_content() -> SessionSnapshot {
    SessionSnapshot {
        version: 2,
        active_index: 0,
        tabs: vec![SessionTab {
            filepath: None,
            filename: "scratch.txt".to_string(),
            is_new: true,
            encoding: "UTF-8".to_string(),
            line_ending: "LF".to_string(),
            language: "plaintext".to_string(),
            content: Some("unsaved text".to_string()),
            is_dirty: true,
        }],
        explorer_root: Some("C:/work".to_string()),
        expanded_paths: vec!["C:/work/src".to_string()],
        theme: Some("dark".to_string()),
        sidebar_collapsed: true,
        sidebar_width: Some(320),
        window_state: Some(SessionWindowState {
            x: 80,
            y: 60,
            width: 1200,
            height: 820,
            maximized: false,
        }),
    }
}

#[test]
fn session_preview_strips_tab_content() {
    let snapshot = snapshot_with_content();
    let preview = SessionPreview::from(&snapshot);
    let json = serde_json::to_string(&preview).expect("serialize preview");

    assert!(!json.contains("content"));
    assert!(json.contains("scratch.txt"));
    assert!(json.contains("isDirty"));
}

#[test]
fn session_preview_roundtrips_to_snapshot_without_content() {
    let snapshot = snapshot_with_content();
    let preview = SessionPreview::from(&snapshot);
    let restored = SessionSnapshot::from(preview);

    assert_eq!(restored.tabs.len(), 1);
    assert_eq!(restored.tabs[0].filename, "scratch.txt");
    assert_eq!(restored.tabs[0].content, None);
    assert!(restored.tabs[0].is_dirty);
    assert_eq!(restored.theme, Some("dark".to_string()));
    assert!(restored.sidebar_collapsed);
    assert_eq!(restored.sidebar_width, Some(320));
    assert_eq!(
        restored.window_state,
        Some(SessionWindowState {
            x: 80,
            y: 60,
            width: 1200,
            height: 820,
            maximized: false,
        })
    );
}

#[test]
fn stage_session_replaces_cached_snapshot() {
    let cache = SessionCache::default();
    let first = snapshot_with_content();
    let mut second = snapshot_with_content();
    second.active_index = 3;

    stage_session(&cache, &first).expect("stage first");
    stage_session(&cache, &second).expect("stage second");

    let staged = cache
        .0
        .lock()
        .expect("lock cache")
        .clone()
        .expect("snapshot");
    assert_eq!(staged.active_index, 3);
}
