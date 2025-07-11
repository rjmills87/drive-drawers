import { useEffect } from "react";

interface ActionBarProps {
  onFileUploaded?: () => void;
  currentFolderId?: string;
}

export default function ActionBar({
  onFileUploaded,
  currentFolderId = "root",
}: ActionBarProps) {
  // Open the upload window
  const openUploadWindow = () => {
    const uploadWindowUrl = chrome.runtime.getURL(
      `upload-window.html?folderId=${currentFolderId}`
    );

    chrome.windows.create({
      url: uploadWindowUrl,
      type: "popup",
      width: 500,
      height: 400,
    });
  };

  // Listen for messages from the upload window
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Check if the message is from our upload window
      if (
        event.data &&
        event.data.type === "UPLOAD_COMPLETE" &&
        event.data.success
      ) {
        console.log("Received upload complete message");
        // Call the callback to refresh file list if provided
        if (onFileUploaded) {
          onFileUploaded();
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [onFileUploaded]);

  return (
    <div className="bg-gray-100 p-3 border-t flex justify-end space-x-2">
      <button className="bg-teal-600 text-white px-3 py-1 rounded text-sm hover:bg-teal-700">
        New Folder
      </button>
      <button
        onClick={openUploadWindow}
        className="bg-teal-600 text-white px-3 py-1 rounded text-sm hover:bg-teal-700"
      >
        Upload File
      </button>
    </div>
  );
}
