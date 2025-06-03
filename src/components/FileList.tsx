import type { DriveFile } from "../services/googleDriveServices";
import FileItem from "./FileItem";

type FileListProps = {
  files: DriveFile[];
  onFolderClick: (folderId: string, folderName: string) => void; // Remove the ?
  onFileClick: (file: DriveFile) => void;
};

export default function FileList({
  files,
  onFolderClick,
  onFileClick,
}: FileListProps) {
  return (
    <div className="...">
      {files.map((file) => (
        <FileItem
          key={file.id}
          file={file}
          onFolderClick={onFolderClick}
          onFileClick={onFileClick}
        />
      ))}
    </div>
  );
}
