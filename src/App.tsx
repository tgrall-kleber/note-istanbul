import React, { useEffect, useState } from 'react';
import { useNotebooks, useTheme } from './hooks';
import { Sidebar } from './components/Sidebar';
import { NoteList } from './components/NoteList';
import { NoteEditor } from './components/NoteEditor';
import { Note } from './types/index';
import { storageService } from './services/storage';

export const App: React.FC = () => {
  const { notebooks } = useNotebooks();
  const { isDark } = useTheme();
  
  const [selectedNotebook, setSelectedNotebook] = useState<string | null>(null);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [trashedNotes, setTrashedNotes] = useState<Note[]>([]);

  // Load notes when notebook selection changes
  useEffect(() => {
    const loadNotes = async () => {
      try {
        let loadedNotes: Note[] = [];
        
        if (selectedNotebook === 'trash') {
          loadedNotes = await storageService.getTrashedNotes();
          setTrashedNotes(loadedNotes);
        } else {
          loadedNotes = await storageService.getNotes(selectedNotebook || undefined);
        }
        
        setNotes(loadedNotes);
        setSelectedNote(null);
      } catch (error) {
        console.error('Error loading notes:', error);
      }
    };

    loadNotes();
  }, [selectedNotebook]);

  // Load trashed notes count
  useEffect(() => {
    const updateTrashedCount = async () => {
      const trashed = await storageService.getTrashedNotes();
      setTrashedNotes(trashed);
    };

    updateTrashedCount();
  }, [notes]);

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      if (selectedNotebook === 'trash') {
        setNotes(await storageService.getTrashedNotes());
      } else {
        setNotes(await storageService.getNotes(selectedNotebook || undefined));
      }
    } else {
      const results = await storageService.searchNotes(query);
      setNotes(results);
    }
  };

  const handleCreateNote = async () => {
    const newNote = await storageService.createNote(
      selectedNotebook || 'all',
      'Untitled Note'
    );
    setNotes([newNote, ...notes]);
    setSelectedNote(newNote);
  };

  const handleDeleteNote = async (noteId: string) => {
    await storageService.deleteNote(noteId);
    setNotes(notes.filter(n => n.id !== noteId));
    setSelectedNote(null);
  };

  const handlePermanentDelete = async (noteId: string) => {
    await storageService.permanentlyDeleteNote(noteId);
    setTrashedNotes(trashedNotes.filter(n => n.id !== noteId));
    setNotes(notes.filter(n => n.id !== noteId));
    setSelectedNote(null);
  };

  const handleRestoreNote = async (noteId: string) => {
    await storageService.restoreNote(noteId);
    const note = trashedNotes.find(n => n.id === noteId);
    if (note) {
      setTrashedNotes(trashedNotes.filter(n => n.id !== noteId));
      setNotes([note, ...notes]);
    }
  };

  const handleTogglePin = async (noteId: string) => {
    await storageService.togglePinNote(noteId);
    const updatedNotes = notes.map(n =>
      n.id === noteId ? { ...n, isPinned: !n.isPinned } : n
    ).sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return b.updatedAt - a.updatedAt;
    });
    setNotes(updatedNotes);
    if (selectedNote?.id === noteId) {
      setSelectedNote({ ...selectedNote, isPinned: !selectedNote.isPinned });
    }
  };

  const handleNotebookCreated = async () => {
    // Trigger a refresh of notebooks
    setSelectedNotebook(null);
  };

  return (
    <div className={isDark ? 'dark' : ''}>
      <div className="flex h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
        <Sidebar
          notebooks={notebooks}
          selectedNotebook={selectedNotebook}
          onSelectNotebook={setSelectedNotebook}
          onSearch={handleSearch}
          onNotebookCreated={handleNotebookCreated}
          trashedNotesCount={trashedNotes.length}
        />

        <NoteList
          notes={notes}
          selectedNote={selectedNote}
          onSelectNote={setSelectedNote}
          onDeleteNote={handleDeleteNote}
          onTogglePin={handleTogglePin}
          isTrash={selectedNotebook === 'trash'}
          onRestoreNote={handleRestoreNote}
          onPermanentDelete={handlePermanentDelete}
        />

        <div className="flex-1 flex flex-col">
          {selectedNotebook === 'trash' ? (
            <div className="flex-1 flex flex-col">
              {selectedNote ? (
                <NoteEditor
                  note={selectedNote}
                  onNoteUpdate={() => {}}
                  onAddNote={handleCreateNote}
                  onDeleteNote={() => handlePermanentDelete(selectedNote.id)}
                />
              ) : (
                <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-800">
                  <div className="text-center text-gray-500 dark:text-gray-400">
                    <p className="text-lg">Trash</p>
                    <p className="text-sm">Select a note to view or permanently delete</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <NoteEditor
              note={selectedNote}
              onNoteUpdate={() => {}}
              onAddNote={handleCreateNote}
              onDeleteNote={() => selectedNote && handleDeleteNote(selectedNote.id)}
            />
          )}
        </div>
      </div>
    </div>
  );
};
