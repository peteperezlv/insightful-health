/**
 * Create Post Editor - Client-side logic
 * Handles TipTap editor initialization and form submission
 */

import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import HorizontalRule from '@tiptap/extension-horizontal-rule';
import { common, createLowlight } from 'lowlight';

console.log('[CREATE POST] Script loaded');
console.log('[CREATE POST] TipTap modules imported');

// Create lowlight instance
const lowlight = createLowlight(common);

// Editor instance
let editor: Editor | null = null;
let isFullscreen = false;
let hasUnsavedChanges = false;
let autoSaveTimer: number | null = null;
let draftId: string | null = null;

// Validation configuration
const VALIDATION_RULES = {
  title: { maxLength: 200 },
  slug: { maxLength: 200, pattern: /^[a-z0-9-]+$/ },
  excerpt: { maxLength: 300 },
  content: { maxLength: 50000 },
  seoTitle: { maxLength: 60 },
  seoDescription: { maxLength: 160 },
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('[CREATE POST] DOM ready, initializing...');
  initializeEditor();
});

function initializeEditor() {
  // DOM Elements
  const form = document.getElementById('create-post-form') as HTMLFormElement;
  const titleInput = document.getElementById('title') as HTMLInputElement;
  const slugInput = document.getElementById('slug') as HTMLInputElement;
  const excerptInput = document.getElementById('excerpt') as HTMLTextAreaElement;
  const contentInput = document.getElementById('content-input') as HTMLInputElement;
  const seoTitleInput = document.getElementById('seo-title') as HTMLInputElement;
  const seoDescInput = document.getElementById('seo-description') as HTMLTextAreaElement;
  const csrfToken = document.getElementById('csrf-token') as HTMLInputElement;
  const alertContainer = document.getElementById('alert-container') as HTMLElement;
  const alertMessage = document.getElementById('alert-message') as HTMLElement;
  const autosaveStatus = document.getElementById('autosave-status') as HTMLElement;
  const submitBtn = document.getElementById('submit-btn') as HTMLButtonElement;
  const saveDraftBtn = document.getElementById('save-draft-btn') as HTMLButtonElement;
  const editorContent = document.getElementById('editor-content') as HTMLElement;
  const editorWrapper = document.getElementById('editor-wrapper') as HTMLElement;
  const imageDropzone = document.getElementById('image-dropzone') as HTMLElement;

  console.log('[CREATE POST] DOM elements initialized', {
    formExists: !!form,
    submitBtnExists: !!submitBtn,
    contentInputExists: !!contentInput,
    csrfTokenExists: !!csrfToken,
    titleInputExists: !!titleInput,
    slugInputExists: !!slugInput,
  });

  // Error display elements
  const titleError = document.getElementById('title-error') as HTMLElement;
  const slugError = document.getElementById('slug-error') as HTMLElement;
  const excerptError = document.getElementById('excerpt-error') as HTMLElement;
  const contentError = document.getElementById('content-error') as HTMLElement;
  const imageError = document.getElementById('image-error') as HTMLElement;
  const seoTitleError = document.getElementById('seo-title-error') as HTMLElement;
  const seoDescError = document.getElementById('seo-description-error') as HTMLElement;

  // Counter elements
  const titleCount = document.getElementById('title-count') as HTMLElement;
  const excerptCount = document.getElementById('excerpt-count') as HTMLElement;
  const charCount = document.getElementById('char-count') as HTMLElement;
  const wordCount = document.getElementById('word-count') as HTMLElement;
  const readingTimeEl = document.getElementById('reading-time') as HTMLElement;
  const seoTitleCount = document.getElementById('seo-title-count') as HTMLElement;
  const seoDescCount = document.getElementById('seo-description-count') as HTMLElement;
  const contentCharCount = document.getElementById('content-char-count') as HTMLElement;

  // Helper functions
  function showAlert(message: string, type: 'success' | 'error') {
    alertContainer.classList.remove('hidden');
    alertMessage.className = `p-4 rounded-md ${
      type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
    }`;
    alertMessage.textContent = message;
    setTimeout(() => hideAlert(), 5000);
  }

  function hideAlert() {
    alertContainer.classList.add('hidden');
  }

  function showFieldError(input: HTMLInputElement | HTMLTextAreaElement | null, errorEl: HTMLElement, message: string) {
    if (input) {
      input.classList.add('border-red-500');
      input.classList.remove('border-gray-300');
    }
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.classList.remove('hidden');
    }
  }

  function clearFieldError(input: HTMLInputElement | HTMLTextAreaElement | null, errorEl: HTMLElement) {
    if (input) {
      input.classList.remove('border-red-500');
      input.classList.add('border-gray-300');
    }
    if (errorEl) {
      errorEl.textContent = '';
      errorEl.classList.add('hidden');
    }
  }

  function clearAllFieldErrors() {
    clearFieldError(titleInput, titleError);
    clearFieldError(slugInput, slugError);
    clearFieldError(excerptInput, excerptError);
    clearFieldError(seoTitleInput, seoTitleError);
    clearFieldError(seoDescInput, seoDescError);
    if (contentError) {
      contentError.textContent = '';
      contentError.classList.add('hidden');
    }
    if (editorWrapper) {
      editorWrapper.classList.remove('border-red-500');
      editorWrapper.classList.add('border-gray-300');
    }
  }

  function updateCount(input: HTMLInputElement | HTMLTextAreaElement, countEl: HTMLElement) {
    if (countEl) {
      countEl.textContent = input.value.length.toString();
    }
  }

  function generateSlug(title: string): string {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  function validateForm() {
    let isValid = true;
    const errors: string[] = [];
    clearAllFieldErrors();

    const title = titleInput?.value?.trim() || '';
    const slug = slugInput?.value?.trim() || '';
    const excerpt = excerptInput?.value?.trim() || '';
    const content = contentInput?.value?.trim() || '';
    const seoTitle = seoTitleInput?.value?.trim() || '';
    const seoDesc = seoDescInput?.value?.trim() || '';

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
    if (slug && !VALIDATION_RULES.slug.pattern.test(slug)) {
      showFieldError(slugInput, slugError, 'Slug can only contain lowercase letters, numbers, and hyphens');
      errors.push('Invalid slug format');
      isValid = false;
    } else if (slug.length > VALIDATION_RULES.slug.maxLength) {
      showFieldError(slugInput, slugError, `Slug must be ${VALIDATION_RULES.slug.maxLength} characters or less`);
      errors.push(`Slug exceeds ${VALIDATION_RULES.slug.maxLength} characters`);
      isValid = false;
    }

    // Excerpt validation
    if (excerpt.length > VALIDATION_RULES.excerpt.maxLength) {
      showFieldError(excerptInput, excerptError, `Excerpt must be ${VALIDATION_RULES.excerpt.maxLength} characters or less`);
      errors.push(`Excerpt exceeds ${VALIDATION_RULES.excerpt.maxLength} characters`);
      isValid = false;
    }

    // Content validation
    const contentEmpty = !content || content === '<p></p>' || content === '<p><br></p>' || content.trim() === '';
    console.log('[CREATE POST] Content validation:', {
      content: content?.substring(0, 100),
      contentLength: content?.length,
      isEmpty: contentEmpty,
    });

    if (contentEmpty) {
      showFieldError(null, contentError, 'Content is required');
      editorWrapper?.classList.add('border-red-500');
      editorWrapper?.classList.remove('border-gray-300');
      errors.push('Content is required');
      isValid = false;
    } else if (content.length > VALIDATION_RULES.content.maxLength) {
      showFieldError(null, contentError, `Content must be ${VALIDATION_RULES.content.maxLength} characters or less`);
      editorWrapper?.classList.add('border-red-500');
      editorWrapper?.classList.remove('border-gray-300');
      errors.push(`Content exceeds ${VALIDATION_RULES.content.maxLength} characters`);
      isValid = false;
    }

    // SEO Title validation
    if (seoTitle.length > VALIDATION_RULES.seoTitle.maxLength) {
      showFieldError(seoTitleInput, seoTitleError, `SEO title must be ${VALIDATION_RULES.seoTitle.maxLength} characters or less`);
      errors.push(`SEO title exceeds ${VALIDATION_RULES.seoTitle.maxLength} characters`);
      isValid = false;
      document.getElementById('seo-panel')?.classList.remove('hidden');
    }

    // SEO Description validation
    if (seoDesc.length > VALIDATION_RULES.seoDescription.maxLength) {
      showFieldError(seoDescInput, seoDescError, `Meta description must be ${VALIDATION_RULES.seoDescription.maxLength} characters or less`);
      errors.push(`Meta description exceeds ${VALIDATION_RULES.seoDescription.maxLength} characters`);
      isValid = false;
      document.getElementById('seo-panel')?.classList.remove('hidden');
    }

    if (!isValid) {
      const firstErrorElement = document.querySelector('.text-red-500:not(.hidden)');
      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
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
      content: contentInput.value,
      featuredImageUrl: formData.get('featuredImageUrl'),
      status: formData.get('status'),
      categoryId: formData.get('category'),
      tags: tagsValue ? tagsValue.split(',').map(t => t.trim()).filter(Boolean) : [],
      seoTitle: formData.get('seo-title'),
      seoDescription: formData.get('seo-description'),
      seoKeywords: keywordsValue ? keywordsValue.split(',').map(k => k.trim()).filter(Boolean) : [],
      canonicalUrl: formData.get('canonical-url'),
      scheduledFor: formData.get('scheduled-for'),
    };
  }

  // Initialize TipTap Editor
  function initEditor() {
    console.log('[CREATE POST] Initializing TipTap editor...');
    editor = new Editor({
      element: editorContent,
      extensions: [
        StarterKit.configure({
          codeBlock: false, // We use CodeBlockLowlight instead
          heading: {
            levels: [1, 2, 3, 4],
          },
          horizontalRule: false, // We use separate HorizontalRule extension
        }),
        Underline, // Not in StarterKit, so we add it
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
        HorizontalRule.configure({
          HTMLAttributes: {
            class: 'my-8 border-t-2 border-gray-300',
          },
        }),
      ],
      content: '',
      editorProps: {
        attributes: {
          class: 'prose prose-emerald max-w-none focus:outline-none min-h-[300px] p-4',
        },
      },
      onUpdate: ({ editor }) => {
        const html = editor.getHTML();
        contentInput.value = html;
        updateStats();
        updateToolbarState();
        hasUnsavedChanges = true;
      },
      onSelectionUpdate: ({ editor }) => {
        updateToolbarState();
      },
    });
    console.log('[CREATE POST] TipTap editor initialized');
    updateStats();
  }

  function updateToolbarState() {
    if (!editor) return;

    // Update button active states
    const buttons = {
      bold: document.querySelector('[data-action="bold"]'),
      italic: document.querySelector('[data-action="italic"]'),
      underline: document.querySelector('[data-action="underline"]'),
      strike: document.querySelector('[data-action="strike"]'),
      code: document.querySelector('[data-action="code"]'),
      codeBlock: document.querySelector('[data-action="codeBlock"]'),
      bulletList: document.querySelector('[data-action="bulletList"]'),
      orderedList: document.querySelector('[data-action="orderedList"]'),
      blockquote: document.querySelector('[data-action="blockquote"]'),
    };

    Object.entries(buttons).forEach(([name, btn]) => {
      if (btn) {
        if (editor.isActive(name)) {
          btn.classList.add('is-active');
        } else {
          btn.classList.remove('is-active');
        }
      }
    });

    // Update heading select
    const headingSelect = document.getElementById('heading-select') as HTMLSelectElement;
    if (headingSelect) {
      if (editor.isActive('heading', { level: 1 })) {
        headingSelect.value = '1';
      } else if (editor.isActive('heading', { level: 2 })) {
        headingSelect.value = '2';
      } else if (editor.isActive('heading', { level: 3 })) {
        headingSelect.value = '3';
      } else if (editor.isActive('heading', { level: 4 })) {
        headingSelect.value = '4';
      } else {
        headingSelect.value = 'paragraph';
      }
    }
  }

  function updateStats() {
    if (!editor || !wordCount || !charCount || !readingTimeEl || !contentCharCount) return;

    const text = editor.getText();
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = editor.getHTML().length;
    const readingTime = Math.max(1, Math.ceil(words / 200));

    wordCount.textContent = words.toString();
    charCount.textContent = words.toString();
    readingTimeEl.textContent = readingTime.toString();
    contentCharCount.textContent = chars.toString();
  }

  // Form submission
  if (form) {
    form.addEventListener('submit', async (e) => {
      console.log('[CREATE POST] Form submit event fired');
      e.preventDefault();
      hideAlert();

      const { isValid, errors } = validateForm();
      console.log('[CREATE POST] Form validation result:', { isValid, errors });

      if (!isValid) {
        showAlert(`Please fix the following errors: ${errors.join(', ')}`, 'error');
        return;
      }

      const data = getFormData();
      console.log('[CREATE POST] Creating post with data:', {
        ...data,
        content: data.content?.substring(0, 100) + '...',
      });

      try {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Creating...';

        const url = draftId ? `/api/posts/${draftId}/` : '/api/posts/';
        const method = draftId ? 'PUT' : 'POST';

        console.log(`[CREATE POST] Sending ${method} request to ${url}`);
        console.log(`[CREATE POST] Request URL (full):`, window.location.origin + url);
        console.log(`[CREATE POST] Request data:`, {
          ...data,
          content: data.content?.substring(0, 100) + '...',
        });

        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': csrfToken.value,
          },
          body: JSON.stringify(data),
        });

        console.log('[CREATE POST] Response status:', response.status);
        console.log('[CREATE POST] Response ok:', response.ok);

        let result;
        try {
          result = await response.json();
        } catch (e) {
          console.error('[CREATE POST] Failed to parse response as JSON:', e);
          const text = await response.text();
          console.error('[CREATE POST] Response text:', text);
          showAlert('Invalid response from server', 'error');
          submitBtn.disabled = false;
          submitBtn.textContent = 'Create Post';
          return;
        }

        console.log('[CREATE POST] Response data:', result);
        console.log('[CREATE POST] Result.success:', result.success);
        console.log('[CREATE POST] Full result object:', JSON.stringify(result, null, 2));

        // Handle successful response (status 2xx and either success=true or has post data)
        const isSuccess = response.ok && (result.success === true || (response.status === 201 && result.post));

        if (isSuccess) {
          hasUnsavedChanges = false;
          showAlert('Post created successfully!', 'success');

          setTimeout(() => {
            window.location.href = result.post?.id
              ? `/dashboard/edit-post/${result.post.id}`
              : '/dashboard/posts';
          }, 1500);
        } else {
          console.error('[CREATE POST] Post creation failed:', {
            status: response.status,
            error: result.error,
            details: result.details,
            debugInfo: result.debugInfo,
          });
          
          if (result.error?.includes('slug')) {
            showFieldError(slugInput, slugError, result.error);
          }
          
          // Show detailed error message
          const errorMsg = result.details 
            ? `${result.error}: ${result.details}` 
            : result.error || 'Failed to create post';
          
          showAlert(errorMsg, 'error');
        }
      } catch (error) {
        console.error('[CREATE POST] Error:', error);
        showAlert('An error occurred while creating the post', 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Create Post';
      }
    });
    console.log('[CREATE POST] Form submit listener attached');
  }

  // Track whether user has manually edited the slug
  let slugManuallyEdited = false;
  let seoTitleManuallyEdited = false;
  let seoDescManuallyEdited = false;

  // SEO Preview elements
  const seoTitlePreview = document.getElementById('seo-title-preview') as HTMLElement;
  const seoDescPreview = document.getElementById('seo-description-preview') as HTMLElement;

  // Update SEO preview
  function updateSeoPreview() {
    if (seoTitlePreview) {
      const previewTitle = (seoTitleInput?.value || titleInput?.value || 'Your Post Title') + ' | Insightful Health';
      seoTitlePreview.textContent = previewTitle;
    }
    if (seoDescPreview) {
      const previewDesc = seoDescInput?.value || excerptInput?.value || 'Your post description will appear here...';
      seoDescPreview.textContent = previewDesc;
    }
  }

  // Character counters and slug auto-generation
  if (titleInput) {
    titleInput.addEventListener('input', () => {
      updateCount(titleInput, titleCount);
      // Auto-generate slug continuously unless user has manually edited it
      if (slugInput && !slugManuallyEdited) {
        const generatedSlug = generateSlug(titleInput.value);
        slugInput.value = generatedSlug;
        console.log('[CREATE POST] Auto-generated slug:', generatedSlug);
      }
      
      // Auto-populate SEO title unless manually edited
      if (seoTitleInput && !seoTitleManuallyEdited) {
        seoTitleInput.value = titleInput.value.substring(0, 60);
        updateCount(seoTitleInput, seoTitleCount);
      }
      
      updateSeoPreview();
      hasUnsavedChanges = true;
    });
    console.log('[CREATE POST] Title input event listener attached');
  } else {
    console.error('[CREATE POST] Title input element not found!');
  }

  // Track manual slug edits
  if (slugInput) {
    slugInput.addEventListener('input', () => {
      // Mark as manually edited if user types in the slug field
      slugManuallyEdited = true;
      console.log('[CREATE POST] Slug manually edited');
    });
  }

  excerptInput?.addEventListener('input', () => {
    updateCount(excerptInput, excerptCount);
    
    // Auto-populate SEO description unless manually edited
    if (seoDescInput && !seoDescManuallyEdited) {
      seoDescInput.value = excerptInput.value.substring(0, 160);
      updateCount(seoDescInput, seoDescCount);
    }
    
    updateSeoPreview();
    hasUnsavedChanges = true;
  });

  seoTitleInput?.addEventListener('input', () => {
    updateCount(seoTitleInput, seoTitleCount);
    seoTitleManuallyEdited = true;
    updateSeoPreview();
    hasUnsavedChanges = true;
  });

  seoDescInput?.addEventListener('input', () => {
    updateCount(seoDescInput, seoDescCount);
    seoDescManuallyEdited = true;
    updateSeoPreview();
    hasUnsavedChanges = true;
  });

  // Initialize SEO preview on page load
  updateSeoPreview();

  // Toolbar button handlers
  function setupToolbar() {
    const toolbarBtns = document.querySelectorAll('.editor-toolbar-btn');
    
    toolbarBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        if (!editor) return;

        const action = btn.getAttribute('data-action');
        console.log('[CREATE POST] Toolbar action:', action);

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
          case 'codeBlock':
            editor.chain().focus().toggleCodeBlock().run();
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
          case 'hr':
            editor.chain().focus().setHorizontalRule().run();
            break;
          case 'table':
            // Insert a 3x3 table with header row by default
            editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
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
          case 'undo':
            editor.chain().focus().undo().run();
            break;
          case 'redo':
            editor.chain().focus().redo().run();
            break;
          case 'clearFormat':
            editor.chain().focus().clearNodes().unsetAllMarks().run();
            break;
          case 'link':
            const url = window.prompt('Enter URL:');
            if (url) {
              editor.chain().focus().setLink({ href: url }).run();
            }
            break;
          case 'image':
            const imageUrl = window.prompt('Enter image URL:');
            if (imageUrl) {
              editor.chain().focus().setImage({ src: imageUrl }).run();
            }
            break;
          case 'fullscreen':
            toggleFullscreen();
            break;
        }
      });
    });

    // Heading select
    const headingSelect = document.getElementById('heading-select') as HTMLSelectElement;
    headingSelect?.addEventListener('change', (e) => {
      if (!editor) return;
      const value = (e.target as HTMLSelectElement).value;
      
      if (value === 'paragraph') {
        editor.chain().focus().setParagraph().run();
      } else {
        const level = parseInt(value) as 1 | 2 | 3 | 4 | 5 | 6;
        editor.chain().focus().setHeading({ level }).run();
      }
    });
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

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + K for link
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      const url = window.prompt('Enter URL:');
      if (url && editor) {
        editor.chain().focus().setLink({ href: url }).run();
      }
    }
  });

  // Initialize editor
  console.log('[CREATE POST] Starting initialization...');
  initEditor();
  setupToolbar();
  console.log('[CREATE POST] Initialization complete');
}
