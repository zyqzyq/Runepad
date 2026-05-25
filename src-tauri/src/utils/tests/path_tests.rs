use super::*;
use std::fs;
use std::io::Write;

#[test]
fn rejects_parent_traversal() {
    assert!(validate_user_path("../secret.txt").is_err());
}

#[test]
fn detect_crlf() {
    assert_eq!(detect_line_ending("a\r\nb"), "CRLF");
    assert_eq!(detect_line_ending("a\nb"), "LF");
}

#[test]
fn normalizes_requested_line_endings() {
    assert_eq!(
        normalize_line_endings("a\r\nb\nc", Some("CRLF")),
        "a\r\nb\r\nc"
    );
    assert_eq!(normalize_line_endings("a\r\nb", Some("LF")), "a\nb");
    assert_eq!(normalize_line_endings("a\r\nb", None), "a\nb");
}

#[test]
fn temp_file_roundtrip() {
    let dir = std::env::temp_dir();
    let file_path = dir.join(format!("runepad_test_{}.txt", std::process::id()));
    {
        let mut f = fs::File::create(&file_path).expect("create");
        writeln!(f, "hello").expect("write");
    }
    let read = validate_user_path(file_path.to_str().expect("utf8"));
    assert!(read.is_ok());
    let _ = fs::remove_file(file_path);
}
