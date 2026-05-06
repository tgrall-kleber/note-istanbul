import React, { useEffect, useState } from 'react';
import { Note } from '../types/index';
import { RichTextEditor } from './RichTextEditor';
import { storageService } from '../services/storage';

interface NoteEditorProps {
  note: Note | null;
  onNoteUpdate: (note: Note) => void;
  onAddNote: () => void;
  onDeleteNote: () => void;
}

export const NoteEditor: React.FC<NoteEditorProps> = ({
  note,
  onNoteUpdate,
  onAddNote,
  onDeleteNote,
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setTagInput(note.tags.join(', '));
    } else {
      setTitle('');
      setContent('');
      setTagInput('');
    }
  }, [note]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (note && (title !== note.title || content !== note.content)) {
        const tags = tagInput
          .split(',')
          .map(t => t.trim())
          .filter(t => t);
        
        storageService.updateNote(note.id, {
          title: title || 'Untitled Note',
          content,
          tags,
        }).then(() => {
          onNoteUpdate({
            ...note,
            title: title || 'Untitled Note',
            content,
            tags,
          });
        });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [title, content, tagInput, note, onNoteUpdate]);

  if (!note) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-800">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <p className="text-lg">No note selected</p>
          <p className="text-sm">Create a new note to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-gray-800">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note title..."
          className="w-full text-2xl font-bold outline-none dark:bg-gray-800 dark:text-white"
        />
        <div className="mt-3">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            placeholder="Add tags (comma separated)..."
            className="w-full text-sm px-2 py-1 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <RichTextEditor
        content={content}
        onChange={setContent}
        onAddNote={onAddNote}
        onDelete={onDeleteNote}
        onPin={() => storageService.togglePinNote(note.id)}
        isPinned={note.isPinned}
        showActions={true}
      />
    </div>
  );
};
