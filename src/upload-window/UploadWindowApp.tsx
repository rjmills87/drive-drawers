import "../upload-window/UploadWindowApp.css";
import { useState, useRef, useEffect } from "react";
import googleDriveService from "../services/googleDriveServices";

export default function UploadWindow() {
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "uploading" | "success" | "error"
  >("idle");
  const [error, setError] = useState<string | null>(null);
  const [folderId, setFolderId] = useState<string>("root");

  // Extract folder ID from URL parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const folderIdParam = params.get("folderId");
    if (folderIdParam) {
      setFolderId(folderIdParam);
    }
  }, []);

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    // Handle Dropped files
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      Array.from(e.dataTransfer.files).forEach((file) => {
        handleUpload(file);
      });
    }
  };

  // Create ref for file input
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChooseFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      Array.from(e.target.files).forEach((file) => {
        handleUpload(file);
      });
    }
  };

  const handleUpload = async (file: File) => {
    setUploadStatus("uploading");
    setUploadProgress(0);
    setError(null);
    try {
      const uploadedFile = await googleDriveService.uploadFile(file, folderId, {
        onProgress: (progress) => setUploadProgress(progress),
      });
      console.log("File Upload Successful", uploadedFile);
      setUploadStatus("success");

      // Notify the parent window that the upload is complete
      if (window.opener) {
        window.opener.postMessage(
          { type: "UPLOAD_COMPLETE", success: true, file: uploadedFile },
          "*"
        );
      }

      return uploadedFile;
    } catch (error) {
      setError(error instanceof Error ? error.message : "Upload failed");
      setUploadStatus("error");
      console.error("Error uploading files", error);
    }
  };

  return (
    <div className="flex flex-col gap-4 items-center justify-center h-screen w-screen bg-gray-100">
      <div
        className={`flex items-center justify-center h-72 w-128 p-4 rounded border-2 border-dashed ${
          isDragging ? "border-teal-500 bg-teal-50" : "border-gray-300"
        }`}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {uploadStatus === "idle" ? (
          // Show the drag and drop text when idle
          isDragging ? (
            "Drop Files Here"
          ) : (
            "Drag & Drop Files Here"
          )
        ) : (
          // Show upload status when not idle
          <div className="w-full flex flex-col items-center">
            {/* Progress bar when uploading */}
            {uploadStatus === "uploading" && (
              <>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                  <div
                    className="bg-teal-600 h-2.5 rounded-full"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-gray-700">
                  Uploading... {uploadProgress.toFixed(0)}%
                </p>
              </>
            )}

            {/* Success message */}
            {uploadStatus === "success" && (
              <p className="text-green-600">Upload successful!</p>
            )}

            {/* Error message */}
            {uploadStatus === "error" && (
              <p className="text-red-600">Upload failed: {error}</p>
            )}
          </div>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: "none" }}
        multiple
      />

      <button
        className="bg-teal-600 text-white px-3 py-1 rounded text-sm hover:bg-teal-700"
        onClick={handleChooseFile}
      >
        Choose File
      </button>
    </div>
  );
}
