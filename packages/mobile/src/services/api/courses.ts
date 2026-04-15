import { api } from './client';
import { Course } from '@acadion/shared';

export const coursesApi = {
  /**
   * Get all courses (role-filtered)
   */
  async getAll(params?: {
    department?: string;
    is_active?: boolean;
    lecturer_id?: string;
  }): Promise<{ success: boolean; data: Course[]; error?: string }> {
    const queryParams = new URLSearchParams();
    if (params?.department) queryParams.append('department', params.department);
    if (params?.is_active !== undefined) queryParams.append('is_active', params.is_active.toString());
    if (params?.lecturer_id) queryParams.append('lecturer_id', params.lecturer_id);

    const queryString = queryParams.toString();
    return api.get<Course[]>(`/api/courses${queryString ? `?${queryString}` : ''}`);
  },

  /**
   * Create a new course
   */
  async create(course: Partial<Course>): Promise<{ success: boolean; data: Course; error?: string }> {
    return api.post<Course>('/api/courses', course);
  },

  /**
   * Get single course
   */
  async getById(id: string): Promise<{ success: boolean; data: Course; error?: string }> {
    return api.get<Course>(`/api/courses/${id}`);
  },

  /**
   * Update course
   */
  async update(id: string, updates: Partial<Course>): Promise<{ success: boolean; data: Course; error?: string }> {
    return api.patch<Course>(`/api/courses/${id}`, updates);
  },

  /**
   * Enroll in course
   */
  async enroll(courseId: string): Promise<{ success: boolean; error?: string }> {
    return api.post(`/api/courses/${courseId}/enroll`);
  }
};
