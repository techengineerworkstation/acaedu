import { create } from 'zustand';
import { Schedule, ScheduleInstance } from '@acadion/shared';

interface ScheduleState {
  schedules: Schedule[];
  instances: ScheduleInstance[];
  isLoading: boolean;
}

interface ScheduleActions {
  setSchedules: (schedules: Schedule[]) => void;
  setInstances: (instances: ScheduleInstance[]) => void;
  addSchedule: (schedule: Schedule) => void;
  updateSchedule: (id: string, updates: Partial<Schedule>) => void;
  deleteSchedule: (id: string) => void;
  refresh: (startDate?: string, endDate?: string) => Promise<void>;
}

const initialState: ScheduleState = {
  schedules: [],
  instances: [],
  isLoading: false
};

export const useScheduleStore = create<ScheduleState & ScheduleActions>((set) => ({
  ...initialState,

  setSchedules: (schedules) => set({ schedules }),

  setInstances: (instances) => set({ instances }),

  addSchedule: (schedule) =>
    set((state) => ({
      schedules: [...state.schedules, schedule]
    })),

  updateSchedule: (id, updates) =>
    set((state) => ({
      schedules: state.schedules.map(s => (s.id === id ? { ...s, ...updates } : s))
    })),

  deleteSchedule: (id) =>
    set((state) => ({
      schedules: state.schedules.filter(s => s.id !== id)
    })),

  refresh: async (startDate?: string, endDate?: string) => {
    set({ isLoading: true });
    try {
      let url = `${API_BASE_URL}/api/schedules`;
      if (startDate && endDate) {
        url += `?start_date=${startDate}&end_date=${endDate}`;
      }

      const response = await fetch(url, {
        credentials: 'include'
      });
      const data = await response.json();

      if (data.success) {
        set({ schedules: data.data, isLoading: false });
      }
    } catch (error) {
      console.error('Schedules fetch error:', error);
      set({ isLoading: false });
    }
  }
}));
