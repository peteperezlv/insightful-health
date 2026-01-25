/**
 * Diagnostic script to troubleshoot post creation issues
 * Run this in the browser console when the post creation fails
 */

(function() {
  console.log('=== Post Creation Diagnostic Tool ===\n');

  // Check authentication
  async function checkAuth() {
    console.log('1. Checking authentication...');
    try {
      const response = await fetch('/api/auth/session', {
        credentials: 'include',
      });
      const session = await response.json();
      console.log('✓ Session:', session);
      return session;
    } catch (error) {
      console.error('✗ Auth check failed:', error);
      return null;
    }
  }

  // Check CSRF token
  function checkCSRF() {
    console.log('\n2. Checking CSRF token...');
    const csrfInput = document.querySelector('input[name="csrf_token"]');
    if (csrfInput) {
      console.log('✓ CSRF token found:', csrfInput.value.substring(0, 20) + '...');
      return csrfInput.value;
    } else {
      console.error('✗ CSRF token not found');
      return null;
    }
  }

  // Test minimal post creation
  async function testPostCreation(session, csrfToken) {
    console.log('\n3. Testing minimal post creation...');
    
    const minimalPost = {
      title: 'Test Post ' + new Date().toISOString(),
      content: '<p>This is a test post created by the diagnostic tool.</p>',
      status: 'draft',
    };

    console.log('Post data:', minimalPost);

    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
        credentials: 'include',
        body: JSON.stringify(minimalPost),
      });

      console.log('Response status:', response.status);
      const result = await response.json();
      console.log('Response data:', result);

      if (response.ok && result.success) {
        console.log('✓ Post creation successful!');
        console.log('Post ID:', result.post?.id);
        return result;
      } else {
        console.error('✗ Post creation failed');
        console.error('Error:', result.error);
        console.error('Details:', result.details);
        if (result.debugInfo) {
          console.error('Debug info:', result.debugInfo);
        }
        return null;
      }
    } catch (error) {
      console.error('✗ Request failed:', error);
      return null;
    }
  }

  // Check PocketBase connection
  async function checkPocketBase() {
    console.log('\n4. Checking PocketBase connection...');
    try {
      const response = await fetch('/api/health', {
        credentials: 'include',
      });
      if (response.ok) {
        const health = await response.json();
        console.log('✓ PocketBase health:', health);
      } else {
        console.error('✗ PocketBase health check failed:', response.status);
      }
    } catch (error) {
      console.error('✗ PocketBase connection error:', error);
    }
  }

  // Run all diagnostics
  async function runDiagnostics() {
    const session = await checkAuth();
    if (!session || !session.user) {
      console.error('\n❌ ISSUE: User is not authenticated');
      console.log('Solution: Please log in and try again');
      return;
    }

    if (session.user.role !== 'admin' && session.user.role !== 'author') {
      console.error('\n❌ ISSUE: User does not have author permissions');
      console.log('Current role:', session.user.role);
      console.log('Solution: User needs admin or author role to create posts');
      return;
    }

    const csrfToken = checkCSRF();
    if (!csrfToken) {
      console.error('\n❌ ISSUE: CSRF token not found');
      console.log('Solution: Refresh the page to get a new CSRF token');
      return;
    }

    await checkPocketBase();
    await testPostCreation(session, csrfToken);

    console.log('\n=== Diagnostic Complete ===');
    console.log('\nIf the test post creation failed, check:');
    console.log('1. Browser console for detailed error messages');
    console.log('2. Network tab for the /api/posts request and response');
    console.log('3. PocketBase logs for server-side errors');
    console.log('4. Database schema for required fields');
  }

  // Run diagnostics
  runDiagnostics();
})();
