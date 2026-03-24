/**
 * Unified Detection Core Module
 * 
 * Canonical module with all advanced detection features:
 * - Type-Token Ratio (TTR) analysis
 * - Pronoun ratio analysis
 * - Positivity bias detection
 * - Proper noun density
 * - Connective density
 * - Sentence structure analysis
 * - Pattern-based detection
 * 
 * This is the single source of truth for all detection logic.
 */

const https = require('https');
const http = require('http');
const os = require('os');
const fs = require('fs');
const path = require('path');

const AI_PATTERNS = [
  { pattern: /\b(additionally|furthermore|moreover|consequently|therefore|however)\b/gi, weight: 3, category: 'connector' },
  { pattern: /\b(it is important to note|it is worth mentioning|it should be noted)\b/gi, weight: 4, category: 'formal' },
  { pattern: /\b(in conclusion|to summarize|overall)\b/gi, weight: 2, category: 'summary' },
  { pattern: /\b(this essay will examine|this paper explores|this study investigates)\b/gi, weight: 3, category: 'academic' },
  { pattern: /\b(first and foremost|it goes without saying|in today's world)\b/gi, weight: 3, category: 'emphasis' },
  { pattern: /\{[\s\S]*\}/g, weight: 2, category: 'formatting' },
  { pattern: /\[[\s\S]*\]/g, weight: 2, category: 'formatting' },
  { pattern: /\b(utilize|leverage|implement|demonstrate|facilitate)\b/gi, weight: 2, category: 'jargon' },
  { pattern: /\b(stands as|serves as|is a testament|is a reminder)\b/gi, weight: 3, category: 'puffery' },
  { pattern: /\b(vital|significant|crucial|pivotal|key role)\b/gi, weight: 2, category: 'puffery' },
  { pattern: /\b(underscores|highlights) (its )?importance\b/gi, weight: 3, category: 'puffery' },
  { pattern: /\b(reflects broader|symbolizing its ongoing)\b/gi, weight: 3, category: 'puffery' },
  { pattern: /\b(contributing to the|setting the stage for)\b/gi, weight: 2, category: 'puffery' },
  { pattern: /\b(marking|shaping) the\b/gi, weight: 2, category: 'puffery' },
  { pattern: /\b(represents a shift)\b/gi, weight: 3, category: 'puffery' },
  { pattern: /\b(key turning point|evolving landscape|focal point)\b/gi, weight: 3, category: 'puffery' },
  { pattern: /\b(indelible mark|deeply rooted)\b/gi, weight: 3, category: 'puffery' },
  { pattern: /\b(boasts a|vibrant|rich |profound)\b/gi, weight: 3, category: 'promotional' },
  { pattern: /\b(enhancing|showcasing|exemplifies)\b/gi, weight: 2, category: 'promotional' },
  { pattern: /\b(commitment to|natural beauty|nestled)\b/gi, weight: 3, category: 'promotional' },
  { pattern: /\b(in the heart of|groundbreaking|renowned)\b/gi, weight: 3, category: 'promotional' },
  { pattern: /\b(featuring|diverse array)\b/gi, weight: 2, category: 'promotional' },
  { pattern: /\b(highlighting|underscoring|emphasizing)\b/gi, weight: 2, category: 'superficial' },
  { pattern: /\b(ensuring|reflecting|symbolizing)\b/gi, weight: 2, category: 'superficial' },
  { pattern: /\b(contributing to|cultivating|fostering)\b/gi, weight: 2, category: 'superficial' },
  { pattern: /\b(encompassing|valuable insights)\b/gi, weight: 2, category: 'superficial' },
  { pattern: /\b(align with|resonate with)\b/gi, weight: 2, category: 'superficial' },
  { pattern: /\b(industry reports|observers have cited)\b/gi, weight: 3, category: 'vague-attribution' },
  { pattern: /\b(experts argue|some critics argue)\b/gi, weight: 3, category: 'vague-attribution' },
  { pattern: /\bnot just\s+\w+,\s*but also\s+\w+/gi, weight: 3, category: 'parallelism' },
  { pattern: /\b(not only\s+\w+\s+but\b|not\s+\w+,\s*but\s+\w+)/gi, weight: 3, category: 'parallelism' },
  { pattern: /—/g, weight: 1, category: 'formatting' },
  { pattern: /[""„]/g, weight: 2, category: 'formatting' },
  { pattern: /\b[A-Z][a-z]+ [A-Z][a-z]+ [A-Z][a-z]+\b/g, weight: 2, category: 'formatting' },
  { pattern: /\bDelve\b/gi, weight: 3, category: 'ai-vocabulary' },
  { pattern: /\b(delve into|delve into the)\b/gi, weight: 2, category: 'ai-vocabulary' },
  { pattern: /\bbolstered\b/gi, weight: 3, category: 'ai-vocabulary' },
  { pattern: /\bgarner\b/gi, weight: 3, category: 'ai-vocabulary' },
  { pattern: /\binterplay\b/gi, weight: 3, category: 'ai-vocabulary' },
  { pattern: /\bintricate\b/gi, weight: 2, category: 'ai-vocabulary' },
  { pattern: /\bintricacies\b/gi, weight: 3, category: 'ai-vocabulary' },
  { pattern: /\bmeticulous\b/gi, weight: 3, category: 'ai-vocabulary' },
  { pattern: /\bmeticulously\b/gi, weight: 3, category: 'ai-vocabulary' },
  { pattern: /\btapestry\b/gi, weight: 4, category: 'ai-vocabulary' },
  { pattern: /\btestament\b/gi, weight: 3, category: 'ai-vocabulary' },
  { pattern: /\bshowcase\b/gi, weight: 2, category: 'ai-vocabulary' },
  { pattern: /\bserves as a\b/gi, weight: 3, category: 'copulative-avoidance' },
  { pattern: /\bstands as\b/gi, weight: 3, category: 'copulative-avoidance' },
  { pattern: /\bmarks the\b/gi, weight: 3, category: 'copulative-avoidance' },
  { pattern: /\brepresents a\b/gi, weight: 2, category: 'copulative-avoidance' },
  { pattern: /\bfeatures a\b/gi, weight: 3, category: 'copulative-avoidance' },
  { pattern: /\boffers a\b/gi, weight: 3, category: 'copulative-avoidance' },
  { pattern: /Despite its [\w\s]+, (faces challenges|encountered challenges|has faced challenges)/gi, weight: 4, category: 'formulaic' },
  { pattern: /Despite these challenges/gi, weight: 3, category: 'formulaic' },
  { pattern: /\bFuture prospects\b/gi, weight: 3, category: 'formulaic' },
  { pattern: /\bChallenges and legacy\b/gi, weight: 4, category: 'formulaic' },
  { pattern: /\bI hope this helps\b/gi, weight: 4, category: 'ai-to-user' },
  { pattern: /\bOf course\b/gi, weight: 3, category: 'ai-to-user' },
  { pattern: /\bCertainly,\b/gi, weight: 2, category: 'ai-to-user' },
  { pattern: /\bWould you like\b/gi, weight: 3, category: 'ai-to-user' },
  { pattern: /\bLet me know\b/gi, weight: 3, category: 'ai-to-user' },
  { pattern: /\bHere is a\b/gi, weight: 3, category: 'ai-to-user' },
  { pattern: /\bhere is the\b/gi, weight: 2, category: 'ai-to-user' },
  { pattern: /\bas of my knowledge cutoff\b/gi, weight: 4, category: 'disclaimer' },
  { pattern: /\bbased on available information\b/gi, weight: 4, category: 'disclaimer' },
  { pattern: /\bwhile specific details are limited\b/gi, weight: 4, category: 'disclaimer' },
  { pattern: /\bnot widely documented\b/gi, weight: 4, category: 'disclaimer' },
  { pattern: /[\u{1F300}-\u{1F9FF}]/gu, weight: 4, category: 'emoji' },
  { pattern: /[\u{2600}-\u{26FF}]/gu, weight: 3, category: 'emoji' },
  { pattern: /[\u{2700}-\u{27BF}]/gu, weight: 3, category: 'emoji' },
  { pattern: /\b(\w+), \w+, and \w+/gi, weight: 2, category: 'rule-of-three' },
  { pattern: /\bfirst[\s,]+second[\s,]+third/gi, weight: 3, category: 'rule-of-three' },
  { pattern: /\bone[\s,]+two[\s,]+three/gi, weight: 3, category: 'rule-of-three' },
  { pattern: /\b(ranging from|range from|varies from)\s+[\w\s]+,\s*\w+\s+to\s+[\w\s]+/gi, weight: 3, category: 'false-range' },
  { pattern: /\b(furthermore|additionally),?\s*(likewise|similarly|conversely)\b/gi, weight: 2, category: 'elegant-variation' },
  { pattern: /\b(the\s+\w+ing)\s+(?:also|likewise)\b/gi, weight: 2, category: 'elegant-variation' },
  { pattern: /\b(was|were|been|being|is|are)\s+\w+ed\b/gi, weight: 1, category: 'passive' },
  { pattern: /\b(has been|was being|were being)\s+\w+/gi, weight: 2, category: 'passive' },
  { pattern: /\b(tip of the iceberg|drop in the ocean|neck of the woods|bread and butter|safe bet|wheels turn)\b/gi, weight: 3, category: 'cliche' },
  { pattern: /\b(play devil's advocate|hang in the balance|mix bag)\b/gi, weight: 3, category: 'cliche' },
  { pattern: /\b(kindly|pray|prithee|pray tell)\b/gi, weight: 3, category: 'overly-formal' },
  { pattern: /\b(it is advised|it is recommended|it is suggested)\b/gi, weight: 2, category: 'overly-formal' },
  { pattern: /\b(please be advised|please note that)\b/gi, weight: 3, category: 'overly-formal' },
  { pattern: /\b(absolute certainty|undoubtedly|irrefutable|incontrovertible)\b/gi, weight: 3, category: 'certainty' },
  { pattern: /\b(it is beyond doubt|there is no doubt)\b/gi, weight: 3, category: 'certainty' },
  { pattern: /\b(\d+(\.\d+)?%)\s+(of|percentage|rate|increase|decline)/gi, weight: 1, category: 'stats' },
  { pattern: /\b(studies show|research indicates|evidence suggests)\b/gi, weight: 2, category: 'stats' },
  { pattern: /\b(for example|for instance)\s+(?:the|a|an)\s+\w+\s+\w+\s+(?:like|such as)/gi, weight: 2, category: 'generic' },
  { pattern: /\b(such as|like)\s+(?:the\s+)?(\w+\s+){1,2}(and|or)\s+/gi, weight: 2, category: 'generic' },
  { pattern: /\b(true\s+facts|actual\s+reality|future\s+prospects|past\s+history)\b/gi, weight: 3, category: 'redundant' },
  { pattern: /\b(important\s+vital|crucial\s+essential|basic\s+fundamental)\b/gi, weight: 3, category: 'redundant' },
  { pattern: /\b(delve into|tapestry of|ever-evolving landscape|in the realm of|it is imperative that)\b/gi, weight: 4, category: 'academic' },
  { pattern: /\b(Moreover|Furthermore|Additionally|In addition)\b/gi, weight: 3, category: 'connective' },
  { pattern: /\b(might be|could be|possibly|perhaps|may be)\b/gi, weight: 2, category: 'hedging' },
  { pattern: /\b(As an AI|I must note|It is important to note that)\b/gi, weight: 5, category: 'ethical' },
  { pattern: /\b(Thank you|Please|I appreciate your|I'd be happy to)\b/gi, weight: 4, category: 'politeness' },
  { pattern: /\b(remarkable|outstanding|exceptional)\b/gi, weight: 3, category: 'positivity' },
];

const HUMAN_PATTERNS = [
  { pattern: /[!]{2,}/g, weight: 3, category: 'exclamation' },
  { pattern: /\b(lol|lmao|omg|wow|gosh|heck)\b/gi, weight: 4, category: 'informal' },
  { pattern: /\([\w\s]+\)/g, weight: 1, category: 'parenthetical' },
  { pattern: /\b(I think|I feel|I believe|honestly|personally)\b/gi, weight: 3, category: 'opinion' },
  { pattern: /\b(gonna|wanna|kinda|sorta|dunno|gonna)\b/gi, weight: 3, category: 'casual' },
  { pattern: /\b(that's|doesn't|won't|can't|isn't)\b/gi, weight: 1, category: 'contraction' },
  { pattern: /\b(you|your)\b/gi, weight: 2, category: 'second-person' },
  { pattern: /\b(frustrating|annoying|disappointed|love|hate)\b/gi, weight: 4, category: 'emotion' },
  { pattern: /\b(I don't know|I'm not sure)\b/gi, weight: 3, category: 'uncertainty' },
  { pattern: /\b(tbh|TBH)\b/gi, weight: 5, category: 'informal' },
];

function calculateTTR(wordArray) {
  const uniqueWords = new Set(wordArray.map(w => w.toLowerCase().replace(/[^a-z]/g, '')));
  return uniqueWords.size / Math.max(wordArray.length, 1);
}

function analyzeText(text) {
  const words = text.split(/\s+/);
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
  
  let aiScore = 0;
  let humanScore = 0;
  const foundAI = [];
  const foundHuman = [];
  const explanations = [];

  for (const { pattern, weight, category } of AI_PATTERNS) {
    const matches = text.match(pattern);
    if (matches) {
      aiScore += matches.length * weight;
      const sample = matches.slice(0, 3);
      foundAI.push(...sample);
      explanations.push({ type: 'ai', category, count: matches.length, sample: sample.join(', ') });
    }
  }

  for (const { pattern, weight, category } of HUMAN_PATTERNS) {
    const matches = text.match(pattern);
    if (matches) {
      humanScore += matches.length * weight;
      const sample = matches.slice(0, 3);
      foundHuman.push(...sample);
      explanations.push({ type: 'human', category, count: matches.length, sample: sample.join(', ') });
    }
  }

  if (sentences.length > 2) {
    const wordCounts = sentences.map(s => s.split(/\s+/).length);
    const avgLength = wordCounts.reduce((a, b) => a + b, 0) / wordCounts.length;
    const variance = wordCounts.reduce((sum, w) => sum + Math.pow(w - avgLength, 2), 0) / wordCounts.length;
    const stdDev = Math.sqrt(variance);
    
    if (stdDev < 3) {
      aiScore += 8;
      explanations.push({ type: 'ai', category: 'rhythm', count: 1, sample: 'Very uniform sentence lengths' });
    } else if (stdDev > 6) {
      humanScore += 3;
    }
  }

  if (sentences.length > 0) {
    const wordCounts = sentences.map(s => s.split(/\s+/).length);
    const longSentences = wordCounts.filter(w => w > 40).length;
    if (longSentences > 0) {
      aiScore += longSentences * 2;
      explanations.push({ type: 'ai', category: 'complexity', count: longSentences, sample: `${longSentences} very long sentences` });
    }
  }

  const copulaCount = (text.match(/\b(is|are|was|were|be|been|being)\b/gi) || []).length;
  const copulaRatio = copulaCount / Math.max(words.length, 1);
  if (copulaRatio < 0.03 && words.length > 50) {
    aiScore += 4;
    explanations.push({ type: 'ai', category: 'copula', count: 1, sample: 'Low copula ratio (avoiding "is/are")' });
  }

  const firstPerson = (text.match(/\b(I|me|my|mine|we|us|our)\b/gi) || []).length;
  if (firstPerson > 0) humanScore += firstPerson * 2;

  const hedging = (text.match(/\b(might|may|could|possibly|perhaps|might be|could be)\b/gi) || []).length;
  if (hedging > 2) {
    aiScore += hedging * 1.5;
    explanations.push({ type: 'ai', category: 'hedging', count: hedging, sample: `${hedging} hedging phrases` });
  }

  const contractions = (text.match(/'\w{2,3}/g) || []).length;
  if (contractions > 3) humanScore += contractions;

  const properNounPattern = /\b[A-Z][a-z]+\b/g;
  const properNounMatches = text.match(properNounPattern) || [];
  const properNounDensity = properNounMatches.length / Math.max(words.length, 1);
  if (properNounDensity < 0.03 && words.length > 50) {
    aiScore += 3;
    explanations.push({ type: 'ai', category: 'proper-nouns', count: 1, sample: 'Low proper noun density' });
  } else if (properNounDensity > 0.06) {
    humanScore += 2;
  }

  let thirdPerson = (text.match(/\b(they|their|theirs)\b/gi) || []).length;
  let firstPersonAll = (text.match(/\b(I|me|my|mine|we|us|our)\b/gi) || []).length;
  const pronounRatio = firstPersonAll > 0 ? thirdPerson / firstPersonAll : 0;
  if (firstPersonAll > 0 && pronounRatio > 3) {
    aiScore += 4;
    explanations.push({ type: 'ai', category: 'pronouns', count: 1, sample: 'High third-person to first-person ratio' });
  }

  if (words.length >= 50) {
    const windowSize = 50;
    let lowTTRCount = 0;
    for (let i = 0; i <= words.length - windowSize; i += windowSize) {
      const window = words.slice(i, i + windowSize);
      const ttr = calculateTTR(window);
      if (ttr < 0.72) lowTTRCount++;
    }
    if (lowTTRCount > 1) {
      aiScore += 5;
      explanations.push({ type: 'ai', category: 'vocabulary', count: lowTTRCount, sample: 'Low lexical diversity (repetitive vocabulary)' });
    }
  }

  const connectivePattern = /\b(Moreover|Furthermore|Additionally|In addition|furthermore|moreover|additionally)\b/gi;
  const connectives = (text.match(connectivePattern) || []).length;
  const connectiveDensity = (connectives / Math.max(words.length, 1)) * 500;
  if (connectiveDensity > 12) {
    aiScore += 4;
    explanations.push({ type: 'ai', category: 'connective', count: connectives, sample: 'High connective density' });
  }

  const positiveWords = (text.match(/\b(remarkable|outstanding|exceptional|excellent|wonderful|fantastic|brilliant|extraordinary)\b/gi) || []).length;
  const negativeWords = (text.match(/\b(terrible|horrible|awful|dreadful|poor|failure|disappointing|frustrating)\b/gi) || []).length;
  const positivityRatio = positiveWords / Math.max(positiveWords + negativeWords, 1);
  if (positivityRatio > 0.8 && positiveWords > 2) {
    aiScore += 3;
    explanations.push({ type: 'ai', category: 'positivity', count: 1, sample: 'High positivity bias' });
  }

  const paragraphCount = text.split(/\n\n+/).filter(p => p.trim().length > 50).length;
  if (paragraphCount > 0) {
    const sentencesPerParagraph = sentences.length / paragraphCount;
    if (sentencesPerParagraph >= 2 && sentencesPerParagraph <= 4) {
      aiScore += 2;
      explanations.push({ type: 'ai', category: 'structure', count: 1, sample: 'Formulaic paragraph structure' });
    }
  }

  const total = aiScore + humanScore;
  const rawPercent = total > 0 ? (aiScore / (aiScore + humanScore)) * 100 : 50;
  const confidence = Math.min(total / 20, 1);
  const aiPercent = Math.round(50 + (rawPercent - 50) * confidence);
  const finalPercent = Math.max(0, Math.min(100, aiPercent));

  const topExplanations = explanations
    .filter(e => e.type === 'ai')
    .sort((a, b) => {
      const weightA = AI_PATTERNS.find(p => p.category === a.category)?.weight || 1;
      const weightB = AI_PATTERNS.find(p => p.category === b.category)?.weight || 1;
      return (b.count * weightB) - (a.count * weightA);
    })
    .slice(0, 5);

  return {
    detector: 'Heuristic',
    url: 'Local analysis',
    success: true,
    results: {
      aiPercentage: finalPercent,
      humanPercentage: 100 - finalPercent,
      confidence: Math.round(confidence * 100),
      aiScore: Math.round(aiScore * 10) / 10,
      humanScore: Math.round(humanScore * 10) / 10
    },
    raw: {
      aiScore: Math.round(aiScore * 10) / 10,
      humanScore: Math.round(humanScore * 10) / 10,
      foundPatterns: { ai: foundAI, human: foundHuman },
      metrics: {
        properNounDensity: Math.round(properNounDensity * 1000) / 1000,
        pronounRatio: Math.round(pronounRatio * 100) / 100,
        connectiveDensity: Math.round(connectiveDensity * 10) / 10,
        positivityRatio: Math.round(positivityRatio * 100) / 100,
        sentenceCount: sentences.length,
        wordCount: words.length
      }
    },
    explanation: topExplanations
  };
}

function integrateScores(detectorResults, weights = {}) {
  const scores = [];
  
  const defaultWeights = {
    heuristic: 0.2,
    gptzero: 0.25,
    zerogpt: 0.2,
    winston: 0.175,
    originality: 0.175
  };
  
  const w = { ...defaultWeights, ...weights };
  
  for (const [name, result] of Object.entries(detectorResults)) {
    if (!result.success) continue;
    
    const r = result.results || {};
    const aiPct = r.aiPercentage;
    
    if (aiPct !== undefined && aiPct !== null) {
      const weight = w[name] || 0;
      scores.push({ name, aiPercent: aiPct, weight });
    }
  }
  
  if (scores.length === 0) {
    return { 
      integratedPercent: null, 
      confidence: 0,
      scores: [],
      method: 'No valid scores'
    };
  }
  
  const totalWeight = scores.reduce((sum, s) => sum + s.weight, 0);
  const weightedSum = scores.reduce((sum, s) => sum + (s.aiPercent * s.weight), 0);
  const integratedPercent = Math.round(weightedSum / totalWeight);
  
  const agreement = scores.length > 1 
    ? 1 - (Math.max(...scores.map(s => s.aiPercent)) - Math.min(...scores.map(s => s.aiPercent))) / 100
    : 0.5;
  const confidence = Math.round(((scores.length / 5) * 0.6 + agreement * 0.4) * 100);
  
  return {
    integratedPercent,
    confidence,
    scores,
    method: `Weighted average of ${scores.length} detectors`
  };
}

function request(url, options = {}) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    
    const req = client.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    });
    
    req.on('error', reject);
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    if (options.body) req.write(options.body);
    req.end();
  });
}

const HISTORY_FILE = path.join(os.homedir(), '.stop-slop-drop-top', 'history.json');

function saveToHistory(entry) {
  try {
    const dir = path.dirname(HISTORY_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    let history = [];
    if (fs.existsSync(HISTORY_FILE)) {
      try {
        history = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf-8'));
      } catch (e) {
        history = [];
      }
    }
    
    history.unshift({
      timestamp: new Date().toISOString(),
      ...entry
    });
    
    history = history.slice(0, 100);
    
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2));
  } catch (e) {
    // Silent fail for history
  }
}

function getHistory() {
  try {
    if (fs.existsSync(HISTORY_FILE)) {
      return JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf-8'));
    }
  } catch (e) {}
  return [];
}

function clearHistory() {
  try {
    if (fs.existsSync(HISTORY_FILE)) {
      fs.unlinkSync(HISTORY_FILE);
    }
  } catch (e) {}
}

function getVerdict(aiPercent) {
  if (aiPercent === null || aiPercent === undefined) return { label: 'Unknown', color: 'gray' };
  if (aiPercent <= 20) return { label: 'Likely Human', color: 'green' };
  if (aiPercent <= 40) return { label: 'Possible Human', color: 'yellow' };
  if (aiPercent <= 60) return { label: 'Uncertain', color: 'orange' };
  if (aiPercent <= 80) return { label: 'Likely AI', color: 'orange' };
  return { label: 'Likely AI', color: 'red' };
}

function isHighAI(aiPercent, threshold = 50) {
  return aiPercent !== null && aiPercent >= threshold;
}

module.exports = {
  analyzeText,
  integrateScores,
  request,
  saveToHistory,
  getHistory,
  clearHistory,
  getVerdict,
  isHighAI,
  AI_PATTERNS,
  HUMAN_PATTERNS
};
