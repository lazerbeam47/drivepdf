import { useContext } from "react";
import { GoogleDriveContext } from "../components/googleDriveContext";

export function useGoogleDrive() {
  const context = useContext(GoogleDriveContext);
  if (!context) {
    throw new Error("useGoogleDrive must be used inside GoogleDriveProvider.");
  }
  return context;
}
