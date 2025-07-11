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

  async uploadFile(
    file: File,
    folderId: string = "root",
    options?: { onProgress?: (progress: number) => void }
  ): Promise<DriveFile> {
    try {
      console.log("[UPLOAD] Starting file upload process...");
      console.log("[UPLOAD] File details:", {
        name: file.name,
        type: file.type,
        size: file.size,
      });

      const isAuthenticated = await googleDriveAuth.isAuthenticated();
      const token = await googleDriveAuth.getToken();

      if (!isAuthenticated || !token) {
        throw new Error("Not authenticated");
      }

      console.log("[UPLOAD] Authentication verified");

      // Return a promise that will be resolved when the upload is complete
      return new Promise((resolve, reject) => {
        try {
          // Step 1: Create the file with metadata
          console.log("[UPLOAD] Step 1: Creating file metadata");

          const metadata: {
            name: string;
            mimeType: string;
            parents?: string[];
          } = {
            name: file.name,
            mimeType: file.type || "application/octet-stream",
          };

          if (folderId !== "root") {
            metadata.parents = [folderId];
          }

          console.log("[UPLOAD] Metadata:", metadata);

          const xhr1 = new XMLHttpRequest();
          xhr1.open("POST", "https://www.googleapis.com/drive/v3/files");
          xhr1.setRequestHeader("Authorization", `Bearer ${token}`);
          xhr1.setRequestHeader("Content-Type", "application/json");

          xhr1.onreadystatechange = function () {
            console.log("[UPLOAD] Metadata XHR state change:", {
              readyState: this.readyState,
              status: this.status,
            });

            if (this.readyState === 4) {
              console.log("[UPLOAD] Metadata response:", this.responseText);
            }
          };

          xhr1.onload = function () {
            if (this.status >= 200 && this.status < 300) {
              try {
                console.log("[UPLOAD] Metadata creation successful");
                const fileData = JSON.parse(this.responseText);
                console.log("[UPLOAD] File created with ID:", fileData.id);

                // Step 2: Upload the content
                console.log("[UPLOAD] Step 2: Uploading file content");
                const xhr2 = new XMLHttpRequest();
                const uploadUrl = `https://www.googleapis.com/upload/drive/v3/files/${fileData.id}?uploadType=media`;
                console.log("[UPLOAD] Upload URL:", uploadUrl);

                xhr2.open("PATCH", uploadUrl);
                xhr2.setRequestHeader("Authorization", `Bearer ${token}`);
                xhr2.setRequestHeader(
                  "Content-Type",
                  file.type || "application/octet-stream"
                );

                xhr2.onreadystatechange = function () {
                  console.log("[UPLOAD] Content XHR state change:", {
                    readyState: this.readyState,
                    status: this.status,
                  });

                  if (this.readyState === 4) {
                    console.log(
                      "[UPLOAD] Content response:",
                      this.responseText
                    );
                  }
                };

                xhr2.upload.onprogress = (event) => {
                  if (event.lengthComputable) {
                    const percentComplete = (event.loaded / event.total) * 100;
                    console.log(
                      `[UPLOAD] Content upload progress: ${percentComplete.toFixed(
                        2
                      )}%`
                    );
                    options?.onProgress?.(percentComplete);
                  }
                };

                xhr2.onload = function () {
                  if (this.status >= 200 && this.status < 300) {
                    try {
                      console.log("[UPLOAD] Content upload successful");
                      const data = JSON.parse(this.responseText);
                      console.log(
                        "[UPLOAD] File content uploaded successfully:",
                        data
                      );

                      resolve({
                        id: data.id || fileData.id,
                        name: data.name || fileData.name,
                        mimeType: data.mimeType || fileData.mimeType,
                        size: data.size || file.size,
                        modifiedTime:
                          data.modifiedTime || new Date().toISOString(),
                        iconLink: data.iconLink || "",
                        isFolder:
                          (data.mimeType || fileData.mimeType) ===
                          "application/vnd.google-apps.folder",
                        parentId: folderId !== "root" ? folderId : undefined,
                      });
                    } catch (e) {
                      console.error(
                        "[UPLOAD] Error parsing content response:",
                        e
                      );
                      console.log(
                        "[UPLOAD] Raw response text:",
                        this.responseText
                      );

                      // Even if we can't parse the response, the upload might have succeeded
                      // Let's use the metadata we already have
                      resolve({
                        id: fileData.id,
                        name: fileData.name,
                        mimeType: fileData.mimeType,
                        size: file.size,
                        modifiedTime: new Date().toISOString(),
                        iconLink: "",
                        isFolder:
                          fileData.mimeType ===
                          "application/vnd.google-apps.folder",
                        parentId: folderId !== "root" ? folderId : undefined,
                      });
                    }
                  } else {
                    console.error(
                      "[UPLOAD] Content upload failed with status:",
                      this.status
                    );
                    console.error("[UPLOAD] Response:", this.responseText);
                    reject(
                      new Error(`Content upload failed: ${this.statusText}`)
                    );
                  }
                };

                xhr2.onerror = function (e) {
                  console.error(
                    "[UPLOAD] Network error during content upload:",
                    e
                  );
                  reject(new Error("Network error during content upload"));
                };

                // Send the file content
                console.log("[UPLOAD] Sending file content...");
                xhr2.send(file);
              } catch (e) {
                console.error("[UPLOAD] Error parsing metadata response:", e);
                reject(new Error("Invalid metadata response format"));
              }
            } else {
              console.error(
                "[UPLOAD] Metadata creation failed with status:",
                this.status
              );
              console.error("[UPLOAD] Response:", this.responseText);
              reject(new Error(`Metadata creation failed: ${this.statusText}`));
            }
          };

          xhr1.onerror = function (e) {
            console.error(
              "[UPLOAD] Network error during metadata creation:",
              e
            );
            reject(new Error("Network error during metadata creation"));
          };

          // Send the metadata request
          console.log("[UPLOAD] Sending metadata request...");
          xhr1.send(JSON.stringify(metadata));
        } catch (e) {
          console.error("[UPLOAD] Unexpected error in upload process:", e);
          reject(e);
        }
      });
    } catch (error) {
      console.error("[UPLOAD] Failed to upload file", error);
      throw error;
    }
  }

  async testUpload() {
    try {
      console.log("Uploading test file...");
      const testContent =
        "This is a test file created at " + new Date().toISOString();
      const testBlob = new Blob([testContent], { type: "text/plain" });
      const testFile = new File([testBlob], "test-upload.txt", {
        type: "text/plain",
      });
      console.log("Test file created");
      const file = await this.uploadFile(testFile, "root");
      console.log("File uploaded successfully");
      return file;
    } catch (error) {
      console.error("Failed to upload test file", error);
      return null;
    }
  }
}

const googleDriveService = new GoogleDriveService();
export default googleDriveService;
