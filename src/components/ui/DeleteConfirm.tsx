import * as AlertDialog from '@radix-ui/react-alert-dialog';

interface DeleteConfirmProps {
  onConfirm: () => void;
  trigger?: React.ReactNode;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
}

export function DeleteConfirm({ 
  onConfirm,
  trigger,
  title = "Confirmer la suppression",
  description = "Cette action est irréversible.",
  confirmText = "Supprimer",
  cancelText = "Annuler"
}: DeleteConfirmProps) {
  return (
    <AlertDialog.Root>
      <AlertDialog.Trigger asChild>
        {trigger || (
          <button className="btn btn-error">
            {confirmText}
          </button>
        )}
      </AlertDialog.Trigger>

      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        
        <AlertDialog.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-sm translate-x-[-50%] translate-y-[-50%] gap-4 border bg-base-100 p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg">
          <div className="flex flex-col space-y-2 text-center sm:text-left">
            <AlertDialog.Title className="text-lg font-semibold text-base-content">
              {title}
            </AlertDialog.Title>
            <AlertDialog.Description className="text-sm text-base-content/70">
              {description}
            </AlertDialog.Description>
          </div>
          
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
            <AlertDialog.Cancel asChild>
              <button className="btn btn-secondary mt-2 sm:mt-0">
                {cancelText}
              </button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <button
                onClick={onConfirm}
                className="btn btn-error"
              >
                {confirmText}
              </button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}