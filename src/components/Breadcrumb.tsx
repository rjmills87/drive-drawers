type BreadcrumbProps = {
  currentPath: string;
  onNavigateUp: () => void;
};

export default function Breadcrumb({
  currentPath,
  onNavigateUp,
}: BreadcrumbProps) {
  if (!currentPath) return null;

  return (
    <div className="flex items-center text-sm text-gray-600 mb-2">
      <button
        onClick={onNavigateUp}
        className="flex items-center hover:text-teal-600"
      >
        <span className="mr-1">←</span> Back
      </button>
      <span className="mx-2">|</span>
      <span>{currentPath}</span>
    </div>
  );
}
