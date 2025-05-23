export default function ActionBar() {
  return (
    <div className="bg-gray-100 p-3 border-t flex justify-end space-x-2">
      <button className="bg-teal-600 text-white px-3 py-1 rounded text-sm hover:bg-teal-700">
        New Folder
      </button>
      <button className="bg-teal-600 text-white px-3 py-1 rounded text-sm hover:bg-teal-700">
        Upload File
      </button>
    </div>
  );
}
