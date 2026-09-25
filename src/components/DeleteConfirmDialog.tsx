'use client';

import { useEffect, useRef, useState } from 'react';

interface DeleteConfirmDialogProps {
  entryId: string;
  entryDate: string;
  onDeleted: () => void;
}

export function DeleteConfirmDialog({ entryId, entryDate, onDeleted }: DeleteConfirmDialogProps) {
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  // Enfoca el botón "Cancelar" al abrir (focus trap básico) y cierra con Escape.
  useEffect(() => {
    if (!open) return;
    cancelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  async function confirmDelete() {
    setDeleting(true);
    setError(null);
    const res = await fetch(`/api/weight/${entryId}`, { method: 'DELETE' });
    setDeleting(false);
    if (!res.ok) {
      setError('No se pudo eliminar. Intenta de nuevo.');
      return;
    }
    setOpen(false);
    onDeleted();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-sm text-red-700 hover:underline"
      >
        Eliminar
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-dialog-title"
            className="mx-4 w-full max-w-sm rounded-lg bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="delete-dialog-title" className="mb-2 text-lg font-semibold">
              Eliminar registro
            </h2>
            <p className="mb-4 text-sm text-gray-600">
              ¿Seguro que quieres eliminar el registro del {entryDate}? Esta acción no se puede deshacer.
            </p>
            {error && (
              <p className="mb-3 text-sm text-red-700" role="alert">
                {error}
              </p>
            )}
            <div className="flex justify-end gap-3">
              <button
                ref={cancelRef}
                type="button"
                onClick={() => setOpen(false)}
                className="rounded px-4 py-2 text-sm hover:bg-gray-100"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleting}
                className="rounded bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? 'Eliminando…' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
