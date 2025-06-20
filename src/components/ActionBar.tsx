import googleDriveService from "../services/googleDriveServices";

interface ActionBarProps {
  onFileUploaded?: () => void;
}

export default function ActionBar({ onFileUploaded }: ActionBarProps) {
  const handleTestUpload = async () => {
    try {
      console.log("Uploading test file...");
      const file = await googleDriveService.testUpload();
      console.log("File uploaded successfully");

      // Call the callback to refresh file list if provided
      if (onFileUploaded) {
        onFileUploaded();
      }

      return file;
    } catch (error) {
      console.error("Failed to upload test file", error);
      return null;
    }
  };

  return (
    <div className="bg-gray-100 p-3 border-t flex justify-end space-x-2">
      <button className="bg-teal-600 text-white px-3 py-1 rounded text-sm hover:bg-teal-700">
        New Folder
      </button>
      <button
        onClick={handleTestUpload}
        className="bg-teal-600 text-white px-3 py-1 rounded text-sm hover:bg-teal-700"
      >
        Upload File
      </button>
    </div>
  );
}
