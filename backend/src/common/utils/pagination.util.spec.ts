import { paginate, paginationArgs } from './pagination.util.js';

describe('pagination util', () => {
  it('computes skip and take from page and limit', () => {
    expect(paginationArgs({ page: 3, limit: 10 })).toEqual({
      skip: 20,
      take: 10,
    });
  });

  it('starts at zero on the first page', () => {
    expect(paginationArgs({ page: 1, limit: 25 })).toEqual({
      skip: 0,
      take: 25,
    });
  });

  it('computes the total number of pages', () => {
    const result = paginate(['a'], 41, { page: 1, limit: 20 });

    expect(result.meta).toEqual({
      page: 1,
      limit: 20,
      total: 41,
      totalPages: 3,
    });
  });

  it('reports zero pages for an empty result', () => {
    expect(paginate([], 0, { page: 1, limit: 20 }).meta.totalPages).toBe(0);
  });
});
