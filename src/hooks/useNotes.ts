import { useState, useEffect, useCallback } from 'react';
import { Note } from '../types/index';
import { storageService } from '../services/storage';

export const useNotes = (notebookId?: string) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadNotes = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await storageService.getNotes(notebookId);
      setNotes(data);
    } catch (error) {
      console.error('Error loading notes:', error);
    } finally {
      setIsLoading(false);
    }
  }, [notebookId]);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  const createNote = useCallback(async (title?: string) => {
    try {
      const note = await storageService.createNote(notebookId || 'all', title);
      setNotes(prev => [note, ...prev]);
      return note;
    } catch (error) {
      console.error('Error creating note:', error);
      throw error;
    }
  }, [notebookId]);

  const updateNote = useCallback(async (id: string, updates: Partial<Note>) => {
    try {
      await storageService.updateNote(id, updates);
      setNotes(prev =>
        prev.map(note => (note.id === id ? { ...note, ...updates, updatedAt: Date.now() } : note))
          .sort((a, b) => {
            if (a.isPinned && !b.isPinned) return -1;
            if (!a.isPinned && b.isPinned) return 1;
            return b.updatedAt - a.updatedAt;
          })
      );
    } catch (error) {
      console.error('Error updating note:', error);
      throw error;
    }
  }, []);

  const deleteNote = useCallback(async (id: string) => {
    try {
      await storageService.deleteNote(id);
      setNotes(prev => prev.filter(note => note.id !== id));
    } catch (error) {
      console.error('Error deleting note:', error);
      throw error;
    }
  }, []);

  const togglePin = useCallback(async (id: string) => {
    try {
      await storageService.togglePinNote(id);
      const note = notes.find(n => n.id === id);
      if (note) {
        await updateNote(id, { isPinned: !note.isPinned });
      }
    } catch (error) {
      console.error('Error toggling pin:', error);
      throw error;
    }
  }, [notes, updateNote]);

  const searchNotes = useCallback(async (query: string) => {
    try {
      if (!query.trim()) {
        await loadNotes();
        return;
      }
      const results = await storageService.searchNotes(query);
      setNotes(results);
    } catch (error) {
      console.error('Error searching notes:', error);
      throw error;
    }
  }, [loadNotes]);

  return {
    notes,
    isLoading,
    createNote,
    updateNote,
    deleteNote,
    togglePin,
    searchNotes,
    loadNotes,
  };
};
