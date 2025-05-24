import "./App.css";
import { useState } from "react";
import { getFilesForPath } from "./data/mockData";
import Header from "./components/Header";
import ServiceSelector from "./components/ServiceSelector";
import ActionBar from "./components/ActionBar";
import FileList from "./components/FileList";
import Loading from "./components/Loading";
import Breadcrumb from "./components/Breadcrumb";

function App() {

  const [isLoading] = useState<boolean>(false);

  const [currentPath, setCurrentPath] = useState<string>("");

  const navigateToFolder = (folderName: string) => {
    setCurrentPath(folderName);
  };

  const navigateUp = () => {
    setCurrentPath("");
  };

  return (
    <div className="w-[400px] h-[500px] flex flex-col bg-gray-50">
      <Header />
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
      <ActionBar />
    </div>
  );
}

export default App;
