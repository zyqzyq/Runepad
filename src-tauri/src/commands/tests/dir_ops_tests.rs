use super::*;
use std::fs;

fn temp_dir(name: &str) -> std::path::PathBuf {
    let dir = std::env::temp_dir().join(format!("runepad_dir_ops_{}_{}", std::process::id(), name));
    let _ = fs::remove_dir_all(&dir);
    fs::create_dir_all(&dir).expect("create temp dir");
    dir
}

#[tokio::test]
async fn reads_entries_with_directories_first_then_names() {
    let dir = temp_dir("sorted");
    fs::create_dir_all(dir.join("z_folder")).expect("create folder");
    fs::write(dir.join("b.txt"), "b").expect("write b");
    fs::write(dir.join("a.txt"), "a").expect("write a");

    let entries = read_dir(dir.to_string_lossy().into_owned())
        .await
        .expect("read dir");

    let names: Vec<String> = entries.into_iter().map(|entry| entry.name).collect();
    assert_eq!(names, vec!["z_folder", "a.txt", "b.txt"]);
    let _ = fs::remove_dir_all(dir);
}

#[tokio::test]
async fn rejects_file_paths() {
    let dir = temp_dir("file_path");
    let file = dir.join("file.txt");
    fs::write(&file, "content").expect("write file");

    let err = read_dir(file.to_string_lossy().into_owned())
        .await
        .expect_err("files are not directories");

    assert_eq!(err, "Path is not a directory.");
    let _ = fs::remove_dir_all(dir);
}
