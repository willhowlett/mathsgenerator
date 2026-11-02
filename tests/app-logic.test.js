import { describe, expect, test } from '@jest/globals';
import { generateQuestions, validateQuestions } from '../js/generators/arithmetic-worksheet.js';
import { decodeWorksheetState, encodeSharedState, validCounts } from '../js/shared-state.js';

const artworkThemes = ['dinosaurs', 'robots', 'ocean', 'jungle', 'knights', 'greek-myths', 'fairies', 'monsters', 'vehicles', 'k-pop', 'rockstars'];

function makeState() {
  const state = {
    v: 9,
    method: 'column',
    operations: ['addition', 'subtraction', 'multiplication', 'division'],
    lengths: ['tens', 'hundreds'],
    count: 12,
    exchange: true,
    artwork: 'none',
    includeAnswers: true
  };
  return { ...state, questions: generateQuestions(state) };
}

describe('worksheet sharing', () => {
  test('round-trips all settings and the exact generated questions', () => {
    const state = makeState();
    const restored = decodeWorksheetState(`#${encodeSharedState(state)}`, validateQuestions, artworkThemes);

    expect(restored).toEqual(state);
  });

  test('rejects malformed or invalid worksheet hashes safely', () => {
    expect(decodeWorksheetState('', validateQuestions, artworkThemes)).toBeNull();
    expect(decodeWorksheetState('#not-valid-base64-json', validateQuestions, artworkThemes)).toBeNull();
    const invalid = { ...makeState(), count: 5 };
    expect(decodeWorksheetState(`#${encodeSharedState(invalid)}`, validateQuestions, artworkThemes)).toBeNull();
  });

  test('migrates a previous column worksheet hash', () => {
    const legacy = {
      v: 6,
      year: 'year-3',
      skill: 'column-methods',
      operation: 'addition',
      count: 4,
      length: '100s',
      exchange: false,
      artwork: 'none',
      includeAnswers: false,
      questions: [[120, 31, false], [258, 137, false], [411, 202, false], [610, 101, false]]
    };
    const restored = decodeWorksheetState(`#${encodeSharedState(legacy)}`, validateQuestions, artworkThemes);

    expect(restored.method).toBe('column');
    expect(restored.operations).toEqual(['addition']);
    expect(restored.lengths).toEqual(['hundreds', 'tens']);
    expect(restored.questions).toEqual(legacy.questions.map(([a, b]) => ({
      a, b, operation: 'addition', operandLengths: [a >= 100 ? 'hundreds' : 'tens', b >= 100 ? 'hundreds' : 'tens']
    })));
  });

  test('provides the supported question-count choices', () => {
    expect(validCounts).toEqual([4, 6, 9, 12, 16, 20]);
  });
});
