import { useCallback, useMemo, useState } from "react";
import {
  downloadDrivePdf,
  hasGoogleDriveConfig,
  listDrivePdfs,
  openDrivePicker,
  requestDriveToken,
  uploadPdfToDrive,
} from "../lib/googleDrive";
import { GoogleDriveContext } from "./googleDriveContext";

export function GoogleDriveProvider({ children }) {
  const [accessToken, setAccessToken] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const configured = hasGoogleDriveConfig();

  const connect = useCallback(async () => {
    setBusy(true);
    setError("");
    try {
      const token = await requestDriveToken(accessToken ? "" : "consent");
      setAccessToken(token);
      return token;
    } catch (err) {
      setError(err.message || "Google Drive connection failed.");
      throw err;
    } finally {
      setBusy(false);
    }
  }, [accessToken]);

  const getToken = useCallback(async () => accessToken || connect(), [accessToken, connect]);

  const importPdfFiles = useCallback(
    async ({ multiple = true } = {}) => {
      setBusy(true);
      setError("");
      try {
        const token = await getToken();
        const docs = await openDrivePicker(token, multiple);
        return Promise.all(docs.map((doc) => downloadDrivePdf(token, doc)));
      } catch (err) {
        setError(err.message || "Unable to import from Google Drive.");
        throw err;
      } finally {
        setBusy(false);
      }
    },
    [getToken],
  );

  const savePdfFile = useCallback(
    async ({ bytes, name }) => {
      setBusy(true);
      setError("");
      try {
        const token = await getToken();
        return uploadPdfToDrive(token, bytes, name);
      } catch (err) {
        setError(err.message || "Unable to save to Google Drive.");
        throw err;
      } finally {
        setBusy(false);
      }
    },
    [getToken],
  );

  const listPdfFiles = useCallback(async () => {
    setBusy(true);
    setError("");
    try {
      const token = await getToken();
      return listDrivePdfs(token);
    } catch (err) {
      setError(err.message || "Unable to sync Google Drive.");
      throw err;
    } finally {
      setBusy(false);
    }
  }, [getToken]);

  const value = useMemo(
    () => ({
      busy,
      configured,
      connected: Boolean(accessToken),
      error,
      clearError: () => setError(""),
      connect,
      importPdfFiles,
      savePdfFile,
      listPdfFiles,
    }),
    [accessToken, busy, configured, connect, error, importPdfFiles, listPdfFiles, savePdfFile],
  );

  return <GoogleDriveContext.Provider value={value}>{children}</GoogleDriveContext.Provider>;
}
