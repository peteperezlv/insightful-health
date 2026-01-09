/**
 * Mobile Responsiveness Testing Script
 * Tests Insightful Health at various breakpoints
 * 
 * Usage: node scripts/test-mobile-responsiveness.js
 */

import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

// Configuration
const BASE_URL = process.env.TEST_URL || 'http://localhost:4321';
const OUTPUT_DIR = './mobile-test-results';

// Breakpoints to test (from COPILOT_INSTRUCTIONS.md)
const BREAKPOINTS = [
  { name: 'Mobile XS', width: 320, height: 568 },
  { name: 'Mobile S', width: 375, height: 667 },
  { name: 'Mobile M', width: 414, height: 896 },
  { name: 'Tablet', width: 768, height: 1024 },
  { name: 'Desktop MD', width: 1024, height: 768 },
  { name: 'Desktop LG', width: 1280, height: 800 },
  { name: 'Desktop XL', width: 1920, height: 1080 }
];

// Pages to test
const PAGES = [
  { path: '/', name: 'Homepage' },
  { path: '/posts', name: 'Posts List' },
  { path: '/search', name: 'Search' },
  { path: '/archive', name: 'Archive' },
  { path: '/auth/login', name: 'Login' }
];

/**
 * Check for mobile responsiveness issues
 */
async function checkResponsiveness(page, breakpoint) {
  const issues = [];
  
  // Check for horizontal scrolling
  const hasHorizontalScroll = await page.evaluate(() => {
    return document.documentElement.scrollWidth > document.documentElement.clientWidth;
  });
  
  if (hasHorizontalScroll) {
    issues.push({
      type: 'Horizontal Scroll',
      severity: 'critical',
      message: 'Page has horizontal scrolling'
    });
  }
  
  // Check touch target sizes (minimum 44x44px)
  const smallTouchTargets = await page.evaluate(() => {
    const interactiveElements = document.querySelectorAll('button, a, input[type="submit"], input[type="button"], [role="button"]');
    const small = [];
    
    interactiveElements.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.width < 44 || rect.height < 44) {
        small.push({
          tag: el.tagName,
          class: el.className,
          width: Math.round(rect.width),
          height: Math.round(rect.height)
        });
      }
    });
    
    return small;
  });
  
  if (smallTouchTargets.length > 0 && breakpoint.width <= 768) {
    issues.push({
      type: 'Small Touch Targets',
      severity: 'warning',
      message: `${smallTouchTargets.length} interactive elements are smaller than 44x44px`,
      details: smallTouchTargets.slice(0, 5) // Show first 5
    });
  }
  
  // Check font sizes (minimum 16px for body text)
  const smallFonts = await page.evaluate(() => {
    const textElements = document.querySelectorAll('p, li, span, div');
    const small = [];
    
    textElements.forEach((el) => {
      const fontSize = parseFloat(window.getComputedStyle(el).fontSize);
      if (fontSize < 16 && el.textContent.trim().length > 10) {
        small.push({
          tag: el.tagName,
          fontSize: Math.round(fontSize),
          text: el.textContent.trim().substring(0, 50)
        });
      }
    });
    
    return small;
  });
  
  if (smallFonts.length > 0 && breakpoint.width <= 768) {
    issues.push({
      type: 'Small Font Size',
      severity: 'warning',
      message: `${smallFonts.length} text elements are smaller than 16px`,
      details: smallFonts.slice(0, 5)
    });
  }
  
  // Check for images without width/height
  const imagesWithoutDimensions = await page.evaluate(() => {
    const images = document.querySelectorAll('img');
    const missing = [];
    
    images.forEach((img) => {
      if (!img.hasAttribute('width') || !img.hasAttribute('height')) {
        missing.push({
          src: img.src.substring(0, 50),
          alt: img.alt
        });
      }
    });
    
    return missing;
  });
  
  if (imagesWithoutDimensions.length > 0) {
    issues.push({
      type: 'Images Without Dimensions',
      severity: 'info',
      message: `${imagesWithoutDimensions.length} images missing explicit width/height (may cause CLS)`,
      details: imagesWithoutDimensions.slice(0, 3)
    });
  }
  
  return issues;
}

/**
 * Test a page at different breakpoints
 */
