import subprocess
import sys


def main():
    if len(sys.argv) != 3:
        raise SystemExit("Usage: ocr.py input.pdf output.pdf")

    input_path = sys.argv[1]
    output_path = sys.argv[2]
    subprocess.run(
        [
            "ocrmypdf",
            "--skip-text",
            "--deskew",
            "--rotate-pages",
            "--optimize",
            "3",
            input_path,
            output_path,
        ],
        check=True,
    )


if __name__ == "__main__":
    main()
