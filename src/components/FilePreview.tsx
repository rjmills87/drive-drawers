import { useState, useEffect } from "react";
import googleDriveService from "../services/googleDriveServices";
import type { DriveFile } from "../services/googleDriveServices";
import Loading from "./Loading";

type FilePreviewProps = {
  file: DriveFile | null;
  onClose: () => void;
};

export default function FilePreview({ file, onClose }: FilePreviewProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [fileUrl, setFileUrl] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [viewerUrl, setViewerUrl] = useState<string>("");

  const handleClose = () => {
    setError("");
    setFileUrl("");
    setIsLoading(false);
    setIsOpen(false);
    onClose();
  };

  const fetchPreviewUrl = async () => {
    setIsLoading(true);
    try {
      if (file) {
        if (
          file.mimeType === "application/pdf" ||
          file.mimeType.startsWith("application/vnd.google-apps.")
        ) {
          // For PDFs and Google Docs, use the viewer URL
          const url = await googleDriveService.getViewerUrl(
            file.id,
            file.mimeType
          );
          setViewerUrl(url);
        } else {
          // For other file types, use the blob approach
          const fileBlob = await googleDriveService.getFileForPreview(
            file.id,
            file.mimeType
          );
          const objectUrl = URL.createObjectURL(fileBlob);
          setFileUrl(objectUrl);
        }
      }
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      setError("Failed to load preview");
      console.error("Error fetching preview URL:", error);
    }
  };

  // Add cleanup for object URLs
  useEffect(() => {
    return () => {
      if (fileUrl && fileUrl.startsWith("blob:")) {
        URL.revokeObjectURL(fileUrl);
      }
    };
  }, [fileUrl]);

  const renderFileContent = () => {
    if (file?.mimeType.startsWith("image/")) {
      return (
        <div>
          <img
            className="w-full h-full object-contain"
            src={fileUrl}
            alt={file?.name}
          />
        </div>
      );
    }

    if (
      file?.mimeType === "application/pdf" ||
      file?.mimeType.startsWith("application/vnd.google-apps.")
    ) {
      return (
        <div className="w-full h-[500px]">
          <iframe
            src={viewerUrl}
            className="w-full h-full border-none"
            sandbox="allow-scripts allow-forms allow-popups allow-same-origin"
            title="Document Preview"
          ></iframe>
        </div>
      );
    }

    if (file?.mimeType.startsWith("video/")) {
      return (
        <div>
          <video className="w-full h-full" src={fileUrl} controls></video>
        </div>
      );
    }
    if (file?.mimeType.startsWith("audio/")) {
      return (
        <div>
          <audio className="w-full h-full" src={fileUrl} controls></audio>
        </div>
      );
    }
    if (file?.mimeType.startsWith("text/")) {
      return (
        <div>
          <pre className="w-full h-full">{fileUrl}</pre>
        </div>
      );
    }
    return (
      <div>
        <p>Unsupported file type</p>
      </div>
    );
  };

  useEffect(() => {
    if (file) {
      setIsOpen(true);
      fetchPreviewUrl();
    }
  }, [file]);

  return (
    <div>
      <div
        className={`fixed inset-0 w-screen overflow-y-auto z-10 ${
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        } transition-opacity duration-300`}
        aria-labelledby="modal-title"
        role="dialog"
        aria-modal="true"
      >
        <div
          className="fixed inset-0 bg-gray-500/75 transition-opacity"
          aria-hidden="true"
        ></div>

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-fit">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                {isLoading ? (
                  <div>
                    <div className="flex justify-end">
                      <span
                        onClick={handleClose}
                        className="text-4xl cursor-pointer"
                      >
                        &times;
                      </span>
                    </div>
                    <div>
                      <Loading />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col">
                    <div>
                      <h2 className="text-lg font-semibold">{file?.name}</h2>
                    </div>
                    <div>
                      <span
                        onClick={handleClose}
                        className="text-4xl cursor-pointer"
                      >
                        &times;
                      </span>
                    </div>
                    {renderFileContent()}
                  </div>
                )}
              </div>
              {error && <div className="text-red-500">{error}</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
