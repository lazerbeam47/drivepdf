const DRIVE_SCOPE =
  "https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.readonly";
const DISCOVERY_DOC = "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest";

let gisScriptPromise;
let gapiScriptPromise;
let pickerPromise;

export const googleDriveConfig = {
  clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
  apiKey: import.meta.env.VITE_GOOGLE_API_KEY,
  appId: import.meta.env.VITE_GOOGLE_APP_ID,
  scope: DRIVE_SCOPE,
};

export function hasGoogleDriveConfig() {
  return Boolean(
    googleDriveConfig.clientId && googleDriveConfig.apiKey && googleDriveConfig.appId,
  );
}

export async function loadGoogleDriveApis() {
  if (!hasGoogleDriveConfig()) {
    throw new Error("Google Drive is not configured. Add VITE_GOOGLE_CLIENT_ID, VITE_GOOGLE_API_KEY, and VITE_GOOGLE_APP_ID.");
  }

  await Promise.all([
    loadScript("https://accounts.google.com/gsi/client", "gis-script"),
    loadScript("https://apis.google.com/js/api.js", "gapi-script"),
  ]);

  await loadPickerApi();
}

export async function requestDriveToken(prompt = "consent") {
  await loadGoogleDriveApis();

  return new Promise((resolve, reject) => {
    const tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: googleDriveConfig.clientId,
      scope: googleDriveConfig.scope,
      prompt,
      callback: (response) => {
        if (response.error) {
          reject(new Error(response.error_description || response.error));
          return;
        }
        resolve(response.access_token);
      },
      error_callback: () => reject(new Error("Google sign-in was closed before finishing.")),
    });

    tokenClient.requestAccessToken();
  });
}

export async function openDrivePicker(accessToken, multiple = true) {
  await loadGoogleDriveApis();

  return new Promise((resolve, reject) => {
    const view = new window.google.picker.DocsView(window.google.picker.ViewId.PDFS)
      .setMimeTypes("application/pdf")
      .setIncludeFolders(false);

    const picker = new window.google.picker.PickerBuilder()
      .setAppId(googleDriveConfig.appId)
      .setOAuthToken(accessToken)
      .setDeveloperKey(googleDriveConfig.apiKey)
      .addView(view)
      .enableFeature(window.google.picker.Feature.NAV_HIDDEN)
      .setCallback((data) => {
        const action = data[window.google.picker.Response.ACTION];

        if (action === window.google.picker.Action.CANCEL) {
          resolve([]);
          return;
        }

        if (action === window.google.picker.Action.PICKED) {
          resolve(data[window.google.picker.Response.DOCUMENTS] || []);
        }
      });

    if (multiple) {
      picker.enableFeature(window.google.picker.Feature.MULTISELECT_ENABLED);
    }

    try {
      picker.build().setVisible(true);
    } catch (error) {
      reject(error);
    }
  });
}

export async function downloadDrivePdf(accessToken, doc) {
  const id = doc[window.google.picker.Document.ID];
  const name = doc[window.google.picker.Document.NAME] || "drive-file.pdf";
  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(id)}?alt=media`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error(`Unable to download ${name} from Google Drive.`);
  }

  return new File([await response.blob()], name.endsWith(".pdf") ? name : `${name}.pdf`, {
    type: "application/pdf",
  });
}

export async function uploadPdfToDrive(accessToken, bytes, name) {
  const metadata = {
    name,
    mimeType: "application/pdf",
  };
  const boundary = `drivepdf_${crypto.randomUUID()}`;
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;
  const body = new Blob(
    [
      delimiter,
      "Content-Type: application/json; charset=UTF-8\r\n\r\n",
      JSON.stringify(metadata),
      delimiter,
      "Content-Type: application/pdf\r\n\r\n",
      bytes,
      closeDelimiter,
    ],
    { type: `multipart/related; boundary=${boundary}` },
  );

  const response = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body,
    },
  );

  if (!response.ok) {
    throw new Error("Unable to save this PDF to Google Drive.");
  }

  return response.json();
}

export async function listDrivePdfs(accessToken) {
  const params = new URLSearchParams({
    q: "mimeType='application/pdf' and trashed=false",
    fields: "files(id,name,size,modifiedTime,webViewLink)",
    orderBy: "modifiedTime desc",
    pageSize: "20",
  });
  const response = await fetch(`https://www.googleapis.com/drive/v3/files?${params}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error("Unable to sync Google Drive PDFs.");
  }

  const data = await response.json();
  return data.files || [];
}

function loadScript(src, id) {
  if (id === "gis-script" && gisScriptPromise) return gisScriptPromise;
  if (id === "gapi-script" && gapiScriptPromise) return gapiScriptPromise;

  const existing = document.getElementById(id);
  const promise =
    existing?.dataset.loaded === "true"
      ? Promise.resolve()
      : new Promise((resolve, reject) => {
          const script = existing || document.createElement("script");
          script.id = id;
          script.src = src;
          script.async = true;
          script.defer = true;
          script.onload = () => {
            script.dataset.loaded = "true";
            resolve();
          };
          script.onerror = () => reject(new Error(`Unable to load ${src}`));
          if (!existing) document.head.appendChild(script);
        });

  if (id === "gis-script") gisScriptPromise = promise;
  if (id === "gapi-script") gapiScriptPromise = promise;
  return promise;
}

function loadPickerApi() {
  if (pickerPromise) return pickerPromise;

  pickerPromise = new Promise((resolve) => {
    window.gapi.load("client:picker", async () => {
      await window.gapi.client.init({
        apiKey: googleDriveConfig.apiKey,
        discoveryDocs: [DISCOVERY_DOC],
      });
      resolve();
    });
  });

  return pickerPromise;
}
