interface ServiceSelectorProps {
  selectedService: string;
  onServiceChange: (service: string) => void;
  isAuthenticated: boolean;
  onAuthenticate: () => void;
  onSignOut: () => void;
}

export default function ServiceSelector({
  selectedService,
  onServiceChange,
  isAuthenticated,
  onAuthenticate,
  onSignOut,
}: ServiceSelectorProps) {
  // Function to handle service selection
  const handleServiceChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onServiceChange(event.target.value);
  };

  return (
    <div className="bg-white p-4 border-b flex flex-col gap-6">
      <div className="flex items-center justify-between space-x-4">
        <div className="font-medium text-xl">Select Service:</div>
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
      <div className="flex justify-end">
        {isAuthenticated ? (
          <button
            className="bg-teal-600 text-white px-3 py-1 rounded text-sm hover:bg-teal-700"
            onClick={onSignOut}
          >
            Disconnect
          </button>
        ) : (
          <button
            className="bg-teal-600 text-white px-3 py-1 rounded text-sm hover:bg-teal-700"
            onClick={onAuthenticate}
          >
            Connect
          </button>
        )}
      </div>
    </div>
  );
}
