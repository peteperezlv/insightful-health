#!/usr/bin/env node

/**
 * Performance Testing Script
 * Tests Lighthouse scores and Core Web Vitals
 */

import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import fs from 'fs';
import path from 'path';

const SITE_URL = process.env.PUBLIC_SITE_URL || 'http://localhost:4321';

const PAGES_TO_TEST = [
  { url: '/', name: 'Homepage' },
  { url: '/posts', name: 'Posts List' },
  { url: '/archive', name: 'Archive' },
  { url: '/search', name: 'Search' },
];

const TARGETS = {
  performance: 90,
  accessibility: 95,
  bestPractices: 95,
  seo: 95,
};

async function runLighthouse(url) {
  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });
  const options = {
    logLevel: 'info',
    output: 'json',
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
    port: chrome.port,
  };

  const runnerResult = await lighthouse(url, options);
  await chrome.kill();

  return runnerResult;
}

function analyzeResults(results) {
  const { categories, audits } = results.lhr;

  const scores = {
    performance: Math.round(categories.performance.score * 100),
    accessibility: Math.round(categories.accessibility.score * 100),
    bestPractices: Math.round(categories['best-practices'].score * 100),
    seo: Math.round(categories.seo.score * 100),
  };

  const metrics = {
    fcp: audits['first-contentful-paint'].displayValue,
    lcp: audits['largest-contentful-paint'].displayValue,
    cls: audits['cumulative-layout-shift'].displayValue,
    tbt: audits['total-blocking-time'].displayValue,
    tti: audits['interactive'].displayValue,
  };

  return { scores, metrics };
}

function checkTargets(scores) {
  const results = {};
  let allPassed = true;

  for (const [category, score] of Object.entries(scores)) {
    const target = TARGETS[category];
    const passed = score >= target;
    results[category] = {
      score,
      target,
      passed,
      diff: score - target,
    };
    if (!passed) allPassed = false;
  }

  return { results, allPassed };
}

function printResults(pageName, scores, metrics, targetCheck) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📊 ${pageName}`);
  console.log(`${'='.repeat(60)}`);

  console.log('\n🎯 Lighthouse Scores:');
  console.log(`  Performance:     ${scores.performance}% ${targetCheck.results.performance.passed ? '✅' : '❌'} (target: ${TARGETS.performance}%)`);
  console.log(`  Accessibility:   ${scores.accessibility}% ${targetCheck.results.accessibility.passed ? '✅' : '❌'} (target: ${TARGETS.accessibility}%)`);
  console.log(`  Best Practices:  ${scores.bestPractices}% ${targetCheck.results.bestPractices.passed ? '✅' : '❌'} (target: ${TARGETS.bestPractices}%)`);
  console.log(`  SEO:             ${scores.seo}% ${targetCheck.results.seo.passed ? '✅' : '❌'} (target: ${TARGETS.seo}%)`);

  console.log('\n⚡ Core Web Vitals:');
  console.log(`  FCP (First Contentful Paint):    ${metrics.fcp}`);
  console.log(`  LCP (Largest Contentful Paint):  ${metrics.lcp}`);
  console.log(`  CLS (Cumulative Layout Shift):   ${metrics.cls}`);
  console.log(`  TBT (Total Blocking Time):       ${metrics.tbt}`);
  console.log(`  TTI (Time to Interactive):       ${metrics.tti}`);

  if (!targetCheck.allPassed) {
    console.log('\n⚠️  Some targets not met:');
    for (const [category, result] of Object.entries(targetCheck.results)) {
      if (!result.passed) {
        console.log(`  ${category}: ${result.score}% (need ${result.diff * -1}% more)`);
      }
    }
  } else {
    console.log('\n✅ All targets met!');
  }
}

async function main() {
  console.log('🚀 Starting Performance Testing...');
  console.log(`📍 Testing site: ${SITE_URL}`);
  console.log(`📄 Pages to test: ${PAGES_TO_TEST.length}`);

  const allResults = [];

  for (const page of PAGES_TO_TEST) {
    const url = `${SITE_URL}${page.url}`;
    console.log(`\n🔍 Testing: ${page.name} (${url})`);

    try {
      const results = await runLighthouse(url);
      const { scores, metrics } = analyzeResults(results);
      const targetCheck = checkTargets(scores);

      printResults(page.name, scores, metrics, targetCheck);

      allResults.push({
        page: page.name,
        url: page.url,
        scores,
        metrics,
        targetCheck,
      });
    } catch (error) {
      console.error(`❌ Error testing ${page.name}:`, error.message);
    }
  }

  // Summary
  console.log(`\n${'='.repeat(60)}`);
  console.log('📊 SUMMARY');
  console.log(`${'='.repeat(60)}`);

  const allPassed = allResults.every(r => r.targetCheck.allPassed);
  console.log(`\nOverall: ${allPassed ? '✅ All pages meet targets' : '⚠️  Some pages need improvement'}`);

  // Save results to file
  const reportPath = path.join(process.cwd(), 'performance-report.json');
  fs.writeFileSync(
    reportPath,
    JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        siteUrl: SITE_URL,
        targets: TARGETS,
        results: allResults,
      },
      null,
      2
    )
  );

  console.log(`\n💾 Full report saved to: ${reportPath}`);

  // Exit with error code if any targets not met
  process.exit(allPassed ? 0 : 1);
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
