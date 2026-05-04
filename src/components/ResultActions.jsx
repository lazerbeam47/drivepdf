import { Button } from "./Button";
import { SaveToDriveButton } from "./GoogleDriveButtons";
import { downloadBytes } from "../lib/utils";

export function ResultActions({ bytes, fileName, downloadLabel = "Download result" }) {
  return (
    <div className="mt-3">
      <Button
        className="w-full"
        variant="secondary"
        disabled={!bytes}
        onClick={() => downloadBytes(bytes, fileName)}
      >
        {downloadLabel}
      </Button>
      <SaveToDriveButton bytes={bytes} fileName={fileName} />
    </div>
  );
}
