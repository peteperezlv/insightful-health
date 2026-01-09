/**
 * Rich Text Editor Component using TipTap
 * WYSIWYG editor with full formatting support
 * Implements Prompt 4.2 requirements
 */

import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import HorizontalRule from '@tiptap/extension-horizontal-rule';
import CharacterCount from '@tiptap/extension-character-count';
import { common, createLowlight } from 'lowlight';

// Create lowlight instance with common languages for syntax highlighting
const lowlight = createLowlight(common);

export interface EditorOptions {
  element: HTMLElement;
  content?: string;
  placeholder?: string;
  onUpdate?: (html: string) => void;
  onSelectionUpdate?: () => void;
}

export interface RichTextEditorInstance {
  editor: Editor;
  getHTML: () => string;
  getJSON: () => object;
  setContent: (content: string) => void;
  destroy: () => void;
  focus: () => void;
  isEmpty: () => boolean;
  getCharacterCount: () => number;
  getWordCount: () => number;
  getReadingTime: () => number; // in minutes
  toggleFullscreen: () => void;
  isFullscreen: boolean;
}

/**
 * Create a TipTap rich text editor instance
 * Implements all Prompt 4.2 requirements
 */
export function createRichTextEditor(options: EditorOptions): RichTextEditorInstance {
  const { element, content = '', placeholder = 'Write your content here...', onUpdate, onSelectionUpdate } = options;

  let isFullscreenMode = false;

  const editor = new Editor({
    element,
    extensions: [
      StarterKit.configure({
        codeBlock: false, // We use CodeBlockLowlight instead
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
        horizontalRule: false, // We use separate HorizontalRule extension
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-emerald-600 hover:text-emerald-700 underline',
          target: '_blank',
          rel: 'noopener noreferrer',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg my-4',
        },
        inline: false,
        allowBase64: true, // Allow base64 for preview while uploading
      }),
      Placeholder.configure({
        placeholder,
        emptyEditorClass: 'is-editor-empty',
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right', 'justify'],
      }),
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          class: 'bg-gray-900 text-gray-100 rounded-lg p-4 my-4 overflow-x-auto',
        },
      }),
      HorizontalRule.configure({
        HTMLAttributes: {
          class: 'my-8 border-t-2 border-gray-300',
        },
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'border-collapse table-auto w-full my-4',
        },
      }),
      TableRow,
      TableCell.configure({
        HTMLAttributes: {
          class: 'border border-gray-300 px-4 py-2',
        },
      }),
      TableHeader.configure({
        HTMLAttributes: {
          class: 'border border-gray-300 px-4 py-2 bg-gray-100 font-semibold',
        },
      }),
      CharacterCount.configure({
        limit: 50000, // Max content length
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class: 'prose prose-emerald max-w-none focus:outline-none min-h-[300px] p-4',
        spellcheck: 'true',
      },
      // Handle drag and drop for images
      handleDrop: (view, event, slice, moved) => {
        if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]) {
          const file = event.dataTransfer.files[0];
          if (file.type.startsWith('image/')) {
            event.preventDefault();
            // This will be handled by the calling code's image upload handler
            const customEvent = new CustomEvent('editor-image-drop', { detail: { file } });
            element.dispatchEvent(customEvent);
            return true;
          }
        }
        return false;
      },
    },
    onUpdate: ({ editor }) => {
      if (onUpdate) {
        onUpdate(editor.getHTML());
      }
    },
    onSelectionUpdate: () => {
      if (onSelectionUpdate) {
        onSelectionUpdate();
      }
    },
  });

  // Fullscreen toggle function
  const toggleFullscreen = () => {
    const wrapper = element.closest('.editor-wrapper');
    if (!wrapper) return;

    if (!isFullscreenMode) {
      wrapper.classList.add('editor-fullscreen');
      document.body.style.overflow = 'hidden';
      isFullscreenMode = true;
    } else {
      wrapper.classList.remove('editor-fullscreen');
      document.body.style.overflow = '';
      isFullscreenMode = false;
    }
  };

  return {
    editor,
    getHTML: () => editor.getHTML(),
    getJSON: () => editor.getJSON(),
    setContent: (content: string) => editor.commands.setContent(content),
    destroy: () => {
      // Clean up fullscreen if active
      if (isFullscreenMode) {
        toggleFullscreen();
      }
      editor.destroy();
    },
    focus: () => editor.commands.focus(),
    isEmpty: () => editor.isEmpty,
    getCharacterCount: () => {
      return editor.storage.characterCount?.characters?.() || editor.getText().length;
    },
    getWordCount: () => {
      const text = editor.getText();
      return text.trim() ? text.trim().split(/\s+/).length : 0;
    },
    getReadingTime: () => {
      const words = editor.getText().trim() ? editor.getText().trim().split(/\s+/).length : 0;
      return Math.max(1, Math.ceil(words / 200)); // 200 words per minute
    },
    toggleFullscreen,
    isFullscreen: isFullscreenMode,
  };
}

