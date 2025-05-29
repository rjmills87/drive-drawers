import { useState, useEffect } from "react";
import { MessageType, CloudService } from "./constants";
import Header from "./components/Header";
import googleDriveService from "./services/googleDriveServices";
import type { DriveFile } from "./services/googleDriveServices";
import ServiceSelector from "./components/ServiceSelector";
import ActionBar from "./components/ActionBar";
import FileList from "./components/FileList";
import Loading from "./components/Loading";
import Breadcrumb from "./components/Breadcrumb";

function App() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentPath, setCurrentPath] = useState<string>("");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [selectedService, setSelectedService] = useState<string>(
    CloudService.GOOGLE_DRIVE
  );
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string>("root");

  const fetchFiles = async () => {
    // If not authenticated, clear files and return
    if (!isAuthenticated) {
      setFiles([]);
      return;
    }
    setIsLoading(true);
    try {
      const files = await googleDriveService.listFiles(currentFolderId);
      setFiles(files);
    } catch (error) {
      console.error("Failed to fetch files", error);
      alert("Failed to fetch files");
    }
    setIsLoading(false);
  };

  const navigateToFolder = (folderId: string, folderName: string) => {
    setCurrentFolderId(folderId);
    setCurrentPath(currentPath ? `${currentPath}/${folderName}` : folderName);
  };

  const navigateUp = async () => {
    if (currentFolderId === "root") {
      return;
    }
    try {
      const folder = await googleDriveService.getFile(currentFolderId);
      const parentID = folder.parentId || "root";

      const pathParts = currentPath.split("/");
      pathParts.pop();
      const newPath = pathParts.join("/");
      setCurrentFolderId(parentID);
      setCurrentPath(newPath);
    } catch (error) {
      console.error("Error navigating up", error);
      alert("Failed to Navigate up");
    }
  };

  const checkAuthStatus = async () => {
    if (selectedService === CloudService.GOOGLE_DRIVE) {
      setIsLoading(true);
      try {
        const response = await chrome.runtime.sendMessage({
          type: MessageType.CHECK_AUTH,
        });
        setIsAuthenticated(response.isAuthenticated);
      } catch (error) {
        console.error("Error checking auth status: ", error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const authenticate = async () => {
    if (selectedService === CloudService.GOOGLE_DRIVE) {
      setIsLoading(true);
      try {
        const response = await chrome.runtime.sendMessage({
          type: MessageType.AUTHENTICATE,
        });
        setIsAuthenticated(response.success);
      } catch (error) {
        console.error("Error during authentication process: ", error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    if (selectedService === CloudService.GOOGLE_DRIVE) {
      try {
        const response = await chrome.runtime.sendMessage({
          type: MessageType.SIGN_OUT,
        });
        if (response.success) {
          setIsAuthenticated(false);
        } else {
          console.warn("Sign out may not have been completed successfully");
          alert(
            "Sign out wasn't completely successful. Please try again later."
          );
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("There was an issue when trying to signout: ", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchFiles();
    }
  }, [isAuthenticated, currentFolderId]);

  return (
    <div className="w-[400px] h-[500px] flex flex-col bg-gray-50">
      <Header />
      <ServiceSelector
        selectedService={selectedService}
        onServiceChange={setSelectedService}
        isAuthenticated={isAuthenticated}
        onAuthenticate={authenticate}
        onSignOut={signOut}
      />
      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <Loading />
        ) : (
          <div className="space-y-2">
            <Breadcrumb currentPath={currentPath} onNavigateUp={navigateUp} />
            <FileList files={files} onFolderClick={navigateToFolder} />
          </div>
        )}
      </div>
      <ActionBar />
    </div>
  );
}

export default App;
