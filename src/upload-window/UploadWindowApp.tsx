import "../upload-window/UploadWindowApp.css";
import { useState, useRef } from "react";

export default function UploadWindow() {
  const [isDragging, setIsDragging] = useState<boolean>(false);

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
      console.log(e.dataTransfer.files);
    }
  };

  // Create ref for file input
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChooseFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      console.log(e.target.files);
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
        {isDragging ? "Drop Files Here" : "Drag & Drop Files Here"}
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
