'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface UnsavedChangesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinueEditing: () => void;
  onSaveAndContinue: () => void;
  action: 'preview' | 'publish';
}

export function UnsavedChangesModal({
  isOpen,
  onClose,
  onContinueEditing,
  onSaveAndContinue,
  action,
}: UnsavedChangesModalProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
          <AlertDialogDescription>
            You have unsaved changes. Would you like to save your changes before
            {action === 'preview' ? ' previewing' : ' publishing'} the form?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onContinueEditing}>
            Continue Editing
          </AlertDialogCancel>
          <AlertDialogAction onClick={onSaveAndContinue}>
            Save and {action === 'preview' ? 'Preview' : 'Publish'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
