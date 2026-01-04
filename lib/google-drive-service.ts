// Google Drive service for storing custom design images
// This service uploads custom t-shirt design images to Google Drive

export interface CustomDesignUpload {
  orderId: string;
  customerEmail: string;
  designImage: string; // Base64 image data
  fileName: string;
}

export class GoogleDriveService {
  // Upload custom design image to Google Drive
  static async uploadCustomDesign(uploadData: CustomDesignUpload): Promise<string | null> {
    try {
      console.log('📤 Uploading custom design to Google Drive:', {
        orderId: uploadData.orderId,
        customerEmail: uploadData.customerEmail,
        fileName: uploadData.fileName
      });

      // Call our API route to handle the Google Drive upload
      const response = await fetch('/api/upload-to-drive', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(uploadData)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Custom design uploaded successfully:', result);
        return result.fileId;
      } else {
        const error = await response.json();
        console.error('❌ Failed to upload custom design:', error);
        return null;
      }

    } catch (error) {
      console.error('❌ Error uploading custom design:', error);
      return null;
    }
  }

  // Generate file name for custom design
  static generateFileName(orderId: string, customerEmail: string): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const emailPrefix = customerEmail.split('@')[0];
    return `custom-design-${orderId}-${emailPrefix}-${timestamp}.png`;
  }
}