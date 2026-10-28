interface DeleteLinkProps {
  label: string;
  onClick: () => void;
  className?: string;
}

// A quiet delete action for the button row of an edit window. It only starts
// the deletion: the page still asks for a confirmation.
export function DeleteLink({
  label,
  onClick,
  className = '',
}: DeleteLinkProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-sm font-medium text-rose-600 transition hover:text-rose-700 focus:outline-none focus-visible:underline ${className}`}
    >
      {label}
    </button>
  );
}
