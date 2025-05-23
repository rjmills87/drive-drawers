type FileItemProps = {
  file: {
    id: string;
    name: string;
    type: string;
  };
};

export default function FileItem({ file }: FileItemProps) {
  return (
    <div className="flex items-center p-2 hover:bg-gray-100 rounded cursor-pointer">
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
  );
}
