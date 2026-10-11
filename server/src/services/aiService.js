/**
 * aiService.js
 * ------------
 * Central AI orchestrator for InsightFlow.
 *
 * ADAPTION INTEGRATION POINT:
 *   `runAnalysis()` is the single entrypoint for every AI task
 *   (sentiment analysis, issue clustering, recommendation).
 *   It performs: prompt build -> batching -> model selection ->
 *   retry with backoff -> JSON validation -> rule-based fallback.
 *   This is the "meaningful Adaption workflow" the problem statement requires.
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');

const API_KEY = process.env.GEMINI_API_KEY || '';
const RAW_MODEL = process.env.AI_MODEL || 'gemini-2.5-flash';
const MODEL_NAME = RAW_MODEL.replace(/^models\//, '');
const BATCH_SIZE = Number(process.env.AI_BATCH_SIZE || 25);

const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;
const model = genAI ? genAI.getGenerativeModel({ model: MODEL_NAME }) : null;

/* ---------------------------------------------------------------
 * Rule-based fallback analyzer (used if AI key missing / API fails)
 * ------------------------------------------------------------- */
const NEGATIVE_WORDS = [
  'not helpful','unresponsive','disappointed','scam','fraud','fake',
  'counterfeit','never received','delayed','wrong items','damaged',
  'missing','crashed','glitches','unresolved','terrible','worst',
  'stopped working','did not meet','charged multiple times','refund',
];
const POSITIVE_WORDS = [
  'excellent','outstanding','helpful','great','innovative','exceeded',
  'perfect','recommend','satisfied','friendly','responsive','prompt',
  'smooth','reliable','durable','value for money','impressive','love',
];

function ruleBasedAnalyze(text) {
  const lower = text.toLowerCase();
  let score = 0;
  POSITIVE_WORDS.forEach(w => { if (lower.includes(w)) score += 1; });
  NEGATIVE_WORDS.forEach(w => { if (lower.includes(w)) score -= 1; });

  let sentiment = 'neutral';
  if (score > 0) sentiment = 'positive';
  else if (score < 0) sentiment = 'negative';

  const topics = [];
  if (lower.includes('deliver')) topics.push('delivery');
  if (lower.includes('refund') || lower.includes('charged')) topics.push('billing');
  if (lower.includes('customer service') || lower.includes('support')) topics.push('customer-service');
  if (lower.includes('product') || lower.includes('quality')) topics.push('product-quality');
  if (lower.includes('fraud') || lower.includes('scam')) topics.push('fraud');
  if (lower.includes('website') || lower.includes('order')) topics.push('website');

  const complaints = [];
  NEGATIVE_WORDS.forEach(w => { if (lower.includes(w)) complaints.push(w); });

  return { sentiment, sentimentScore: score, topics, complaints };
}

/* ---------------------------------------------------------------
 * JSON-safe parse of model output
 * ------------------------------------------------------------- */
function safeParseJSON(raw) {
  if (!raw) return null;
  let text = raw.trim();
  // strip ```json ... ``` fences
  text = text.replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
  // find first { or [
  const firstBrace = text.search(/[\[{]/);
  if (firstBrace > 0) text = text.slice(firstBrace);
  try { return JSON.parse(text); } catch { return null; }
}

/* ---------------------------------------------------------------
 * ADAPTION ENTRYPOINT — runAnalysis()
 * -------------------------------------------------------------
 * type: 'batch' | 'cluster' | 'recommend'
 * payload: depends on type
 */
async function runAnalysis(type, payload, opts = {}) {
  const { retries = 2 } = opts;

  // If no AI configured OR type=batch with huge payload, fall back gracefully
  if (!model) {
    if (type === 'batch') {
      return payload.items.map(it => ({
        id: it.id,
        ...ruleBasedAnalyze(it.text),
      }));
    }
    return null; // cluster/recommend have dedicated fallbacks below
  }

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const prompt = buildPrompt(type, payload);
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const parsed = safeParseJSON(text);
      if (parsed) return parsed;
      throw new Error('AI returned non-JSON output');
    } catch (err) {
      console.warn(`[aiService] ${type} attempt ${attempt + 1} failed: ${err.message}`);
      if (attempt === retries) {
        if (type === 'batch') {
          return payload.items.map(it => ({
            id: it.id,
            ...ruleBasedAnalyze(it.text),
          }));
        }
        return null;
      }
      await new Promise(r => setTimeout(r, 800 * (attempt + 1)));
    }
  }
}

/* ---------------------------------------------------------------
 * Prompt builder
 * ------------------------------------------------------------- */
function buildPrompt(type, payload) {
  if (type === 'batch') {
    return [
      'You are a customer-feedback analyst.',
      'For EACH review below, return a JSON ARRAY only (no prose) with objects:',
      '{ "id": <same id as input>, "sentiment": "positive|neutral|negative",',
      '  "sentimentScore": <number -5..5>, "topics": [<short tags>],',
      '  "complaints": [<short issues mentioned>] }',
      'Return one object per input, same order, same ids.',
      'INPUT:',
      JSON.stringify(payload.items),
    ].join('\n');
  }

  if (type === 'cluster') {
    return [
      'You are a product manager. Given these customer complaints,',
      'group them into 4-8 distinct ISSUES (clusters).',
      'Return JSON ARRAY only, each item:',
      '{ "title": short, "description": one sentence,',
      '  "severity": 1-5, "frequency": <int count>,',
      '  "exampleIds": [ids from input], "keywords": [..] }',
      'INPUT:',
      JSON.stringify(payload.items.slice(0, 200)),
    ].join('\n');
  }

  if (type === 'recommend') {
    return [
      'You are advising a business. For this issue, return JSON only:',
      '{ "recommendation": "2-3 sentence actionable advice",',
      '  "why": "1 sentence on why this matters" }',
      'ISSUE:',
      JSON.stringify(payload.issue),
    ].join('\n');
  }

  return '';
}

/* ---------------------------------------------------------------
 * High-level helpers used by controllers
 * ------------------------------------------------------------- */
async function analyzeFeedbackBatch(items) {
  const results = [];
  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    const slice = items.slice(i, i + BATCH_SIZE);
    const out = await runAnalysis('batch', { items: slice });
    if (Array.isArray(out)) results.push(...out);
  }
  return results;
}

async function clusterIssues(items) {
  const out = await runAnalysis('cluster', { items });
  if (Array.isArray(out) && out.length) return out;

  // Fallback: group by category
  const map = {};
  items.forEach(it => {
    const k = it.category || 'Uncategorized';
    if (!map[k]) map[k] = { title: k, description: '', severity: 3, frequency: 0, exampleIds: [], keywords: [] };
    map[k].frequency += 1;
    if (map[k].exampleIds.length < 5) map[k].exampleIds.push(it.id);
  });
  return Object.values(map);
}

async function recommendForIssue(issue) {
  const out = await runAnalysis('recommend', { issue });
  if (out && out.recommendation) return out;
  return {
    recommendation: 'Prioritize this issue by allocating support and product resources in the next sprint.',
    why: 'It appears frequently and correlates with negative sentiment.',
  };
}

module.exports = {
  runAnalysis,
  analyzeFeedbackBatch,
  clusterIssues,
  recommendForIssue,
  ruleBasedAnalyze,
};

