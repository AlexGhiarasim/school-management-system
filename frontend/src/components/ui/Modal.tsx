import { useEffect, useId, useRef, type ReactNode } from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  wide?: boolean;
  // For content with a table, like the preview of an import.
  extraWide?: boolean;
}

export function Modal({
  open,
  onClose,
  title,
  children,
  wide,
  extraWide,
}: ModalProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const element = dialog.current;
    if (!element) return;

    if (open && !element.open) element.showModal();
    if (!open && element.open) element.close();
  }, [open]);

  return (
    <dialog
      ref={dialog}
      aria-labelledby={titleId}
      onClose={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      onClick={(event) => {
        if (event.target === dialog.current) onClose();
      }}
      className={`m-auto w-full ${extraWide ? 'max-w-4xl' : wide ? 'max-w-2xl' : 'max-w-lg'} rounded-2xl bg-white p-0 shadow-2xl ring-1 ring-slate-200 backdrop:bg-slate-900/40`}
    >
      {open && (
        <div className="p-6">
          <h2
            id={titleId}
            className="text-lg font-semibold tracking-tight text-slate-900"
          >
            {title}
          </h2>
          <div className="mt-3">{children}</div>
        </div>
      )}
    </dialog>
  );
}
