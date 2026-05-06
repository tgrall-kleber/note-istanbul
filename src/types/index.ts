export interface Notebook {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  color?: string;
}

export interface Note {
  id: string;
  notebookId: string;
  title: string;
  content: string;
  tags: string[];
  isPinned: boolean;
  isDeleted: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface SearchResult {
  notes: Note[];
  query: string;
}
