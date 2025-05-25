import { useState } from "react";

export default function ServiceSelector() {
  // Selected service state
  const [selectedService, setSelectedService] =
    useState<string>("google-drive");

  // Function to handle service selection
  const handleServiceChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedService(event.target.value);
  };

  return (
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
  );
}