/**
 * Editor toolbar actions
 * All formatting commands for the rich text editor
 */
export const editorActions = {
  // Text formatting
  toggleBold: (editor: Editor) => editor.chain().focus().toggleBold().run(),
  toggleItalic: (editor: Editor) => editor.chain().focus().toggleItalic().run(),
  toggleUnderline: (editor: Editor) => editor.chain().focus().toggleUnderline().run(),
  toggleStrike: (editor: Editor) => editor.chain().focus().toggleStrike().run(),
  toggleCode: (editor: Editor) => editor.chain().focus().toggleCode().run(),

  // Headings
  setHeading: (editor: Editor, level: 1 | 2 | 3 | 4 | 5 | 6) => 
    editor.chain().focus().toggleHeading({ level }).run(),
  setParagraph: (editor: Editor) => editor.chain().focus().setParagraph().run(),

  // Lists
  toggleBulletList: (editor: Editor) => editor.chain().focus().toggleBulletList().run(),
  toggleOrderedList: (editor: Editor) => editor.chain().focus().toggleOrderedList().run(),

  // Blocks
  toggleBlockquote: (editor: Editor) => editor.chain().focus().toggleBlockquote().run(),
  toggleCodeBlock: (editor: Editor) => editor.chain().focus().toggleCodeBlock().run(),
  setHorizontalRule: (editor: Editor) => editor.chain().focus().setHorizontalRule().run(),

  // Text alignment
  setTextAlign: (editor: Editor, alignment: 'left' | 'center' | 'right' | 'justify') =>
    editor.chain().focus().setTextAlign(alignment).run(),

  // Links
  setLink: (editor: Editor, url: string) => {
    if (url) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    } else {
      editor.chain().focus().unsetLink().run();
    }
  },
  unsetLink: (editor: Editor) => editor.chain().focus().unsetLink().run(),

  // Images
  insertImage: (editor: Editor, src: string, alt?: string) => {
    editor.chain().focus().setImage({ src, alt: alt || '' }).run();
  },

  // Tables
  insertTable: (editor: Editor, rows = 3, cols = 3) => {
    editor.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run();
  },
  deleteTable: (editor: Editor) => editor.chain().focus().deleteTable().run(),
  addColumnBefore: (editor: Editor) => editor.chain().focus().addColumnBefore().run(),
  addColumnAfter: (editor: Editor) => editor.chain().focus().addColumnAfter().run(),
  deleteColumn: (editor: Editor) => editor.chain().focus().deleteColumn().run(),
  addRowBefore: (editor: Editor) => editor.chain().focus().addRowBefore().run(),
  addRowAfter: (editor: Editor) => editor.chain().focus().addRowAfter().run(),
  deleteRow: (editor: Editor) => editor.chain().focus().deleteRow().run(),
  toggleHeaderRow: (editor: Editor) => editor.chain().focus().toggleHeaderRow().run(),
  toggleHeaderColumn: (editor: Editor) => editor.chain().focus().toggleHeaderColumn().run(),
  toggleHeaderCell: (editor: Editor) => editor.chain().focus().toggleHeaderCell().run(),
  mergeCells: (editor: Editor) => editor.chain().focus().mergeCells().run(),
  splitCell: (editor: Editor) => editor.chain().focus().splitCell().run(),

  // History
  undo: (editor: Editor) => editor.chain().focus().undo().run(),
  redo: (editor: Editor) => editor.chain().focus().redo().run(),

  // Utilities
  clearFormatting: (editor: Editor) => editor.chain().focus().clearNodes().unsetAllMarks().run(),
  selectAll: (editor: Editor) => editor.chain().focus().selectAll().run(),
};

