import type { DriveFile } from "../services/googleDriveServices";
import FileItem from "./FileItem";

type FileListProps = {
  files: DriveFile[];
  onFolderClick?: (folderId: string, folderName: string) => void;
};

export default function FileList({ files = [], onFolderClick }: FileListProps) {
  return (
    <div className="space-y-2">
      {files.map((file) => (
        <FileItem key={file.id} file={file} onFolderClick={onFolderClick} />
      ))}
    </div>
  );
}
