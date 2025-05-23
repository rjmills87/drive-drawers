import { rootFiles } from "../data/mockData";
import FileItem from "./FileItem";

type FileListProps = {
  files?: { id: string; name: string; type: string }[];
};

export default function FileList({ files = rootFiles }: FileListProps) {
  // Added default value
  return (
    <div className="space-y-2">
      {files.map((file) => (
        <FileItem key={file.id} file={file} />
      ))}
    </div>
  );
}
