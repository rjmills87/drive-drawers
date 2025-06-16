import googleDriveAuth from "./googleDriveAuth";

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: number;
  modifiedTime?: string;
  iconLink?: string;
  isFolder: boolean;
  parentId?: string;
}

interface GoogleDriveFileResponse {
  id: string;
  name: string;
  mimeType: string;
  size?: string | number;
  modifiedTime?: string;
  iconLink?: string;
  parents?: string[];
}

interface GoogleDriveListResponse {
  files: GoogleDriveFileResponse[];
}

class GoogleDriveService {
  private baseUrl = "https://www.googleapis.com/drive/v3";

  /**
   * checkAuthStatus
   */
  public async checkAuthStatus(): Promise<boolean> {
    return googleDriveAuth.isAuthenticated();
  }

  public async listFiles(folderId: string = "root"): Promise<DriveFile[]> {
    try {
      // Get the authentication token
      console.log("Checking authentication status...");
      const isAuthenticated = await googleDriveAuth.isAuthenticated();
      console.log("Is authenticated:", isAuthenticated);

      console.log("Getting token...");
      const token = await googleDriveAuth.getToken();
      console.log("Token received:", !!token); // Log whether token exists, not the actual token
      console.log("Token type:", typeof token);
      if (token) {
        console.log("Token length:", token.length);
        console.log("Token first 10 chars:", token.substring(0, 10) + "...");
      }

      if (!token) {
        console.error("Authentication failed: No token available");
        throw new Error("Not authenticated");
      }

      // Build query to get files in the specified folder
      const query = `'${folderId}' in parents and trashed = false`;

      // Fields we want to retrieve
      const fields = "files(id,name,mimeType,size,modifiedTime,iconLink)";

      // Make the API request
      console.log("Making API request to Google Drive...");
      const url = `${this.baseUrl}/files?q=${encodeURIComponent(
        query
      )}&fields=${encodeURIComponent(fields)}&pageSize=100`;
      console.log("Request URL:", url);

      try {
        console.log(
          "Authorization header:",
          `Bearer ${token.substring(0, 10)}...`
        );
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("Response status:", response.status, response.statusText);

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Error response:", errorText);
          throw new Error(
            `Failed to fetch files: ${response.status} ${response.statusText} - ${errorText}`
          );
        }

        const data = (await response.json()) as GoogleDriveListResponse;
        console.log("Files received:", data.files.length);

        // Transform the response into our DriveFile format
        return data.files.map((file: GoogleDriveFileResponse) => ({
          id: file.id,
          name: file.name,
          mimeType: file.mimeType,
          size:
            typeof file.size === "string" ? parseInt(file.size, 10) : file.size,
          modifiedTime: file.modifiedTime,
          iconLink: file.iconLink,
          isFolder: file.mimeType === "application/vnd.google-apps.folder",
          parentId: folderId !== "root" ? folderId : undefined,
        }));
      } catch (error) {
        console.error("Error making API request:", error);
        throw error;
      }
    } catch (error) {
      console.error("Error listing files:", error);
      throw error;
    }
  }

  public async getFile(fileId: string): Promise<DriveFile> {
    try {
      const token = await googleDriveAuth.getToken();

      if (!token) {
        throw new Error("Not Authenticated");
      }

      const fields = "id,name,mimeType,size,modifiedTime,iconLink,parents";

      const response = await fetch(
        `${this.baseUrl}/files/${fileId}?fields=${encodeURIComponent(fields)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        id: data.id,
        name: data.name,
        mimeType: data.mimeType,
        size: data.size,
        modifiedTime: data.modifiedTime,
        iconLink: data.iconLink,
        isFolder: data.mimeType === "application/vnd.google-apps.folder",
        parentId: data.parents?.[0],
      };
    } catch (error) {
      console.error("Error getting file", error);
      throw error;
    }
  }

  public async searchFiles(query: string): Promise<DriveFile[]> {
    try {
      const token = await googleDriveAuth.getToken();
      if (!token) {
        throw new Error("Not authenticated");
      }

      const searchQuery = `name contains '${query}' and trashed = false`;

      const fields =
        "files(id,name,mimeType,size,modifiedTime,iconLink,parents)";

      const response = await fetch(
        `${this.baseUrl}/files?q=${encodeURIComponent(
          searchQuery
        )}&fields=${encodeURIComponent(fields)}&pageSize=100`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch files from search query: ${response.statusText}`
        );
      }

      const data = (await response.json()) as GoogleDriveListResponse;
      return data.files.map((file: GoogleDriveFileResponse) => ({
        id: file.id,
        name: file.name,
        mimeType: file.mimeType,
        size:
          typeof file.size === "string" ? parseInt(file.size, 10) : file.size,
        modifiedTime: file.modifiedTime,
        iconLink: file.iconLink,
        isFolder: file.mimeType === "application/vnd.google-apps.folder",
        parentId: file.parents?.[0],
      }));
    } catch (error) {
      console.error("Error searching for files", error);
      throw error;
    }
  }

  public async getFilePreviewUrl(
    id: string,
    mimeType: string
  ): Promise<string> {
    try {
      // Get auth token
      const token = await googleDriveAuth.getToken();

      if (!token) {
        throw new Error("Not Authenticated");
      }
      // Check if file is from Google Workspace
      if (mimeType.startsWith("application/vnd.google-apps.")) {
        // Handle Google Workspace File formats
        const exportFormats: Record<string, string> = {
          "application/vnd.google-apps.document": "application/pdf",
          "application/vnd.google-apps.spreadsheet": "application/pdf",
          "application/vnd.google-apps.presentation": "application/pdf",
          "application/vnd.google-apps.drawing": "image/png",
        };

        const exportFormat = exportFormats[mimeType] || "application/pdf";

        return `${
          this.baseUrl
        }/files/${id}/export?mimeType=${encodeURIComponent(
          exportFormat
        )}&access_token=${token}`;
      }
      return `${this.baseUrl}/files/${id}?alt=media&access_token=${token}`;
    } catch (error) {
      console.error("Failed to retrieve file URL", error);
      throw error;
    }
  }

  async getFileForPreview(fileId: string, mimeType: string): Promise<Blob> {
    const token = await googleDriveAuth.getToken();
    if (!token) throw new Error("Not authenticated");

    // For Google Workspace files, export them to a viewable format
    if (mimeType.startsWith("application/vnd.google-apps.")) {
      let exportMimeType = "application/pdf"; // Default to PDF

      // Adjust export format based on file type
      if (mimeType === "application/vnd.google-apps.spreadsheet") {
        exportMimeType =
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
      } else if (mimeType === "application/vnd.google-apps.document") {
        exportMimeType = "application/pdf";
      } else if (mimeType === "application/vnd.google-apps.presentation") {
        exportMimeType = "application/pdf";
      } else if (mimeType === "application/vnd.google-apps.drawing") {
        exportMimeType = "image/png";
      }

      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=${encodeURIComponent(
          exportMimeType
        )}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to export file: ${response.status}`);
      }

      return await response.blob();
    } else {
      // For regular files, download directly
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to download file: ${response.status}`);
      }

      return await response.blob();
    }
  }

  async getViewerUrl(fileId: string, mimeType: string): Promise<string> {
    if (mimeType.startsWith("application/vnd.google-apps.")) {
      // For Google Docs, use the native viewer
      return `https://drive.google.com/file/d/${fileId}/preview`;
    } else if (mimeType === "application/pdf") {
      // For PDFs, use Google Drive's PDF viewer directly
      return `https://drive.google.com/file/d/${fileId}/preview`;
    } else {
      // For other files, use Google Docs Viewer
      const token = await googleDriveAuth.getToken();
      if (!token) throw new Error("Not authenticated");
      const downloadUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&access_token=${token}`;
      return `https://docs.google.com/viewer?url=${encodeURIComponent(
        downloadUrl
      )}&embedded=true`;
    }
  }

  async uploadFile(file: File, folderId: string = "root"): Promise<DriveFile> {
    try {
      const isAuthenticated = await googleDriveAuth.isAuthenticated();
      const token = await googleDriveAuth.getToken();

      if (!isAuthenticated || !token) {
        throw new Error("Not authenticated");
      }
      const boundary = "boundary" + Math.random().toString().slice(2);
      const delimiter = `--${boundary}`;
      const closeDelimiter = `--${boundary}--`;

      // Create the multipart request body
      let requestBody = "";
      requestBody += delimiter + "\r\n";
      requestBody += "Content-Type: application/json; charset=UTF-8\r\n\r\n";
      requestBody +=
        JSON.stringify({
          name: file.name,
          mimeType: file.type || "application/octet-stream",
          parents: [folderId],
        }) + "\r\n";

      requestBody += delimiter + "\r\n";
      requestBody += `Content-Type: ${
        file.type || "application/octet-stream"
      }\r\n\r\n`;

      // Convert the text parts to a blob and combine with the file
      const requestBodyBlob = new Blob([requestBody]);
      const fileBlob = new Blob([file]);
      const endBlob = new Blob(["\r\n" + closeDelimiter]);

      // Combine all parts into one blob
      const multipartRequestBody = new Blob(
        [requestBodyBlob, fileBlob, endBlob],
        { type: "multipart/related; boundary=" + boundary }
      );

      const response = await fetch(
        `${this.baseUrl}/files?uploadType=multipart`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": `multipart/related; boundary=${boundary}`,
          },
          body: multipartRequestBody,
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to upload file: ${response.statusText}`);
      }

      // Get the file ID from the response
      const data = await response.json();
      return {
        id: data.id,
        name: data.name,
        mimeType: data.mimeType,
        size: data.size,
        modifiedTime: data.modifiedTime,
        iconLink: data.iconLink,
        isFolder: data.mimeType === "application/vnd.google-apps.folder",
        parentId: folderId !== "root" ? folderId : undefined,
      };
    } catch (error) {
      console.error("Failed to upload file", error);
      throw error;
    }
  }
}

const googleDriveService = new GoogleDriveService();
export default googleDriveService;
