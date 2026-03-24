#!/usr/bin/env node

/**
 * AI Detection CLI Tool
 * 
 * Usage:
 *   node detect-ai.js "Your text here to check"
 *   node detect-ai.js --file path/to/text.txt
 *   node detect-ai.js --detector gptzero "text to check"
 *   node detect-ai.js --batch path/to/texts/
 *   node detect-ai.js --minimal "text to check"
 *   node detect-ai.js --threshold 70 "text to check"
 *   node detect-ai.js --transform "text to check"
 *   node detect-ai.js --explain "text to check"
 *   node detect-ai.js --history
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const { Command, Option } = require('commander');
const { runDetection, printResults, printCompact, exportJSON, quickCheck, getVerdict, analyzeText } = require('./lib/detector-runner');
const { minimalOutput, explainOutput, thresholdOutput } = require('./lib/visual-output');
const { transform: slopTransform } = require('./lib/slop-transform');
const { getHistory, clearHistory } = require('./lib/detection-core');

const VALID_DETECTORS = ['heuristic', 'gptzero', 'zerogpt', 'winston', 'originality'];

const program = new Command();

program
  .name('detect-ai')
  .description('AI Detection CLI Tool - Test text against multiple AI detectors')
  .version('1.1.0')
  .addOption(new Option('-d, --detector <name>', 'Use specific detector (can be repeated)')
    .argParser((value, previous) => {
      if (!previous) return [value.toLowerCase()];
      return [...previous, value.toLowerCase()];
    }))
  .addOption(new Option('-D, --detectors <list>', 'Comma-separated list of detectors')
    .argParser((value) => value.split(',').map(d => d.trim().toLowerCase())))
  .option('-f, --file <path>', 'Read text from file')
  .option('-b, --batch <path>', 'Process batch of text files')
  .option('-c, --compact', 'Compact output (single line)')
  .option('-m, --minimal', 'Minimal output (percentage only)')
  .option('-q, --quiet', 'Quiet mode (no verbose output)')
  .option('-j, --json', 'Output as JSON')
  .option('-t, --threshold <percent>', 'AI threshold percentage (default: 50)', '50')
  .option('--transform', 'Apply slop removal transform before detection')
  .option('--explain', 'Show explanation of why text scores high-AI')
  .option('--yesno', 'Output YES if AI detected, NO otherwise')
  .option('--history', 'Show detection history')
  .option('--clear-history', 'Clear detection history')
  .argument('[text]', 'Text to check for AI generation')
  .action((text, options) => {
    if (text) options.text = text;
  });

program.parse();

const options = program.opts();

if (options.history) {
  const history = getHistory();
  if (history.length === 0) {
    console.log('No detection history found.');
  } else {
    console.log(`\n📜 Detection History (last ${history.length} entries):\n`);
    for (const entry of history.slice(0, 20)) {
      const verdict = entry.aiPercent >= (entry.threshold || 50) ? '🔴' : '🟢';
      console.log(`${verdict} ${entry.aiPercent ?? '?'}% AI | ${entry.textLength} chars | ${entry.timestamp}`);
    }
  }
  process.exit(0);
}

if (options.clearHistory) {
  clearHistory();
  console.log('Detection history cleared.');
  process.exit(0);
}

let detectors = [...(options.detector || []), ...(options.detectors || [])];
detectors = [...new Set(detectors)];
const invalidDetectors = detectors.filter(d => !VALID_DETECTORS.includes(d));
if (invalidDetectors.length > 0) {
  console.error(`Error: Invalid detector(s): ${invalidDetectors.join(', ')}`);
  console.error(`Valid detectors: ${VALID_DETECTORS.join(', ')}`);
  process.exit(1);
}

const threshold = parseInt(options.threshold, 10) || 50;

// Get text to check
async function getText() {
  let text = options.text;
  
  if (!text && options.file) {
    if (!fs.existsSync(options.file)) {
      console.error(`Error: File not found: ${options.file}`);
      process.exit(1);
    }
    text = fs.readFileSync(options.file, 'utf-8');
  }
  
  if (!text) return null;
  
  if (options.transform) {
    console.log(chalk.gray('   Applying slop removal transform...'));
    text = slopTransform(text);
  }
  
  return text;
}

// Batch process files
async function processBatch() {
  if (!options.batch) return false;
  
  const batchDir = options.batch;
  if (!fs.existsSync(batchDir)) {
    console.error(`Error: Batch directory not found: ${batchDir}`);
    process.exit(1);
  }

  const files = fs.readdirSync(batchDir).filter(f => 
    f.endsWith('.txt') || f.endsWith('.md') || f.endsWith('.text')
  );

  if (files.length === 0) {
    console.log('No text files found in batch directory');
    return true;
  }

  console.log(`\n📁 Processing batch: ${files.length} files\n`);

  for (const file of files) {
    const filePath = path.join(batchDir, file);
    const text = fs.readFileSync(filePath, 'utf-8');
    
    console.log(chalk.cyan('\n' + '='.repeat(60)));
    console.log(chalk.cyan(`📄 File: ${file}`));
    console.log(chalk.cyan('='.repeat(60)));
    
    const results = await runDetection(text, detectors, { verbose: false });
    
    if (options.json) {
      console.log(exportJSON(results));
    } else if (options.compact) {
      printCompact(results);
    } else {
      printResults(results);
    }
  }

  return true;
}

// Main execution
async function main() {
  // Handle batch mode
  if (await processBatch()) return;

  // Get text
  const text = await getText();
  
  if (!text) {
    console.error('Error: No text provided. Use --help for usage information.');
    console.error('\nExample: node detect-ai.js "Your text to check"');
    process.exit(1);
  }

  const verbose = !options.quiet;
  
  // Run detection
  const results = await runDetection(text, detectors, { 
    verbose,
    threshold,
    saveHistory: !options.quiet
  });

  // Output results
  if (options.yesno) {
    console.log(thresholdOutput(results, threshold));
  } else if (options.explain) {
    console.log(explainOutput(results));
  } else if (options.minimal) {
    console.log(minimalOutput(results, { showThreshold: true, threshold }));
  } else if (options.json) {
    console.log(exportJSON(results));
  } else if (options.compact) {
    printCompact(results);
  } else {
    printResults(results);
  }
}

main().catch(console.error);
