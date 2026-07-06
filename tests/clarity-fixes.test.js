const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const clarity = require('../js/alpha-clarity-fixes.js');

test('grounding instructions use direct, simple steps', () => {
  const grounding = {
    easier: 'Shorten it.',
    setup: 'Put one written cue somewhere.',
    note: 'Write stress before and after.'
  };
  let syncCalls = 0;
  const primary = {
    tracks: { 'Mental Wellness': { grounding } },
    sync() { syncCalls += 1; }
  };

  assert.equal(clarity.applyTrackPatches(primary), true);
  assert.equal(syncCalls, 1);
  assert.match(grounding.setup, /^Choose one reminder for next time\./);
  assert.match(grounding.setup, /phone reminder/);
  assert.doesNotMatch(grounding.setup, /written cue/i);
  assert.equal(
    grounding.note,
    'Before you start, rate your stress from 0 to 10. Rate it again when you finish. Write which step helped the most.'
  );
});

test('clarity patch is idempotent', () => {
  const grounding = { ...clarity.trackPatches['Mental Wellness'].grounding };
  let syncCalls = 0;
  const primary = {
    tracks: { 'Mental Wellness': { grounding } },
    sync() { syncCalls += 1; }
  };

  assert.equal(clarity.applyTrackPatches(primary), false);
  assert.equal(syncCalls, 0);
});

test('generic task labels are easier to understand', () => {
  assert.equal(clarity.simplifyTaskLabel('Set up next time'), 'Make next time easier');
  assert.equal(clarity.simplifyTaskLabel('Save one short note'), 'Write down what happened');
  assert.equal(clarity.simplifyTaskLabel('Practice grounding'), 'Practice grounding');
});

test('mobile checkbox CSS overrides full-width field inputs', () => {
  const css = fs.readFileSync(path.join(__dirname, '../css/alpha-clarity-fixes.css'), 'utf8');
  assert.match(css, /\.coaching-area-grid input\[type="checkbox"\]/);
  assert.match(css, /width:\s*22px/);
  assert.match(css, /flex:\s*0 0 22px/);
  assert.match(css, /overflow-wrap:\s*anywhere/);
});
