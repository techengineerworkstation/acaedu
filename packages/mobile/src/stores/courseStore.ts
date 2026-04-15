import { create } from 'zustand';
import { Course, Enrollment } from '@acadion/shared';

interface CourseState {
  courses: Course[];
  enrolledCourses: Course[];
  isLoading: boolean;
}

interface CourseActions {
  setCourses: (courses: Course[]) => void;
  setEnrolledCourses: (courses: Course[]) => void;
  addCourse: (course: Course) => void;
  updateCourse: (id: string, updates: Partial<Course>) => void;
  refresh: (enrolledOnly?: boolean) => Promise<void>;
}

const initialState: CourseState = {
  courses: [],
  enrolledCourses: [],
  isLoading: false
};

export const useCourseStore = create<CourseState & CourseActions>((set) => ({
  ...initialState,

  setCourses: (courses) => set({ courses }),

  setEnrolledCourses: (enrolledCourses) => set({ enrolledCourses }),

  addCourse: (course) =>
    set((state) => ({
      courses: [...state.courses, course]
    })),

  updateCourse: (id, updates) =>
    set((state) => ({
      courses: state.courses.map(c => (c.id === id ? { ...c, ...updates } : c)),
      enrolledCourses: state.enrolledCourses.map(c =>
        c.id === id ? { ...c, ...updates } : c
      )
    })),

  refresh: async (enrolledOnly = false) => {
    set({ isLoading: true });
    try {
      const endpoint = enrolledOnly ? '/api/courses?enrolled=true' : '/api/courses';
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        credentials: 'include'
      });
      const data = await response.json();

      if (data.success) {
        if (enrolledOnly) {
          set({ enrolledCourses: data.data, isLoading: false });
        } else {
          set({ courses: data.data, isLoading: false });
        }
      }
    } catch (error) {
      console.error('Courses fetch error:', error);
      set({ isLoading: false });
    }
  }
}));
