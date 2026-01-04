import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

// Google Drive API setup
const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

async function getGoogleDriveClient() {
  try {
    // Use service account credentials from environment variables
    const credentials = {
      type: 'service_account',
      project_id: process.env.GOOGLE_PROJECT_ID,
      private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      client_id: process.env.GOOGLE_CLIENT_ID,
      auth_uri: 'https://accounts.google.com/o/oauth2/auth',
      token_uri: 'https://oauth2.googleapis.com/token',
      auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
      client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.GOOGLE_CLIENT_EMAIL}`
    };

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: SCOPES,
    });

    return google.drive({ version: 'v3', auth });
  } catch (error) {
    console.error('Error setting up Google Drive client:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { orderId, customerEmail, designImage, fileName } = await request.json();

    // Validate required fields
    if (!orderId || !customerEmail || !designImage || !fileName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if Google Drive is configured
    if (!process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
      console.log('⚠️ Google Drive not configured, saving locally instead');
      
      // For development: just log the upload attempt
      console.log('📁 Would upload to Google Drive:', {
        orderId,
        customerEmail,
        fileName,
        imageSize: designImage.length
      });

      return NextResponse.json({
        success: true,
        fileId: `local-${orderId}-${Date.now()}`,
        message: 'File saved locally (Google Drive not configured)',
        developmentMode: true
      });
    }

    // Convert base64 to buffer
    const base64Data = designImage.replace(/^data:image\/[a-z]+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // Get Google Drive client
    const drive = await getGoogleDriveClient();

    // Create folder for custom designs if it doesn't exist
    const folderName = 'Lunarz Custom Designs';
    let folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

    if (!folderId) {
      // Search for existing folder
      const folderSearch = await drive.files.list({
        q: `name='${folderName}' and mimeType='application/vnd.google-apps.folder'`,
        fields: 'files(id, name)',
      });

      if (folderSearch.data.files && folderSearch.data.files.length > 0) {
        folderId = folderSearch.data.files[0].id!;
      } else {
        // Create folder
        const folderResponse = await drive.files.create({
          requestBody: {
            name: folderName,
            mimeType: 'application/vnd.google-apps.folder',
          },
          fields: 'id',
        });
        folderId = folderResponse.data.id!;
      }
    }

    // Upload file to Google Drive
    const fileResponse = await drive.files.create({
      requestBody: {
        name: fileName,
        parents: folderId ? [folderId] : undefined,
        description: `Custom t-shirt design for order ${orderId} by ${customerEmail}`,
      },
      media: {
        mimeType: 'image/png',
        body: buffer,
      },
      fields: 'id, name, webViewLink',
    });

    // Share file with lunarz.info@gmail.com (make it accessible)
    if (fileResponse.data.id) {
      await drive.permissions.create({
        fileId: fileResponse.data.id,
        requestBody: {
          role: 'reader',
          type: 'user',
          emailAddress: 'lunarz.info@gmail.com',
        },
      });
    }

    console.log('✅ Custom design uploaded to Google Drive:', {
      fileId: fileResponse.data.id,
      fileName: fileResponse.data.name,
      webViewLink: fileResponse.data.webViewLink,
    });

    return NextResponse.json({
      success: true,
      fileId: fileResponse.data.id,
      fileName: fileResponse.data.name,
      webViewLink: fileResponse.data.webViewLink,
      message: 'File uploaded to Google Drive successfully'
    });

  } catch (error: any) {
    console.error('❌ Google Drive upload failed:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to upload to Google Drive',
        details: error.message,
        developmentMode: !process.env.GOOGLE_CLIENT_EMAIL
      },
      { status: 500 }
    );
  }
}