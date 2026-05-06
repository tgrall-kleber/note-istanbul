import Dexie, { Table } from 'dexie';
import { Notebook, Note } from '../types/index';

export class NoteFlowDB extends Dexie {
  notebooks!: Table<Notebook>;
  notes!: Table<Note>;

  constructor() {
    super('NoteFlowDB');
    this.version(1).stores({
      notebooks: 'id, createdAt, updatedAt',
      notes: 'id, notebookId, createdAt, updatedAt, isPinned, isDeleted'
    });
  }
}

export const db = new NoteFlowDB();

export const storageService = {
  // Notebooks
  async createNotebook(name: string): Promise<Notebook> {
    const id = Math.random().toString(36).substring(2, 11);
    const now = Date.now();
    const notebook: Notebook = {
      id,
      name,
      createdAt: now,
      updatedAt: now,
    };
    await db.notebooks.add(notebook);
    return notebook;
  },

  async getNotebooks(): Promise<Notebook[]> {
    return db.notebooks.orderBy('createdAt').toArray();
  },

  async updateNotebook(id: string, name: string): Promise<void> {
    await db.notebooks.update(id, {
      name,
      updatedAt: Date.now(),
    });
  },

  async deleteNotebook(id: string): Promise<void> {
    await db.notebooks.delete(id);
    // Soft delete all notes in this notebook
    await db.notes.where('notebookId').equals(id).modify({
      isDeleted: true,
      updatedAt: Date.now(),
    });
  },

  // Notes
  async createNote(notebookId: string, title: string = 'Untitled Note'): Promise<Note> {
    const id = Math.random().toString(36).substring(2, 11);
    const now = Date.now();
    const note: Note = {
      id,
      notebookId,
      title,
      content: '',
      tags: [],
      isPinned: false,
      isDeleted: false,
      createdAt: now,
      updatedAt: now,
    };
    await db.notes.add(note);
    return note;
  },

  async getNotes(notebookId?: string, includeDeleted: boolean = false): Promise<Note[]> {
    let results: Note[];
    
    if (notebookId) {
      results = await db.notes.where('notebookId').equals(notebookId).toArray();
    } else {
      results = await db.notes.toArray();
    }

    if (!includeDeleted) {
      results = results.filter(note => !note.isDeleted);
    }

    return results.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return b.updatedAt - a.updatedAt;
    });
  },

  async getNote(id: string): Promise<Note | undefined> {
    return db.notes.get(id);
  },

  async updateNote(id: string, updates: Partial<Note>): Promise<void> {
    await db.notes.update(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },

  async deleteNote(id: string): Promise<void> {
    await db.notes.update(id, {
      isDeleted: true,
      updatedAt: Date.now(),
    });
  },

  async permanentlyDeleteNote(id: string): Promise<void> {
    await db.notes.delete(id);
  },

  async restoreNote(id: string): Promise<void> {
    await db.notes.update(id, {
      isDeleted: false,
      updatedAt: Date.now(),
    });
  },

  async togglePinNote(id: string): Promise<void> {
    const note = await db.notes.get(id);
    if (note) {
      await db.notes.update(id, {
        isPinned: !note.isPinned,
        updatedAt: Date.now(),
      });
    }
  },

  async getTrashedNotes(): Promise<Note[]> {
    const allNotes = await db.notes.toArray();
    return allNotes.filter(note => note.isDeleted);
  },

  async searchNotes(query: string): Promise<Note[]> {
    const lowerQuery = query.toLowerCase();
    const allNotes = await db.notes.toArray();
    
    return allNotes
      .filter(note => 
        !note.isDeleted &&
        (note.title.toLowerCase().includes(lowerQuery) ||
        note.content.toLowerCase().includes(lowerQuery) ||
        note.tags.some(tag => tag.toLowerCase().includes(lowerQuery)))
      )
      .sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return b.updatedAt - a.updatedAt;
      });
  },

  async getNotebookNoteCount(notebookId: string): Promise<number> {
    const notes = await db.notes.where('notebookId').equals(notebookId).toArray();
    return notes.filter(note => !note.isDeleted).length;
  },
};
