import { google } from 'googleapis';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const CLIENT_ID = process.env.CLIENT_ID!;
const CLIENT_SECRET = process.env.CLIENT_SECRET!;
const REDIRECT_URI = process.env.REDIRECT_URI!;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN!;

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

const drive = google.drive({
  version: 'v3',
  auth: oauth2Client,
});

export const getFileFromDrive = async (fileName: string, folderId: string) => {
  const res = await drive.files.list({
    q: `'${folderId}' in parents and name='${fileName}' and trashed=false`,
    fields: 'files(id, webViewLink, webContentLink)',
    spaces: 'drive',
  });
  return res.data.files?.[0] || null;
};

export const uploadToDrive = async (filePath: string, fileName: string, folderId: string, mimeType: string) => {
  try {
    const fileMetadata = {
      name: fileName,
      parents: [folderId],
    };
    const media = {
      mimeType,
      body: fs.createReadStream(filePath),
    };

    const response = await drive.files.create({
      requestBody: fileMetadata,
      media,
      fields: 'id, webViewLink, webContentLink',
    });

    console.log('File uploaded, ID:', response.data.id);
    return response.data;
  } catch (error) {
    console.error('Drive upload error:', error);
    throw error;
  }
};
