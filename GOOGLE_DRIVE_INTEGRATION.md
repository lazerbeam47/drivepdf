# Google Drive Integration

DrivePDF uses Google Identity Services, Google Picker, and the Google Drive API from the browser.

## Frontend setup

Create a Google Cloud project, then:

1. Enable the Google Drive API and Google Picker API.
2. Configure the OAuth consent screen.
3. Create an OAuth 2.0 Client ID for a Web application.
4. Add your local and production origins, for example `http://127.0.0.1:5173`.
5. Create an API key restricted to the Google Picker API and your app origins.
6. Copy `.env.example` to `.env.local` and set:

```bash
VITE_GOOGLE_CLIENT_ID=your-google-oauth-client-id.apps.googleusercontent.com
VITE_GOOGLE_API_KEY=your-google-api-key
VITE_GOOGLE_APP_ID=your-google-cloud-project-number
```

The app requests:

- `https://www.googleapis.com/auth/drive.file` for files users select or create with DrivePDF
- `https://www.googleapis.com/auth/drive.readonly` for Premium Drive Sync listing and importing PDFs

## Current app behavior

- The uploader shows a `Connect Drive` / `Import from Drive` button.
- Google Picker is filtered to PDFs.
- Picked PDFs are downloaded into browser memory as `File` objects and processed by the existing client-side tools.
- After a tool creates an output PDF, the sidebar shows both `Download result` and `Save to Google Drive`.
- Saving uses a multipart `files.create` upload to Drive and returns a link to open the saved file.

## Backend API option

The current implementation does not require a backend because it uses short-lived browser access tokens. Add a backend when you need refresh tokens, audit logging, resumable uploads for large PDFs, or stricter control over Drive API calls.

Suggested endpoints:

```txt
POST /api/google/oauth/exchange
Body: { code, redirectUri }
Returns: a secure session cookie; store refresh tokens server-side only.

POST /api/google/drive/upload
Body: multipart form data with the processed PDF
Server: uses the stored refresh token to upload with Drive API files.create.

GET /api/google/drive/download/:fileId
Server: streams a selected Drive PDF through your API if you do not want browser tokens calling Drive directly.
```

For larger files, prefer Drive resumable uploads instead of multipart upload.

## References

- Google Identity Services for web OAuth tokens: https://developers.google.com/identity/protocols/oauth2/javascript-implicit-flow
- Google Picker API overview: https://developers.google.com/drive/picker/guides/overview
- Drive API upload guide: https://developers.google.com/drive/api/guides/manage-uploads
