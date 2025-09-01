import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const AUTH_MODE = String(process.env.AUTH_MODE ?? 'oauth').trim().toLowerCase();

function requireEnv(name: string) {
  const v = process.env[name];
  if (!v || v.trim() === '') {
    throw new Error(`Missing env ${name} (AUTH_MODE=${AUTH_MODE}). Check your .env and restart the server.`);
  }
  return v;
}

function buildDriveClient() {
  // console.info(`[Drive] AUTH_MODE=${AUTH_MODE}`);

  if (AUTH_MODE === 'service') {
    const email = requireEnv('GSA_CLIENT_EMAIL');
    const rawKey = requireEnv('GSA_PRIVATE_KEY');
    const key = rawKey.includes('\\n') ? rawKey.replace(/\\n/g, '\n') : rawKey;

    const auth = new google.auth.JWT({
      email,
      key,
      scopes: ['https://www.googleapis.com/auth/drive'],
    });

    auth.authorize().then(() => {
      console.info(`[Drive] Service account ready as ${email}`);
    }).catch((e) => {
      console.error('[Drive] Service account authorize() failed:', e.message);
    });

    return google.drive({ version: 'v3', auth });
  }

  const oauth2Client = new google.auth.OAuth2(
    requireEnv('CLIENT_ID'),
    requireEnv('CLIENT_SECRET'),
    requireEnv('REDIRECT_URI')
  );
  const token = requireEnv('REFRESH_TOKEN').trim();
  oauth2Client.setCredentials({ refresh_token: token });
  return google.drive({ version: 'v3', auth: oauth2Client });
}

const drive = buildDriveClient();

async function ensurePublic(fileId: string) {
  try {
    await drive.permissions.create({
      fileId,
      requestBody: { role: 'reader', type: 'anyone' },
    });
  } catch (e: any) {
    if (e?.code !== 403) throw e;
  }
}

export function toPublicViewUrl(fileId: string) {
  return `https://drive.google.com/uc?export=view&id=${fileId}`;
}

export const getFileFromDrive = async (fileName: string, folderId: string) => {
  const res = await drive.files.list({
    q: `'${folderId}' in parents and name='${fileName}' and trashed=false`,
    fields: 'files(id, name, mimeType, webViewLink, webContentLink)',
    spaces: 'drive',
  });
  const file = res.data.files?.[0] || null;
  if (file?.id) await ensurePublic(file.id);
  return file;
};

export const uploadToDrive = async (
  filePath: string,
  fileName: string,
  folderId: string,
  mimeType: string
) => {
  try {
    const fileMetadata = { name: fileName, parents: [folderId] };
    const media = { mimeType, body: fs.createReadStream(filePath) };

    const res = await drive.files.create({
      requestBody: fileMetadata,
      media,
      fields: 'id, name, webViewLink, webContentLink',
    });

    const fileId = res.data.id!;
    await ensurePublic(fileId);
    const publicUrl = toPublicViewUrl(fileId);
    console.log('File uploaded:', { id: fileId, publicUrl });
    return { ...res.data, publicUrl };
  } catch (e: any) {
    if (e?.response?.data?.error === 'invalid_grant') {
      console.error('Drive upload error: OAuth refresh token expired/revoked (should not happen in AUTH_MODE=service).');
    } else {
      console.error('Drive upload error:', e?.message ?? e);
    }
    throw e;
  }
};
