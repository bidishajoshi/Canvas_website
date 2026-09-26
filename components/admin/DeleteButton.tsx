'use client';

import { useState } from 'react';

interface DeleteButtonProps {
  action: (formData: FormData) => Promise<void> | void;
  itemName?: string;
  buttonText?: string;
  className?: string;
}

export function DeleteButton({
  action,
  itemName = 'this item',
  buttonText = 'Delete',
  className = 'text-xs text-rose-600 font-bold hover:underline cursor-pointer',
}: DeleteButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  return (
    <form
      action={action}
      onSubmit={(e) => {
        const confirmed = window.confirm(`Do you want to delete ${itemName}?`);
        if (!confirmed) {
          e.preventDefault();
        } else {
          setIsDeleting(true);
        }
      }}
    >
      <button type="submit" disabled={isDeleting} className={className}>
        {isDeleting ? 'Deleting...' : buttonText}
      </button>
    </form>
  );
}
