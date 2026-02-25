import { useState, useCallback } from 'react';
import { ApiClient } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface UseImageUploadOptions {
  onSuccess?: (url: string) => void;
  successMessage?: string;
}

export function useImageUpload({ onSuccess, successMessage = 'Imagen subida correctamente' }: UseImageUploadOptions = {}) {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const url = await ApiClient.uploadImage(file);
      onSuccess?.(url);
      toast({ title: successMessage });
    } catch {
      toast({ variant: 'destructive', title: 'Error al subir imagen' });
    } finally {
      setIsUploading(false);
    }
  }, [onSuccess, successMessage, toast]);

  return { isUploading, handleImageUpload };
}
