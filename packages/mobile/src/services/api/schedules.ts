import { api } from './client';
import { Schedule } from '@acadion/shared';

export const schedulesApi = {
  /**
   * Get all schedules
   */
  async getAll(params?: {
    course_id?: string;
    start_date?: string;
    end_date?: string;
    type?: string;
  }): Promise<{ success: boolean; data: Schedule[]; error?: string }> {
    const queryParams = new URLSearchParams();
    if (params?.course_id) queryParams.append('course_id', params.course_id);
    if (params?.start_date) queryParams.append('start_date', params.start_date);
    if (params?.end_date) queryParams.append('end_date', params.end_date);
    if (params?.type) queryParams.append('type', params.type);

    const queryString = queryParams.toString();
    return api.get<Schedule[]>(`/api/schedules${queryString ? `?${queryString}` : ''}`);
  },

  /**
   * Create schedule
   */
  async create(schedule: Partial<Schedule>): Promise<{ success: boolean; data: Schedule; error?: string }> {
    return api.post<Schedule>('/api/schedules', schedule);
  },

  /**
   * Check for conflicts
   */
  async checkConflicts(
    scheduleData: { start_time: string; end_time: string; course_id?: string }
  ): Promise<{ success: boolean; conflicts: any[]; error?: string }> {
    return api.post<any[]>('/api/schedules/conflicts', scheduleData);
  }
};
