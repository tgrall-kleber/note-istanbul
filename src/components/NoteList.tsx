import React from 'react';
import { Pin, Trash2, Info } from 'lucide-react';
import { Note } from '../types/index';

interface NoteListProps {
  notes: Note[];
  selectedNote: Note | null;
  onSelectNote: (note: Note) => void;
  onDeleteNote: (noteId: string) => void;
  onTogglePin: (noteId: string) => void;
  isTrash?: boolean;
  onRestoreNote?: (noteId: string) => void;
  onPermanentDelete?: (noteId: string) => void;
}

export const NoteList: React.FC<NoteListProps> = ({
  notes,
  selectedNote,
  onSelectNote,
  onDeleteNote,
  onTogglePin,
  isTrash = false,
  onRestoreNote,
  onPermanentDelete,
}) => {
  const formatDate = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  const getPreview = (content: string) => {
    return content.substring(0, 100).replace(/\n/g, ' ').trim() || '(empty)';
  };

  return (
    <div className="w-64 border-r border-gray-200 dark:border-gray-800 overflow-y-auto">
      {notes.length === 0 ? (
        <div className="p-4 text-center text-gray-500 dark:text-gray-400">
          <Info size={24} className="mx-auto mb-2 opacity-50" />
          <p>No notes yet</p>
        </div>
      ) : (
        notes.map(note => (
          <div
            key={note.id}
            onClick={() => onSelectNote(note)}
            className={`p-3 border-b border-gray-200 dark:border-gray-700 cursor-pointer transition-colors group ${
              selectedNote?.id === note.id
                ? 'bg-blue-50 dark:bg-blue-900'
                : 'hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                {note.isPinned && <Pin size={12} className="text-yellow-500 inline mr-1" />}
                <p className="font-medium dark:text-white truncate text-sm">
                  {note.title || 'Untitled'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">
                  {getPreview(note.content)}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  {formatDate(note.updatedAt)}
                </p>
                {note.tags.length > 0 && (
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {note.tags.map(tag => (
                      <span
                        key={tag}
                        className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {!isTrash && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onTogglePin(note.id);
                    }}
                    className={`p-1 rounded transition-colors ${
                      note.isPinned
                        ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-600'
                        : 'hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Pin size={14} />
                  </button>
                )}
                {isTrash ? (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRestoreNote?.(note.id);
                      }}
                      className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
                    >
                      Restore
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('Permanently delete this note?')) {
                          onPermanentDelete?.(note.id);
                        }
                      }}
                      className="p-1 rounded hover:bg-red-200 dark:hover:bg-red-900 text-red-500"
                    >
                      <Trash2 size={14} />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteNote(note.id);
                    }}
                    className="p-1 rounded hover:bg-red-200 dark:hover:bg-red-900 text-red-500"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};