async function testPage(browser, pageInfo) {
  console.log(`\n📄 Testing: ${pageInfo.name}`);
  const results = [];
  
  for (const breakpoint of BREAKPOINTS) {
    console.log(`  ├─ ${breakpoint.name} (${breakpoint.width}x${breakpoint.height})`);
    
    const page = await browser.newPage();
    await page.setViewport({
      width: breakpoint.width,
      height: breakpoint.height,
      deviceScaleFactor: breakpoint.width <= 768 ? 2 : 1
    });
    
    try {
      // Navigate to page
      await page.goto(`${BASE_URL}${pageInfo.path}`, {
        waitUntil: 'networkidle0',
        timeout: 30000
      });
      
      // Wait for page to render
      await page.waitForTimeout(1000);
      
      // Check for responsiveness issues
      const issues = await checkResponsiveness(page, breakpoint);
      
      // Take screenshot
      const screenshotDir = path.join(OUTPUT_DIR, pageInfo.name.replace(/\s+/g, '-').toLowerCase());
      if (!fs.existsSync(screenshotDir)) {
        fs.mkdirSync(screenshotDir, { recursive: true });
      }
      
      const screenshotPath = path.join(
        screenshotDir,
        `${breakpoint.name.replace(/\s+/g, '-').toLowerCase()}.png`
      );
      await page.screenshot({ path: screenshotPath, fullPage: true });
      
      results.push({
        breakpoint: breakpoint.name,
        width: breakpoint.width,
        height: breakpoint.height,
        issues,
        screenshot: screenshotPath,
        passed: issues.filter(i => i.severity === 'critical').length === 0
      });
      
      // Log results
      if (issues.length > 0) {
        console.log(`    ⚠️  ${issues.length} issue(s) found`);
        issues.forEach(issue => {
          const icon = issue.severity === 'critical' ? '❌' : issue.severity === 'warning' ? '⚠️' : 'ℹ️';
          console.log(`      ${icon} ${issue.type}: ${issue.message}`);
        });
      } else {
        console.log(`    ✅ No issues found`);
      }
      
    } catch (error) {
      console.error(`    ❌ Error: ${error.message}`);
      results.push({
        breakpoint: breakpoint.name,
        width: breakpoint.width,
        height: breakpoint.height,
        issues: [{
          type: 'Error',
          severity: 'critical',
          message: error.message
        }],
        screenshot: null,
        passed: false
      });
    } finally {
      await page.close();
    }
  }
  
  return {
    page: pageInfo.name,
    path: pageInfo.path,
    results
  };
}

/**
 * Main testing function
 */
async function runTests() {
  console.log('🔍 Mobile Responsiveness Testing');
  console.log(`Testing: ${BASE_URL}\n`);
  
  // Create output directory
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  
  // Launch browser
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const allResults = [];
  
  try {
    // Test each page
    for (const page of PAGES) {
      const result = await testPage(browser, page);
      allResults.push(result);
    }
    
    // Generate summary report
    const report = generateReport(allResults);
    
    // Save report
    const reportPath = path.join(OUTPUT_DIR, 'mobile-test-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 Test Summary');
    console.log('='.repeat(60));
    console.log(`Total Pages Tested: ${report.summary.totalPages}`);
    console.log(`Total Breakpoints: ${report.summary.totalBreakpoints}`);
    console.log(`Total Tests: ${report.summary.totalTests}`);
    console.log(`Passed: ${report.summary.passed} ✅`);
    console.log(`Failed: ${report.summary.failed} ❌`);
    console.log(`Critical Issues: ${report.summary.criticalIssues}`);
    console.log(`Warnings: ${report.summary.warnings}`);
    console.log(`\n📁 Report saved to: ${reportPath}`);
    console.log(`📸 Screenshots saved to: ${OUTPUT_DIR}`);
    
  } finally {
    await browser.close();
  }
}

/**
 * Generate summary report
 */
function generateReport(results) {
  let totalTests = 0;
  let passed = 0;
  let failed = 0;
  let criticalIssues = 0;
  let warnings = 0;
  
  results.forEach(pageResult => {
    pageResult.results.forEach(test => {
      totalTests++;
      if (test.passed) {
        passed++;
      } else {
        failed++;
      }
      
      test.issues.forEach(issue => {
        if (issue.severity === 'critical') criticalIssues++;
        if (issue.severity === 'warning') warnings++;
      });
    });
  });
  
  return {
    timestamp: new Date().toISOString(),
    baseUrl: BASE_URL,
    summary: {
      totalPages: PAGES.length,
      totalBreakpoints: BREAKPOINTS.length,
      totalTests,
      passed,
      failed,
      criticalIssues,
      warnings
    },
    results
  };
}

// Run tests
runTests().catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});
