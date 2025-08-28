import { AlertTriangleIcon } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import type { ReactNode } from 'react';
import { useTranslations } from '@/hooks/useTranslations';


interface DeleteConfirmProps {
  onConfirm: () => void;
  trigger?: ReactNode;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  disabled?: boolean;
}

export function DeleteConfirm(props: DeleteConfirmProps) {
  const t = useTranslations();

  const {
    onConfirm,
    trigger,
    title = t.userFieldsPanel?.confirmDeleteTitle,
    description = t.userFieldsPanel?.confirmDelete,
    confirmText = t.userFieldsPanel?.delete,
    cancelText = t.userFieldsPanel?.cancel,
    isDestructive = true,
    disabled = false,
  } = props;
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {trigger || (
          <Button 
            variant={isDestructive ? "destructive" : "default"}
            disabled={disabled}
            className="transition-all duration-200 hover:scale-105"
          >
            {confirmText}
          </Button>
        )}
      </AlertDialogTrigger>
      
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader className="text-center sm:text-left">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20 sm:mx-0 sm:h-10 sm:w-10">
            <AlertTriangleIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          
          <AlertDialogTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {title}
          </AlertDialogTitle>
          
          <AlertDialogDescription className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <AlertDialogFooter className="flex-col gap-2 sm:flex-row sm:gap-3">
          <AlertDialogCancel className="sm:w-auto">
            {cancelText}
          </AlertDialogCancel>
          
          <AlertDialogAction
            onClick={onConfirm}
            className={`sm:w-auto transition-all duration-200 hover:scale-105 ${
              isDestructive
                ? 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 dark:bg-red-600 dark:hover:bg-red-700'
                : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
            }`}
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}