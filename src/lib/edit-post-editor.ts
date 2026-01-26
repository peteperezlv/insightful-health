/**
 * Edit Post Editor - Client-side logic
 * Handles TipTap editor initialization and form submission for editing posts
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
import { common, createLowlight } from 'lowlight';

console.log('[EDIT POST] Script loaded');

// Create lowlight instance
const lowlight = createLowlight(common);

// Editor instance
let editor: Editor | null = null;
let isFullscreen = false;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('[EDIT POST] DOM ready, initializing...');
  initializeEditor();
});

function initializeEditor() {
  const editorContent = document.getElementById('editor-content') as HTMLElement;
  const contentInput = document.getElementById('content-input') as HTMLInputElement;
  const charCount = document.getElementById('char-count') as HTMLElement;
  const wordCount = document.getElementById('word-count') as HTMLElement;
  const readingTimeEl = document.getElementById('reading-time') as HTMLElement;
  const contentCharCount = document.getElementById('content-char-count') as HTMLElement;

  if (!editorContent) {
    console.error('[EDIT POST] Editor content element not found');
    return;
  }

  // Get initial content from the hidden input
  const initialContent = contentInput?.value || '';
  
  console.log('[EDIT POST] Initializing TipTap editor with content length:', initialContent.length);

  // Initialize TipTap Editor
  editor = new Editor({
    element: editorContent,
    extensions: [
      StarterKit.configure({
        codeBlock: false,
        heading: {
          levels: [1, 2, 3, 4],
        },
        horizontalRule: false,
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-emerald-600 hover:text-emerald-700 underline',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg my-4',
        },
      }),
      Placeholder.configure({
        placeholder: 'Start writing your health insights...',
        emptyEditorClass: 'is-editor-empty',
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          class: 'bg-gray-900 text-gray-100 rounded-lg p-4 my-4 overflow-x-auto',
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
      HorizontalRule.configure({
        HTMLAttributes: {
          class: 'my-8 border-t-2 border-gray-300',
        },
      }),
    ],
    content: initialContent,
    editable: true,
    editorProps: {
      attributes: {
        class: 'prose prose-emerald max-w-none focus:outline-none min-h-[300px] p-4',
      },
    },
    onCreate: ({ editor }) => {
      console.log('[EDIT POST] Editor created successfully');
      updateStats();
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      if (contentInput) {
        contentInput.value = html;
      }
      updateStats();
      
      // Mark as having unsaved changes
      const formElement = document.getElementById('edit-post-form');
      if (formElement) {
        formElement.dispatchEvent(new Event('editor-change'));
      }
    },
    onSelectionUpdate: ({ editor }) => {
      updateToolbarState();
    },
  });

  // Setup toolbar
  setupToolbar();
  
  // Update stats initially
  updateStats();

  function updateStats() {
    if (!editor) return;
    const text = editor.getText();
    const html = editor.getHTML();
    const chars = text.length;
    const htmlChars = html.length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const reading = Math.max(1, Math.ceil(words / 200));

    if (charCount) charCount.textContent = String(chars);
    if (wordCount) wordCount.textContent = String(words);
    if (readingTimeEl) readingTimeEl.textContent = String(reading);
    if (contentCharCount) contentCharCount.textContent = String(htmlChars);
  }

  function setupToolbar() {
    // Toolbar button handlers
    document.querySelectorAll('[data-action]').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (!editor) return;
        
        const action = (btn as HTMLElement).dataset.action;
        
        switch (action) {
          case 'bold':
            editor.chain().focus().toggleBold().run();
            break;
          case 'italic':
            editor.chain().focus().toggleItalic().run();
            break;
          case 'underline':
            editor.chain().focus().toggleUnderline().run();
            break;
          case 'strike':
            editor.chain().focus().toggleStrike().run();
            break;
          case 'code':
            editor.chain().focus().toggleCode().run();
            break;
          case 'bulletList':
            editor.chain().focus().toggleBulletList().run();
            break;
          case 'orderedList':
            editor.chain().focus().toggleOrderedList().run();
            break;
          case 'blockquote':
            editor.chain().focus().toggleBlockquote().run();
            break;
          case 'codeBlock':
            editor.chain().focus().toggleCodeBlock().run();
            break;
          case 'hr':
            editor.chain().focus().setHorizontalRule().run();
            break;
          case 'table':
            // Insert a 3x3 table with header row by default
            editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
            break;
          case 'addRowBefore':
            editor.chain().focus().addRowBefore().run();
            break;
          case 'addRowAfter':
            editor.chain().focus().addRowAfter().run();
            break;
          case 'deleteRow':
            editor.chain().focus().deleteRow().run();
            break;
          case 'addColumnBefore':
            editor.chain().focus().addColumnBefore().run();
            break;
          case 'addColumnAfter':
            editor.chain().focus().addColumnAfter().run();
            break;
          case 'deleteColumn':
            editor.chain().focus().deleteColumn().run();
            break;
          case 'deleteTable':
            editor.chain().focus().deleteTable().run();
            break;
          case 'clearFormat':
            editor.chain().focus().clearNodes().unsetAllMarks().run();
            break;
          case 'undo':
            editor.chain().focus().undo().run();
            break;
          case 'redo':
            editor.chain().focus().redo().run();
            break;
          case 'alignLeft':
            editor.chain().focus().setTextAlign('left').run();
            break;
          case 'alignCenter':
            editor.chain().focus().setTextAlign('center').run();
            break;
          case 'alignRight':
            editor.chain().focus().setTextAlign('right').run();
            break;
          case 'link':
            openLinkModal();
            break;
          case 'image':
            openImageModal();
            break;
          case 'fullscreen':
            toggleFullscreen();
            break;
        }
        
        updateToolbarState();
      });
    });

    // Heading select
    const headingSelect = document.getElementById('heading-select') as HTMLSelectElement;
    headingSelect?.addEventListener('change', (e) => {
      if (!editor) return;
      const level = (e.target as HTMLSelectElement).value;
      
      if (level === 'paragraph') {
        editor.chain().focus().setParagraph().run();
      } else {
        editor.chain().focus().setHeading({ level: parseInt(level) as 1 | 2 | 3 | 4 }).run();
      }
      
      updateToolbarState();
    });
  }

  function updateToolbarState() {
    if (!editor) return;

    document.querySelectorAll('[data-action]').forEach((btn) => {
      const action = (btn as HTMLElement).dataset.action;
      let isActive = false;

      switch (action) {
        case 'bold': isActive = editor.isActive('bold'); break;
        case 'italic': isActive = editor.isActive('italic'); break;
        case 'underline': isActive = editor.isActive('underline'); break;
        case 'strike': isActive = editor.isActive('strike'); break;
        case 'code': isActive = editor.isActive('code'); break;
        case 'bulletList': isActive = editor.isActive('bulletList'); break;
        case 'orderedList': isActive = editor.isActive('orderedList'); break;
        case 'blockquote': isActive = editor.isActive('blockquote'); break;
        case 'codeBlock': isActive = editor.isActive('codeBlock'); break;
        case 'alignLeft': isActive = editor.isActive({ textAlign: 'left' }); break;
        case 'alignCenter': isActive = editor.isActive({ textAlign: 'center' }); break;
        case 'alignRight': isActive = editor.isActive({ textAlign: 'right' }); break;
        case 'link': isActive = editor.isActive('link'); break;
      }

      if (isActive) {
        btn.classList.add('is-active');
      } else {
        btn.classList.remove('is-active');
      }
    });

    // Update heading select
    const headingSelect = document.getElementById('heading-select') as HTMLSelectElement;
    if (headingSelect) {
      if (editor.isActive('heading', { level: 1 })) headingSelect.value = '1';
      else if (editor.isActive('heading', { level: 2 })) headingSelect.value = '2';
      else if (editor.isActive('heading', { level: 3 })) headingSelect.value = '3';
      else if (editor.isActive('heading', { level: 4 })) headingSelect.value = '4';
      else headingSelect.value = 'paragraph';
    }

    // Show/hide table operations based on cursor position
    const tableOps = document.getElementById('table-operations');
    if (tableOps) {
      if (editor.isActive('table')) {
        tableOps.style.display = 'flex';
      } else {
        tableOps.style.display = 'none';
      }
    }
  }

  function toggleFullscreen() {
    const wrapper = document.getElementById('editor-wrapper');
    if (!wrapper) return;

    isFullscreen = !isFullscreen;
    
    if (isFullscreen) {
      wrapper.classList.add('fullscreen');
      document.body.style.overflow = 'hidden';
    } else {
      wrapper.classList.remove('fullscreen');
      document.body.style.overflow = '';
    }
  }

  function openLinkModal() {
    const modal = document.getElementById('link-modal');
    const linkUrlInput = document.getElementById('link-url') as HTMLInputElement;
    
    if (!modal || !editor) return;
    
    // Pre-fill with existing link if any
    const previousUrl = editor.getAttributes('link').href;
    if (linkUrlInput && previousUrl) {
      linkUrlInput.value = previousUrl;
    }
    
    modal.classList.remove('hidden');
    linkUrlInput?.focus();
  }

  function openImageModal() {
    const modal = document.getElementById('image-modal');
    if (!modal) return;
    
    modal.classList.remove('hidden');
    const imageUrlInput = document.getElementById('image-url') as HTMLInputElement;
    imageUrlInput?.focus();
  }

  // Link modal handlers
  const confirmLinkBtn = document.getElementById('confirm-link-btn');
  const removeLinkBtn = document.getElementById('remove-link-btn');
  const cancelLinkBtn = document.getElementById('cancel-link-btn');
  const linkBackdrop = document.getElementById('link-backdrop');
  const linkModal = document.getElementById('link-modal');

  confirmLinkBtn?.addEventListener('click', () => {
    const linkUrlInput = document.getElementById('link-url') as HTMLInputElement;
    const url = linkUrlInput?.value;
    
    if (url && editor) {
      editor.chain().focus().setLink({ href: url }).run();
    }
    
    if (linkModal) linkModal.classList.add('hidden');
    if (linkUrlInput) linkUrlInput.value = '';
  });

  removeLinkBtn?.addEventListener('click', () => {
    if (editor) {
      editor.chain().focus().unsetLink().run();
    }
    if (linkModal) linkModal.classList.add('hidden');
  });

  cancelLinkBtn?.addEventListener('click', () => {
    if (linkModal) linkModal.classList.add('hidden');
    const linkUrlInput = document.getElementById('link-url') as HTMLInputElement;
    if (linkUrlInput) linkUrlInput.value = '';
  });

  linkBackdrop?.addEventListener('click', () => {
    if (linkModal) linkModal.classList.add('hidden');
  });

  // Image modal handlers
  const confirmImageBtn = document.getElementById('confirm-image-btn');
  const cancelImageBtn = document.getElementById('cancel-image-btn');
  const imageBackdrop = document.getElementById('image-backdrop');
  const imageModal = document.getElementById('image-modal');

  confirmImageBtn?.addEventListener('click', () => {
    const imageUrlInput = document.getElementById('image-url') as HTMLInputElement;
    const imageAltInput = document.getElementById('image-alt') as HTMLInputElement;
    const url = imageUrlInput?.value;
    const alt = imageAltInput?.value || '';
    
    if (url && editor) {
      editor.chain().focus().setImage({ src: url, alt }).run();
    }
    
    if (imageModal) imageModal.classList.add('hidden');
    if (imageUrlInput) imageUrlInput.value = '';
    if (imageAltInput) imageAltInput.value = '';
  });

  cancelImageBtn?.addEventListener('click', () => {
    if (imageModal) imageModal.classList.add('hidden');
    const imageUrlInput = document.getElementById('image-url') as HTMLInputElement;
    const imageAltInput = document.getElementById('image-alt') as HTMLInputElement;
    if (imageUrlInput) imageUrlInput.value = '';
    if (imageAltInput) imageAltInput.value = '';
  });

  imageBackdrop?.addEventListener('click', () => {
    if (imageModal) imageModal.classList.add('hidden');
  });

  // Form submission handling
  setupFormSubmission();
}

function setupFormSubmission() {
  const form = document.getElementById('edit-post-form') as HTMLFormElement;
  const submitBtn = document.getElementById('submit-btn') as HTMLButtonElement;
  const saveDraftBtn = document.getElementById('save-draft-btn') as HTMLButtonElement;
  const unpublishBtn = document.getElementById('unpublish-btn') as HTMLButtonElement;
  const deleteBtn = document.getElementById('delete-btn') as HTMLButtonElement;
  const csrfToken = document.getElementById('csrf-token') as HTMLInputElement;
  const postIdInput = document.getElementById('post-id') as HTMLInputElement;
  const alertContainer = document.getElementById('alert-container') as HTMLElement;
  const alertMessage = document.getElementById('alert-message') as HTMLElement;
  const titleInput = document.getElementById('title') as HTMLInputElement;
  const slugInput = document.getElementById('slug') as HTMLInputElement;
  const excerptInput = document.getElementById('excerpt') as HTMLTextAreaElement;
  const contentInput = document.getElementById('content-input') as HTMLInputElement;
  const titleError = document.getElementById('title-error') as HTMLElement;
  const slugError = document.getElementById('slug-error') as HTMLElement;
  const excerptError = document.getElementById('excerpt-error') as HTMLElement;
  const contentError = document.getElementById('content-error') as HTMLElement;

  if (!form || !postIdInput) {
    console.error('[EDIT POST] Form or post ID not found');
    return;
  }

  const postId = postIdInput.value;
  let hasUnsavedChanges = false;

  // Validation constants
  const VALIDATION_RULES = {
    title: { maxLength: 200, required: true },
    slug: { maxLength: 200, pattern: /^[a-z0-9-]+$/ },
    excerpt: { maxLength: 300 },
    content: { maxLength: 50000, required: true },
    seoTitle: { maxLength: 60 },
    seoDescription: { maxLength: 160 },
  };

  function showAlert(message: string, type: 'success' | 'error' | 'info' = 'info') {
    if (!alertContainer || !alertMessage) return;
    alertContainer.classList.remove('hidden');
    alertMessage.className = `p-4 rounded-md ${
      type === 'success' ? 'bg-green-50 text-green-800' :
      type === 'error' ? 'bg-red-50 text-red-800' :
      'bg-blue-50 text-blue-800'
    }`;
    alertMessage.textContent = message;

    if (type === 'success') {
      setTimeout(() => {
        alertContainer.classList.add('hidden');
      }, 5000);
    }
  }

  function hideAlert() {
    if (alertContainer) alertContainer.classList.add('hidden');
  }

  function showFieldError(input: HTMLInputElement | HTMLTextAreaElement | null, errorEl: HTMLElement | null, message: string) {
    if (input) input.classList.add('border-red-500', 'focus:border-red-500', 'focus:ring-red-500');
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.classList.remove('hidden');
    }
  }

  function clearFieldError(input: HTMLInputElement | HTMLTextAreaElement | null, errorEl: HTMLElement | null) {
    if (input) input.classList.remove('border-red-500', 'focus:border-red-500', 'focus:ring-red-500');
    if (errorEl) {
      errorEl.textContent = '';
      errorEl.classList.add('hidden');
    }
  }

  function clearAllFieldErrors() {
    clearFieldError(titleInput, titleError);
    clearFieldError(slugInput, slugError);
    clearFieldError(excerptInput, excerptError);
    clearFieldError(contentInput, contentError);
  }

  function generateSlug(title: string): string {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  function validateForm() {
    let isValid = true;
    const errors: string[] = [];
    clearAllFieldErrors();

    const title = titleInput?.value?.trim() || '';
    const slug = slugInput?.value?.trim() || '';
    const excerpt = excerptInput?.value?.trim() || '';
    const content = contentInput?.value?.trim() || '';

    // Title validation
    if (!title) {
      showFieldError(titleInput, titleError, 'Title is required');
      errors.push('Title is required');
      isValid = false;
    } else if (title.length > VALIDATION_RULES.title.maxLength) {
      showFieldError(titleInput, titleError, `Title must be ${VALIDATION_RULES.title.maxLength} characters or less`);
      errors.push(`Title exceeds ${VALIDATION_RULES.title.maxLength} characters`);
      isValid = false;
    }

    // Slug validation
    if (slug && slug.length > VALIDATION_RULES.slug.maxLength) {
      showFieldError(slugInput, slugError, `Slug must be ${VALIDATION_RULES.slug.maxLength} characters or less`);
      errors.push(`Slug exceeds ${VALIDATION_RULES.slug.maxLength} characters`);
      isValid = false;
    } else if (slug && !VALIDATION_RULES.slug.pattern.test(slug)) {
      showFieldError(slugInput, slugError, 'Slug can only contain lowercase letters, numbers, and hyphens');
      errors.push('Invalid slug format');
      isValid = false;
    }

    // Excerpt validation
    if (excerpt && excerpt.length > VALIDATION_RULES.excerpt.maxLength) {
      showFieldError(excerptInput, excerptError, `Excerpt must be ${VALIDATION_RULES.excerpt.maxLength} characters or less`);
      errors.push(`Excerpt exceeds ${VALIDATION_RULES.excerpt.maxLength} characters`);
      isValid = false;
    }

    // Content validation
    if (!content || content === '<p></p>') {
      showFieldError(contentInput, contentError, 'Content is required');
      errors.push('Content is required');
      isValid = false;
    } else if (content.length > VALIDATION_RULES.content.maxLength) {
      showFieldError(contentInput, contentError, `Content must be ${VALIDATION_RULES.content.maxLength} characters or less`);
      errors.push(`Content exceeds ${VALIDATION_RULES.content.maxLength} characters`);
      isValid = false;
    }

    return { isValid, errors };
  }

  function getFormData() {
    const formData = new FormData(form);
    const tagsValue = formData.get('tags') as string;
    const keywordsValue = formData.get('keywords') as string;

    return {
      title: formData.get('title'),
      slug: formData.get('slug') || generateSlug((formData.get('title') as string) || ''),
      excerpt: formData.get('excerpt'),
      content: contentInput?.value,
      featuredImageUrl: formData.get('featuredImageUrl'),
      status: formData.get('status'),
      isFeatured: formData.get('is-featured') === 'on',
      categoryId: formData.get('category'),
      tags: tagsValue ? tagsValue.split(',').map(t => t.trim()).filter(Boolean) : [],
      seoTitle: formData.get('seo-title'),
      seoDescription: formData.get('seo-description'),
      seoKeywords: keywordsValue ? keywordsValue.split(',').map(k => k.trim()).filter(Boolean) : [],
      canonicalUrl: formData.get('canonical-url'),
      scheduledFor: formData.get('scheduled-for'),
    };
  }

  // Track unsaved changes
  form?.addEventListener('input', () => {
    hasUnsavedChanges = true;
  });

  // Form submission (publish/update)
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideAlert();
    
    const { isValid, errors } = validateForm();
    
    if (!isValid) {
      showAlert(`Please fix the following errors: ${errors.join(', ')}`, 'error');
      return;
    }
    
    const data = getFormData();
    data.status = 'published';
    
    try {
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Publishing...';
      }

      const response = await fetch(`/api/posts/${postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken?.value || '',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        hasUnsavedChanges = false;
        showAlert('Post updated successfully!', 'success');
        const statusPublished = document.getElementById('status-published') as HTMLInputElement;
        if (statusPublished) statusPublished.checked = true;
        if (submitBtn) submitBtn.textContent = 'Update Post';
        if (unpublishBtn) unpublishBtn.classList.remove('hidden');
      } else {
        if (result.error?.includes('slug')) {
          showFieldError(slugInput, slugError, result.error);
        }
        showAlert(result.error || 'Failed to update post', 'error');
      }
    } catch (error) {
      console.error('Update error:', error);
      showAlert('An error occurred while updating', 'error');
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        const isPublished = (document.getElementById('status-published') as HTMLInputElement)?.checked;
        submitBtn.textContent = isPublished ? 'Update Post' : 'Publish Post';
      }
    }
  });

  // Save as draft
  saveDraftBtn?.addEventListener('click', async () => {
    const data = getFormData();
    data.status = 'draft';
    
    try {
      saveDraftBtn.disabled = true;
      saveDraftBtn.textContent = 'Saving...';

      const response = await fetch(`/api/posts/${postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken?.value || '',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        hasUnsavedChanges = false;
        showAlert('Saved as draft!', 'success');
        const statusDraft = document.getElementById('status-draft') as HTMLInputElement;
        if (statusDraft) statusDraft.checked = true;
        if (submitBtn) submitBtn.textContent = 'Publish Post';
        if (unpublishBtn) unpublishBtn.classList.add('hidden');
      } else {
        showAlert(result.error || 'Failed to save draft', 'error');
      }
    } catch (error) {
      console.error('Save draft error:', error);
      showAlert('An error occurred while saving', 'error');
    } finally {
      saveDraftBtn.disabled = false;
      saveDraftBtn.textContent = 'Save as Draft';
    }
  });

  // Unpublish
  unpublishBtn?.addEventListener('click', async () => {
    const data = getFormData();
    data.status = 'draft';
    
    try {
      unpublishBtn.disabled = true;
      unpublishBtn.textContent = 'Unpublishing...';

      const response = await fetch(`/api/posts/${postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken?.value || '',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        hasUnsavedChanges = false;
        showAlert('Post unpublished and saved as draft', 'success');
        const statusDraft = document.getElementById('status-draft') as HTMLInputElement;
        if (statusDraft) statusDraft.checked = true;
        if (submitBtn) submitBtn.textContent = 'Publish Post';
        unpublishBtn.classList.add('hidden');
      } else {
        showAlert(result.error || 'Failed to unpublish', 'error');
      }
    } catch (error) {
      console.error('Unpublish error:', error);
      showAlert('An error occurred', 'error');
    } finally {
      unpublishBtn.disabled = false;
      unpublishBtn.textContent = 'Unpublish';
    }
  });

  // Delete post
  deleteBtn?.addEventListener('click', async () => {
    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return;
    }

    try {
      deleteBtn.disabled = true;
      deleteBtn.textContent = 'Deleting...';

      const response = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken?.value || '',
        },
      });

      const result = await response.json();

      if (response.ok && result.success) {
        showAlert('Post deleted successfully', 'success');
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1500);
      } else {
        showAlert(result.error || 'Failed to delete post', 'error');
      }
    } catch (error) {
      console.error('Delete error:', error);
      showAlert('An error occurred while deleting', 'error');
    } finally {
      deleteBtn.disabled = false;
      deleteBtn.textContent = 'Delete Post';
    }
  });

  // Warn about unsaved changes
  window.addEventListener('beforeunload', (e) => {
    if (hasUnsavedChanges) {
      e.preventDefault();
      e.returnValue = '';
    }
  });
}

// Export for potential external use
export { editor };
