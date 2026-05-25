use super::*;
use std::fs;

fn temp_file(name: &str) -> std::path::PathBuf {
    std::env::temp_dir().join(format!("runepad_file_ops_{}_{}", std::process::id(), name))
}

#[tokio::test]
async fn reads_utf8_file_with_line_ending_metadata() {
    let path = temp_file("read_crlf.txt");
    fs::write(&path, "a\r\nb").expect("write fixture");

    let result = read_file(path.to_string_lossy().into_owned())
        .await
        .expect("read file");

    assert_eq!(result.content, "a\r\nb");
    assert_eq!(result.encoding, "UTF-8");
    assert_eq!(result.line_ending, "CRLF");
    let _ = fs::remove_file(path);
}

#[tokio::test]
async fn writes_file_with_requested_crlf_endings() {
    let path = temp_file("write_crlf.txt");

    write_file(
        path.to_string_lossy().into_owned(),
        "a\nb".to_string(),
        Some("UTF-8".to_string()),
        Some("CRLF".to_string()),
    )
    .await
    .expect("write file");

    let bytes = fs::read(&path).expect("read written file");
    assert_eq!(String::from_utf8(bytes).expect("utf8"), "a\r\nb");
    let _ = fs::remove_file(path);
}

#[tokio::test]
async fn rejects_files_larger_than_ten_mb() {
    let path = temp_file("large.txt");
    fs::write(&path, vec![b'x'; (MAX_FILE_SIZE + 1) as usize]).expect("write large fixture");

    let err = read_file(path.to_string_lossy().into_owned())
        .await
        .expect_err("large files should be rejected");

    assert!(err.contains("larger than 10MB"));
    let _ = fs::remove_file(path);
}
