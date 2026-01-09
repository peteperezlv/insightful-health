/**
 * XSS Protection Test Suite
 * Tests DOMPurify sanitization to ensure XSS attacks are blocked
 */

import DOMPurify from 'isomorphic-dompurify';

// Test cases with malicious payloads
const xssTests = [
  {
    name: 'Script tag injection',
    input: '<p>Hello</p><script>alert("XSS")</script><p>World</p>',
    shouldNotContain: ['<script', 'alert'],
    shouldContain: ['<p>Hello</p>', '<p>World</p>']
  },
  {
    name: 'Event handler in onclick',
    input: '<button onclick="alert(\'XSS\')">Click me</button>',
    shouldNotContain: ['onclick', 'alert'],
    shouldContain: [] // Button tag is not allowed, so it gets stripped
  },
  {
    name: 'Event handler in onerror',
    input: '<img src="x" onerror="alert(\'XSS\')">',
    shouldNotContain: ['onerror', 'alert'],
    shouldContain: []
  },
  {
    name: 'JavaScript protocol in href',
    input: '<a href="javascript:alert(\'XSS\')">Click</a>',
    shouldNotContain: ['javascript:'],
    shouldContain: []
  },
  {
    name: 'JavaScript protocol in src',
    input: '<img src="javascript:alert(\'XSS\')">',
    shouldNotContain: ['javascript:'],
    shouldContain: []
  },
  {
    name: 'Iframe injection',
    input: '<iframe src="http://evil.com"></iframe>',
    shouldNotContain: ['<iframe'],
    shouldContain: []
  },
  {
    name: 'Object/Embed tags',
    input: '<object data="http://evil.com"></object><embed src="http://evil.com">',
    shouldNotContain: ['<object', '<embed'],
    shouldContain: []
  },
  {
    name: 'Style tag injection',
    input: '<style>body { background: url("javascript:alert(1)"); }</style>',
    shouldNotContain: ['<style', 'javascript:'],
    shouldContain: []
  },
  {
    name: 'Valid safe HTML',
    input: '<p>This is <strong>bold</strong> and <em>italic</em> text with a <a href="https://example.com">link</a>.</p>',
    shouldNotContain: [],
    shouldContain: ['<strong>', '<em>', '<a href="https://example.com"']
  },
  {
    name: 'Valid headings and lists',
    input: '<h1>Title</h1><ul><li>Item 1</li><li>Item 2</li></ul>',
    shouldNotContain: [],
    shouldContain: ['<h1>', '<ul>', '<li>']
  },
  {
    name: 'Valid blockquote and code',
    input: '<blockquote>Quote</blockquote><pre><code>const x = 1;</code></pre>',
    shouldNotContain: [],
    shouldContain: ['<blockquote>', '<pre>', '<code>']
  },
  {
    name: 'SVG with script',
    input: '<svg onload="alert(\'XSS\')"></svg>',
    shouldNotContain: ['onload', 'alert', '<svg'],
    shouldContain: []
  },
  {
    name: 'Data attribute XSS attempt',
    input: '<div data-bind="alert(\'XSS\')">Test</div>',
    shouldNotContain: ['data-bind'],
    shouldContain: ['<div']
  }
];

// DOMPurify configuration (matching posts.ts)
const config = {
  ALLOWED_TAGS: [
    'p', 'br', 'strong', 'em', 'u', 's', 'code', 'mark', 'sub', 'sup', 'b', 'i',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li',
    'blockquote', 'pre',
    'a',
    'img',
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
    'div', 'span',
    'hr',
  ],
  ALLOWED_ATTR: [
    'class', 'style',
    'href', 'target', 'rel',
    'src', 'alt', 'width', 'height',
    'colspan', 'rowspan',
    'align',
  ],
  FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onmouseout', 'onfocus', 'onblur', 'oninput'],
  FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'applet', 'meta', 'link', 'style'],
  ALLOW_DATA_ATTR: false,
};

// Run tests
console.log('🔒 XSS Protection Test Suite\n');
console.log('Testing DOMPurify sanitization...\n');

let passed = 0;
let failed = 0;

xssTests.forEach((test, index) => {
  console.log(`Test ${index + 1}: ${test.name}`);
  console.log(`Input: ${test.input.substring(0, 80)}${test.input.length > 80 ? '...' : ''}`);
  
  const sanitized = DOMPurify.sanitize(test.input, config);
  console.log(`Output: ${sanitized.substring(0, 80)}${sanitized.length > 80 ? '...' : ''}`);
  
  let testPassed = true;
  
  // Check that dangerous content is NOT present
  for (const dangerousString of test.shouldNotContain) {
    if (sanitized.includes(dangerousString)) {
      console.log(`  ❌ FAILED: Output contains dangerous string "${dangerousString}"`);
      testPassed = false;
    }
  }
  
  // Check that safe content IS present
  for (const safeString of test.shouldContain) {
    if (!sanitized.includes(safeString)) {
      console.log(`  ❌ FAILED: Output missing safe string "${safeString}"`);
      testPassed = false;
    }
  }
  
  if (testPassed) {
    console.log('  ✅ PASSED');
    passed++;
  } else {
    failed++;
  }
  
  console.log('');
});

console.log('═══════════════════════════════════════');
console.log(`Results: ${passed}/${xssTests.length} tests passed`);
if (failed === 0) {
  console.log('✅ All XSS protection tests PASSED!');
  console.log('Your application is protected against common XSS attacks.');
} else {
  console.log(`❌ ${failed} tests FAILED!`);
  console.log('⚠️  XSS vulnerabilities detected - review sanitization config.');
  process.exit(1);
}
