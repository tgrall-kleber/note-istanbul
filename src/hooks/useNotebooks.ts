import { useState, useEffect, useCallback } from 'react';
import { Notebook } from '../types/index';
import { storageService } from '../services/storage';

export const useNotebooks = () => {
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadNotebooks = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await storageService.getNotebooks();
      setNotebooks(data);
    } catch (error) {
      console.error('Error loading notebooks:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotebooks();
  }, [loadNotebooks]);

  const createNotebook = useCallback(async (name: string) => {
    try {
      const notebook = await storageService.createNotebook(name);
      setNotebooks(prev => [...prev, notebook]);
      return notebook;
    } catch (error) {
      console.error('Error creating notebook:', error);
      throw error;
    }
  }, []);

  const updateNotebook = useCallback(async (id: string, name: string) => {
    try {
      await storageService.updateNotebook(id, name);
      setNotebooks(prev =>
        prev.map(nb => (nb.id === id ? { ...nb, name, updatedAt: Date.now() } : nb))
      );
    } catch (error) {
      console.error('Error updating notebook:', error);
      throw error;
    }
  }, []);

  const deleteNotebook = useCallback(async (id: string) => {
    try {
      await storageService.deleteNotebook(id);
      setNotebooks(prev => prev.filter(nb => nb.id !== id));
    } catch (error) {
      console.error('Error deleting notebook:', error);
      throw error;
    }
  }, []);

  return {
    notebooks,
    isLoading,
    createNotebook,
    updateNotebook,
    deleteNotebook,
  };
};
