import {
  NO_CLASS_FILTER,
  type AdminClass,
  type AdminStudent,
  type StudentFilters,
} from '../features/admin/types.ts';
import { authedRequest } from '../lib/authedRequest.ts';
import type { Paginated } from '../types/api.ts';

const PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

export const adminService = {
  listStudents: ({ page, search, classFilter }: StudentFilters) => {
    const query = new URLSearchParams({
      page: String(page),
      limit: String(PAGE_SIZE),
    });

    if (search.trim()) query.set('search', search.trim());
    if (classFilter === NO_CLASS_FILTER) query.set('unassigned', 'true');
    else if (classFilter) query.set('classId', classFilter);

    return authedRequest<Paginated<AdminStudent>>(`/students?${query}`);
  },

  listClasses: () =>
    authedRequest<Paginated<AdminClass>>(`/classes?limit=${MAX_PAGE_SIZE}`),
};
