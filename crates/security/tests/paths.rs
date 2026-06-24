use std::path::Path;

use vantadeck_security::resolve_within_root;

#[test]
fn resolves_relative_path_inside_project_root() {
    let root = Path::new("C:/Projects/Voidline");
    let resolved = resolve_within_root(root, Path::new("Art/Source")).expect("safe path");
    assert!(resolved.ends_with("Projects/Voidline/Art/Source"));
}

#[test]
fn rejects_parent_traversal_outside_project_root() {
    let root = Path::new("C:/Projects/Voidline");
    let error = resolve_within_root(root, Path::new("../../secrets.txt"))
        .expect_err("traversal must be rejected");
    assert_eq!(error.code(), "PATH_OUTSIDE_ROOT");
}

#[test]
fn rejects_absolute_project_paths() {
    // Absolute paths must be machine-local overrides, never stored in the
    // portable project config. What counts as absolute is OS-specific, so the
    // test uses a path that is genuinely absolute on the host it runs on.
    #[cfg(windows)]
    let absolute = Path::new("D:/Other/file");
    #[cfg(not(windows))]
    let absolute = Path::new("/Other/file");
    let error = resolve_within_root(Path::new("C:/Projects/Voidline"), absolute)
        .expect_err("absolute paths must be machine-local overrides");
    assert_eq!(error.code(), "ABSOLUTE_PROJECT_PATH");
}

#[test]
fn verifies_downloaded_artifact_sha256() {
    let root = tempfile::tempdir().expect("artifact directory");
    let artifact = root.path().join("tool.zip");
    std::fs::write(&artifact, b"vantadeck tool artifact").expect("artifact");

    vantadeck_security::verify_sha256(
        &artifact,
        "25941ca9675c92b3abee5fee623717d257c9475653c69d0fb2e233370d62cb1b",
    )
    .expect("matching checksum");
}

#[test]
fn rejects_tampered_artifact() {
    let root = tempfile::tempdir().expect("artifact directory");
    let artifact = root.path().join("tool.zip");
    std::fs::write(&artifact, b"tampered").expect("artifact");

    let error = vantadeck_security::verify_sha256(
        &artifact,
        "b10e6950886439f91406e1f1dd68dc75088612b849c3bed9bb1856a1c84686ee",
    )
    .expect_err("tampering must be detected");
    assert!(matches!(
        error,
        vantadeck_security::ArtifactVerificationError::ChecksumMismatch { .. }
    ));
}
