import pathlib
import subprocess
import sys
import zipfile


def main():
    if len(sys.argv) < 4:
        raise SystemExit("Usage: batch.py input_dir output.zip operation [args...]")

    input_dir = pathlib.Path(sys.argv[1])
    output_zip = pathlib.Path(sys.argv[2])
    operation = sys.argv[3]
    args = sys.argv[4:]
    output_dir = output_zip.parent / "output"
    output_dir.mkdir(exist_ok=True)

    for input_path in sorted(input_dir.glob("*.pdf")):
        output_path = output_dir / output_name(input_path.name, operation)

        if operation == "ocr":
            command = [
                "ocrmypdf",
                "--skip-text",
                "--deskew",
                "--rotate-pages",
                "--optimize",
                "3",
                str(input_path),
                str(output_path),
            ]
        elif operation == "compress":
            optimize_level = args[0] if args else "3"
            command = [
                "ocrmypdf",
                "--skip-text",
                "--optimize",
                optimize_level,
                "--output-type",
                "pdf",
                str(input_path),
                str(output_path),
            ]
        else:
            raise SystemExit(f"Unsupported batch operation: {operation}")

        subprocess.run(command, check=True)

    with zipfile.ZipFile(output_zip, "w", compression=zipfile.ZIP_DEFLATED) as archive:
        for output_path in sorted(output_dir.glob("*.pdf")):
            archive.write(output_path, output_path.name)


def output_name(name, operation):
    base = pathlib.Path(name).stem
    return f"{base}-{operation}.pdf"


if __name__ == "__main__":
    main()
