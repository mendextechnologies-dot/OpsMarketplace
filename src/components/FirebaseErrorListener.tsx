'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useToast } from '@/hooks/use-toast';

export function FirebaseErrorListener() {
  const { toast } = useToast();

  useEffect(() => {
    const handlePermissionError = (error: FirestorePermissionError) => {
      // In development, this will also trigger the Next.js error overlay
      // if we throw it, but for now we'll surface it clearly.
      console.error('Firebase Permission Error Context:', error.context);
      
      toast({
        variant: 'destructive',
        title: 'Security Rule Violation',
        description: `Permission denied for ${error.context.operation} at ${error.context.path}. Check your security rules.`,
      });

      // Throwing here triggers the development overlay for better debugging
      if (process.env.NODE_ENV === 'development') {
        throw error;
      }
    };

    errorEmitter.on('permission-error', handlePermissionError);
    return () => {
      errorEmitter.off('permission-error', handlePermissionError);
    };
  }, [toast]);

  return null;
}
