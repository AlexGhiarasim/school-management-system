import { average, summarize } from './grades.util.js';

const math = { id: 1, name: 'Mathematics' };
const english = { id: 2, name: 'English' };

describe('grades util', () => {
  describe('average', () => {
    it('returns null when there are no values', () => {
      expect(average([])).toBeNull();
    });

    it('rounds to two decimals', () => {
      expect(average([7, 8, 10])).toBe(8.33);
    });

    it('returns the value itself for a single grade', () => {
      expect(average([9])).toBe(9);
    });
  });

  describe('summarize', () => {
    it('returns an empty summary without grades', () => {
      expect(summarize([])).toEqual({ average: null, bySubject: [] });
    });

    it('computes the overall average and one entry per subject', () => {
      const result = summarize([
        { value: 10, subject: math },
        { value: 8, subject: math },
        { value: 6, subject: english },
      ]);

      expect(result.average).toBe(8);
      expect(result.bySubject).toEqual([
        { subjectId: 2, subject: 'English', average: 6, count: 1 },
        { subjectId: 1, subject: 'Mathematics', average: 9, count: 2 },
      ]);
    });
  });
});
