export interface AdminStudent {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: string;
  isActive: boolean;
  class: { id: number; name: string } | null;
}

export interface AdminClass {
  id: number;
  name: string;
  teacher: { id: number; firstName: string; lastName: string } | null;
  studentCount: number;
}

export const NO_CLASS_FILTER = 'none';

export interface StudentFilters {
  page: number;
  search: string;
  classFilter: string;
}
