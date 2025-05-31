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
}

const googleDriveService = new GoogleDriveService();
export default googleDriveService;
