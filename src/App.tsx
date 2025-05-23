import "./App.css";
import { useState } from "react";
import ServiceSelector from "./components/ServiceSelector";
import ActionBar from "./components/ActionBar";
import FileList from "./components/FileList";
import Loading from "./components/Loading";
import Breadcrumb from "./components/Breadcrumb";
import { getFilesForPath } from "./data/mockData";

function App() {
  // Loading state
  const [isLoading] = useState<boolean>(false);

  // Path State
  const [currentPath, setCurrentPath] = useState<string>("");

  const navigateToFolder = (folderName: string) => {
    setCurrentPath(folderName);
  };

  const navigateUp = () => {
    setCurrentPath("");
  };

  return (
    <div className="w-[400px] h-[500px] flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-teal-600 text-white p-4 shadow-md">
        <h1 className="text-xl font-bold">Drive Drawers</h1>
      </header>
      {/* Service Selection */}
      <ServiceSelector />
      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <Loading />
        ) : (
          <div className="space-y-2">
            <Breadcrumb currentPath={currentPath} onNavigateUp={navigateUp} />
            <FileList
              files={getFilesForPath(currentPath)}
              onFolderClick={navigateToFolder}
            />
          </div>
        )}
      </div>
      {/* Footer/Action Bar */}
      <ActionBar />
    </div>
  );
}

export default App;
