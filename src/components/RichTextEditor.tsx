import React, { useState } from 'react';
import { Bold, Italic, Underline, Strikethrough, Code, Link, Plus, Trash2, Pin } from 'lucide-react';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  onAddNote?: () => void;
  onDelete?: () => void;
  onPin?: () => void;
  isPinned?: boolean;
  showActions?: boolean;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content,
  onChange,
  onAddNote,
  onDelete,
  onPin,
  isPinned,
  showActions = true,
}) => {
  const [showLinkPrompt, setShowLinkPrompt] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');

  const applyFormatting = (before: string, after: string) => {
    const textarea = document.getElementById('note-content') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end) || 'text';
    
    const newContent = 
      content.substring(0, start) +
      before + selectedText + after +
      content.substring(end);
    
    onChange(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = start + before.length;
      textarea.selectionEnd = start + before.length + selectedText.length;
    }, 0);
  };

  const handleAddLink = () => {
    if (linkUrl.trim()) {
      applyFormatting(`[`, `](${linkUrl})`);
      setLinkUrl('');
      setShowLinkPrompt(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-lg">
      <div className="flex items-center gap-1 p-3 border-b border-gray-200 dark:border-gray-700 flex-wrap">
        <button
          onClick={() => applyFormatting('**', '**')}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
          title="Bold"
        >
          <Bold size={18} />
        </button>
        <button
          onClick={() => applyFormatting('_', '_')}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
          title="Italic"
        >
          <Italic size={18} />
        </button>
        <button
          onClick={() => applyFormatting('<u>', '</u>')}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
          title="Underline"
        >
          <Underline size={18} />
        </button>
        <button
          onClick={() => applyFormatting('~~', '~~')}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
          title="Strikethrough"
        >
          <Strikethrough size={18} />
        </button>
        <div className="border-l border-gray-300 dark:border-gray-600 mx-1 h-6" />
        <button
          onClick={() => applyFormatting('`', '`')}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
          title="Code"
        >
          <Code size={18} />
        </button>
        <button
          onClick={() => setShowLinkPrompt(!showLinkPrompt)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
          title="Add link"
        >
          <Link size={18} />
        </button>

        {showActions && (
          <>
            <div className="border-l border-gray-300 dark:border-gray-600 mx-1 h-6" />
            {onAddNote && (
              <button
                onClick={onAddNote}
                className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900 rounded transition-colors text-blue-500"
                title="New note"
              >
                <Plus size={18} />
              </button>
            )}
            {onPin && (
              <button
                onClick={onPin}
                className={`p-2 rounded transition-colors ${
                  isPinned 
                    ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-600' 
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                title={isPinned ? 'Unpin' : 'Pin'}
              >
                <Pin size={18} />
              </button>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                className="p-2 hover:bg-red-100 dark:hover:bg-red-900 rounded transition-colors text-red-500"
                title="Delete note"
              >
                <Trash2 size={18} />
              </button>
            )}
          </>
        )}
      </div>

      {showLinkPrompt && (
        <div className="flex gap-2 p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
          <input
            type="text"
            placeholder="https://..."
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddLink()}
            className="flex-1 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-600 dark:text-white"
          />
          <button
            onClick={handleAddLink}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Add
          </button>
        </div>
      )}

      <textarea
        id="note-content"
        value={content}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 p-4 border-0 resize-none focus:outline-none dark:bg-gray-800 dark:text-white font-mono"
        placeholder="Start typing... (Markdown syntax supported)"
      />
    </div>
  );
};
