import { rootFiles } from "../data/mockData";
import FileItem from "./FileItem";

type FileListProps = {
  files?: { id: string; name: string; type: string }[];
  onFolderClick?: (folderName: string) => void;
};

export default function FileList({
  files = rootFiles,
  onFolderClick,
}: FileListProps) {
  return (
    <div className="space-y-2">
      {files.map((file) => (
        <FileItem key={file.id} file={file} onFolderClick={onFolderClick} />
      ))}
    </div>
  );
}
