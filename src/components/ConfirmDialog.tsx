import { useEffect } from "react";

type ConfirmDialogProps = {
  cancelText: string;
  confirmText: string;
  description: string;
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  title: string;
};

export function ConfirmDialog({
  cancelText,
  confirmText,
  description,
  isOpen,
  onCancel,
  onConfirm,
  title,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onCancel();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onCancel]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end bg-slate-900/60 p-4 sm:items-center sm:justify-center"
      role="dialog"
    >
      <button
        aria-label="关闭确认弹窗"
        className="absolute inset-0"
        onClick={onCancel}
        type="button"
      />
      <section className="relative z-10 w-full max-w-md rounded-xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-700 dark:bg-slate-900">
        <h2 className="text-xl font-black text-slate-950 dark:text-slate-50">
          {title}
        </h2>
        <p className="mt-2 text-sm font-medium text-slate-600 dark:text-slate-300">
          {description}
        </p>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            className="h-11 rounded-lg border border-slate-300 bg-white px-4 text-sm font-black text-slate-700 transition hover:bg-slate-100 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:focus-visible:outline-slate-600"
            onClick={onCancel}
            type="button"
          >
            {cancelText}
          </button>
          <button
            className="h-11 rounded-lg bg-rose-600 px-4 text-sm font-black text-white transition hover:bg-rose-500 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-rose-300 active:bg-rose-700 dark:bg-rose-700 dark:hover:bg-rose-600 dark:focus-visible:outline-rose-500 dark:active:bg-rose-800"
            onClick={onConfirm}
            type="button"
          >
            {confirmText}
          </button>
        </div>
      </section>
    </div>
  );
}
