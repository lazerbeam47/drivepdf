import subprocess
import sys


def main():
    if len(sys.argv) != 4:
        raise SystemExit("Usage: compress.py input.pdf output.pdf optimize_level")

    input_path = sys.argv[1]
    output_path = sys.argv[2]
    optimize_level = sys.argv[3]
    subprocess.run(
        [
            "ocrmypdf",
            "--skip-text",
            "--optimize",
            optimize_level,
            "--output-type",
            "pdf",
            input_path,
            output_path,
        ],
        check=True,
    )


if __name__ == "__main__":
    main()
