import React, { useState } from 'react';
import { Trash2, Plus } from 'lucide-react';
import { Notebook } from '../types/index';
import { storageService } from '../services/storage';

interface NotebookListProps {
  notebooks: Notebook[];
  selectedNotebook: string | null;
  onSelectNotebook: (id: string | null) => void;
  onNotebookCreated: () => void;
}

export const NotebookList: React.FC<NotebookListProps> = ({
  notebooks,
  selectedNotebook,
  onSelectNotebook,
  onNotebookCreated,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState<string>('');
  const [noteCounts, setNoteCounts] = useState<Record<string, number>>({});

  React.useEffect(() => {
    notebooks.forEach(async (nb) => {
      const count = await storageService.getNotebookNoteCount(nb.id);
      setNoteCounts(prev => ({ ...prev, [nb.id]: count }));
    });
  }, [notebooks]);

  const handleRename = async (id: string) => {
    if (editName.trim()) {
      await storageService.updateNotebook(id, editName);
      onNotebookCreated();
    }
    setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this notebook and move notes to trash?')) {
      await storageService.deleteNotebook(id);
      onNotebookCreated();
      if (selectedNotebook === id) {
        onSelectNotebook(null);
      }
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-4 py-2">
        <h2 className="text-sm font-semibold text-gray-600 dark:text-gray-400">NOTEBOOKS</h2>
        <button
          onClick={async () => {
            const name = prompt('Notebook name:');
            if (name) {
              const nb = await storageService.createNotebook(name);
              onNotebookCreated();
              onSelectNotebook(nb.id);
            }
          }}
          className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
          title="New notebook"
        >
          <Plus size={16} />
        </button>
      </div>

      {notebooks.map(notebook => (
        <div
          key={notebook.id}
          className={`mx-2 px-3 py-2 rounded-lg cursor-pointer flex items-center justify-between group ${
            selectedNotebook === notebook.id
              ? 'bg-blue-500 text-white'
              : 'hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          {editingId === notebook.id ? (
            <input
              autoFocus
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={() => handleRename(notebook.id)}
              onKeyPress={(e) => e.key === 'Enter' && handleRename(notebook.id)}
              className="flex-1 bg-transparent outline-none"
            />
          ) : (
            <div
              onClick={() => onSelectNotebook(notebook.id)}
              className="flex-1"
              onDoubleClick={() => {
                setEditingId(notebook.id);
                setEditName(notebook.name);
              }}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{notebook.name}</span>
                <span className="text-xs opacity-60">({noteCounts[notebook.id] || 0})</span>
              </div>
            </div>
          )}
          <button
            onClick={() => handleDelete(notebook.id)}
            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500 hover:text-white rounded transition-all"
            title="Delete notebook"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ))}
    </div>
  );
};
