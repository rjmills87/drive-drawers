import "./App.css";
import { useState } from "react";

function App() {
  // Loading state
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const rootFiles = [
    { id: "1", name: "Work Documents", type: "folder" },
    { id: "2", name: "Personal Documents", type: "folder" },
    { id: "3", name: "Project Proposal.docx", type: "file" },
  ];

  const workDocuments = [
    { id: "w1", name: "Presentations", type: "folder" },
    { id: "w2", name: "Q2 Report.pdf", type: "file" },
    { id: "w3", name: "Meeting Notes.docx", type: "file" },
  ];

  const personalDocuments = [
    { id: "p1", name: "Resume.pdf", type: "file" },
    { id: "p2", name: "Photos", type: "folder" },
    { id: "p3", name: "Tax Documents", type: "folder" },
  ];

  // Selected service state
  const [selectedService, setSelectedService] =
    useState<string>("google-drive");

  // Function to handle service selection
  const handleServiceChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedService(event.target.value);
  };

  return (
    <div className="w-[400px] h-[500px] flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-teal-600 text-white p-4 shadow-md">
        <h1 className="text-xl font-bold">Drive Drawers</h1>
      </header>

      {/* Service Selection */}
      <div className="bg-white p-4 border-b flex items-center justify-between space-x-4">
        <div className="font-medium">Service:</div>
        <select
          value={selectedService}
          onChange={handleServiceChange}
          className="border border-gray-300 rounded-md p-2"
        >
          <option value="google-drive">Google Drive</option>
          <option value="microsoft-onedrive">Microsoft OneDrive</option>
          <option value="dropbox">Dropbox</option>
        </select>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="text-gray-500">Loading...</div>
          </div>
        ) : (
          <div className="space-y-2">
            {rootFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center p-2 hover:bg-gray-100 rounded cursor-pointer"
              >
                <div className="mr-3">
                  {file.type === "folder" ? (
                    <svg
                      className="w-5 h-5 text-yellow-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"></path>
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5 text-blue-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                  )}
                </div>
                <div className="flex-1 truncate">{file.name}</div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Footer/Action Bar */}
      <div className="bg-gray-100 p-3 border-t flex justify-end space-x-2">
        <button className="bg-teal-600 text-white px-3 py-1 rounded text-sm hover:bg-teal-700">
          New Folder
        </button>
        <button className="bg-teal-600 text-white px-3 py-1 rounded text-sm hover:bg-teal-700">
          Upload File
        </button>
      </div>
    </div>
  );
}

export default App;
