// Runepad | Module: encoding | Depends on: encoding_rs

use encoding_rs::{Encoding, UTF_16BE, UTF_16LE, UTF_8, GB18030, GBK, BIG5, EUC_KR, SHIFT_JIS, WINDOWS_1252};

const UTF8_BOM: &[u8] = &[0xEF, 0xBB, 0xBF];

/// Decode file bytes to Unicode text and return a user-facing encoding label.
pub fn decode_file_content(bytes: &[u8]) -> Result<(String, String), String> {
    if bytes.is_empty() {
        return Ok((String::new(), "UTF-8".to_string()));
    }

    if let Some((encoding, bom_len)) = Encoding::for_bom(bytes) {
        let (decoded, _, had_errors) = encoding.decode(&bytes[bom_len..]);
        if had_errors {
            return Err(
                "Failed to decode file: data is invalid for the detected BOM encoding.".to_string(),
            );
        }
        return Ok((decoded.into_owned(), bom_encoding_label(encoding)));
    }

    if let Ok(text) = std::str::from_utf8(bytes) {
        return Ok((text.to_string(), "UTF-8".to_string()));
    }

    for (encoding, label) in DETECTION_CANDIDATES {
        let (decoded, _, had_errors) = encoding.decode(bytes);
        if !had_errors {
            return Ok((decoded.into_owned(), label.to_string()));
        }
    }

    Err(
        "Could not detect file encoding. Try saving as UTF-8 or specify a supported encoding."
            .to_string(),
    )
}

/// Encode Unicode text for writing using the tab's encoding label.
pub fn encode_file_content(content: &str, encoding: &str) -> Result<Vec<u8>, String> {
    match encoding {
        "UTF-8" => Ok(content.as_bytes().to_vec()),
        "UTF-8-BOM" => {
            let mut out = Vec::with_capacity(UTF8_BOM.len() + content.len());
            out.extend_from_slice(UTF8_BOM);
            out.extend_from_slice(content.as_bytes());
            Ok(out)
        }
        "UTF-16 LE" | "UTF-16LE" => encode_with(UTF_16LE, content),
        "UTF-16 BE" | "UTF-16BE" => encode_with(UTF_16BE, content),
        label => {
            let enc = encoding_from_label(label)?;
            encode_with(enc, content)
        }
    }
}

fn encode_with(encoding: &'static Encoding, content: &str) -> Result<Vec<u8>, String> {
    let (encoded, _, had_errors) = encoding.encode(content);
    if had_errors {
        return Err(format!(
            "Failed to encode file as {}: character cannot be represented.",
            encoding.name()
        ));
    }
    Ok(encoded.into_owned())
}

fn bom_encoding_label(encoding: &'static Encoding) -> String {
    if encoding == UTF_8 {
        "UTF-8-BOM".to_string()
    } else if encoding == UTF_16LE {
        "UTF-16 LE".to_string()
    } else if encoding == UTF_16BE {
        "UTF-16 BE".to_string()
    } else {
        encoding.name().to_string()
    }
}

const DETECTION_CANDIDATES: &[(&Encoding, &str)] = &[
    (GB18030, "GB18030"),
    (GBK, "GBK"),
    (BIG5, "Big5"),
    (SHIFT_JIS, "Shift_JIS"),
    (EUC_KR, "EUC-KR"),
    (WINDOWS_1252, "Windows-1252"),
];

fn encoding_from_label(label: &str) -> Result<&'static Encoding, String> {
    match label {
        "UTF-8" | "UTF-8-BOM" => Ok(UTF_8),
        "GBK" | "GB18030" => Ok(GB18030),
        "Big5" => Ok(BIG5),
        "Shift_JIS" => Ok(SHIFT_JIS),
        "EUC-KR" => Ok(EUC_KR),
        "Windows-1252" => Ok(WINDOWS_1252),
        "UTF-16 LE" | "UTF-16LE" => Ok(UTF_16LE),
        "UTF-16 BE" | "UTF-16BE" => Ok(UTF_16BE),
        other => Err(format!("Unsupported encoding: {other}")),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn decodes_utf8() {
        let (text, enc) = decode_file_content(b"hello").expect("decode");
        assert_eq!(text, "hello");
        assert_eq!(enc, "UTF-8");
    }

    #[test]
    fn decodes_utf8_bom() {
        let (text, enc) = decode_file_content(b"\xef\xbb\xbfhi").expect("decode");
        assert_eq!(text, "hi");
        assert_eq!(enc, "UTF-8-BOM");
    }

    #[test]
    fn roundtrip_gbk() {
        let original = "中文测试";
        let (encoded, _, _) = GBK.encode(original);
        let bytes = encoded.into_owned();
        let (decoded, enc) = decode_file_content(&bytes).expect("decode");
        assert_eq!(decoded, original);
        assert!(enc == "GBK" || enc == "GB18030");
    }

    #[test]
    fn encodes_gbk_on_write() {
        let bytes = encode_file_content("中文", "GBK").expect("encode");
        let (decoded, enc) = decode_file_content(&bytes).expect("decode");
        assert_eq!(decoded, "中文");
        assert!(enc == "GBK" || enc == "GB18030");
    }
}