/**
 * Check if a formatting is active
 */
export const isActive = {
  bold: (editor: Editor) => editor.isActive('bold'),
  italic: (editor: Editor) => editor.isActive('italic'),
  underline: (editor: Editor) => editor.isActive('underline'),
  strike: (editor: Editor) => editor.isActive('strike'),
  code: (editor: Editor) => editor.isActive('code'),
  heading: (editor: Editor, level: number) => editor.isActive('heading', { level }),
  bulletList: (editor: Editor) => editor.isActive('bulletList'),
  orderedList: (editor: Editor) => editor.isActive('orderedList'),
  blockquote: (editor: Editor) => editor.isActive('blockquote'),
  codeBlock: (editor: Editor) => editor.isActive('codeBlock'),
  link: (editor: Editor) => editor.isActive('link'),
  textAlign: (editor: Editor, alignment: string) => editor.isActive({ textAlign: alignment }),
  table: (editor: Editor) => editor.isActive('table'),
};

/**
 * Keyboard shortcuts reference
 * All shortcuts that work in the editor
 */
export const keyboardShortcuts = {
  bold: 'Ctrl/Cmd + B',
  italic: 'Ctrl/Cmd + I',
  underline: 'Ctrl/Cmd + U',
  strike: 'Ctrl/Cmd + Shift + X',
  code: 'Ctrl/Cmd + E',
  link: 'Ctrl/Cmd + K',
  undo: 'Ctrl/Cmd + Z',
  redo: 'Ctrl/Cmd + Shift + Z / Ctrl/Cmd + Y',
  bulletList: 'Ctrl/Cmd + Shift + 8',
  orderedList: 'Ctrl/Cmd + Shift + 7',
  blockquote: 'Ctrl/Cmd + Shift + B',
  codeBlock: 'Ctrl/Cmd + Alt + C',
  horizontalRule: 'Ctrl/Cmd + Alt + -',
  selectAll: 'Ctrl/Cmd + A',
  hardBreak: 'Shift + Enter',
};

/**
 * Upload image to server
 * @param file - Image file to upload
 * @param csrfToken - CSRF token for security
 * @returns Promise with image URL or error
 */
export async function uploadImage(
  file: File,
  csrfToken: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    // Validate file
    if (!file.type.startsWith('image/')) {
      return { success: false, error: 'File must be an image' };
    }

    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return { success: false, error: 'Image must be less than 5MB' };
    }

    // Create form data
    const formData = new FormData();
    formData.append('image', file);

    // Upload to server
    const response = await fetch('/api/upload/image', {
      method: 'POST',
      headers: {
        'X-CSRF-Token': csrfToken,
      },
      body: formData,
    });

    const result = await response.json();

    if (response.ok && result.success) {
      return { success: true, url: result.url };
    } else {
      return { success: false, error: result.error || 'Failed to upload image' };
    }
  } catch (error: any) {
    console.error('Image upload error:', error);
    return { success: false, error: 'Failed to upload image' };
  }
}
