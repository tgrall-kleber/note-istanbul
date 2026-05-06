import React from 'react';
import { BookOpen, Trash2, Search } from 'lucide-react';
import { Notebook } from '../types/index';
import { NotebookList } from './NotebookList';
import { ThemeToggle } from './ThemeToggle';

interface SidebarProps {
  notebooks: Notebook[];
  selectedNotebook: string | null;
  onSelectNotebook: (id: string | null) => void;
  onSearch: (query: string) => void;
  onNotebookCreated: () => void;
  trashedNotesCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  notebooks,
  selectedNotebook,
  onSelectNotebook,
  onSearch,
  onNotebookCreated,
  trashedNotesCount,
}) => {
  const [searchQuery, setSearchQuery] = React.useState('');

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    onSearch(value);
  };

  return (
    <div className="w-64 h-screen bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen size={24} className="text-blue-500" />
          <h1 className="text-xl font-bold dark:text-white">NoteFlow</h1>
        </div>

        <div className="relative">
          <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-3">
          <button
            onClick={() => onSelectNotebook(null)}
            className={`w-full text-left px-3 py-2 rounded-lg font-medium transition-colors ${
              selectedNotebook === null
                ? 'bg-blue-500 text-white'
                : 'hover:bg-gray-200 dark:hover:bg-gray-700 dark:text-white'
            }`}
          >
            📌 All Notes
          </button>
        </div>

        <NotebookList
          notebooks={notebooks}
          selectedNotebook={selectedNotebook}
          onSelectNotebook={onSelectNotebook}
          onNotebookCreated={onNotebookCreated}
        />
      </div>

      <div className="border-t border-gray-200 dark:border-gray-800 p-4 space-y-2">
        <button
          onClick={() => onSelectNotebook('trash')}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
            selectedNotebook === 'trash'
              ? 'bg-red-500 text-white'
              : 'hover:bg-gray-200 dark:hover:bg-gray-700 dark:text-white'
          }`}
        >
          <Trash2 size={16} />
          <span className="text-sm">Trash ({trashedNotesCount})</span>
        </button>

        <div className="flex justify-center">
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
};
