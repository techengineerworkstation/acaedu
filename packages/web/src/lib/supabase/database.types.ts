export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      announcements: {
        Row: {
          id: string
          title: string
          content: string
          category: Database["public"]["Enums"]["announcement_category"]
          priority: Database["public"]["Enums"]["priority_level"]
          target_roles: Database["public"]["Enums"]["user_role"][]
          target_courses: string[] | null
          attachments: Json
          author_id: string
          is_published: boolean
          published_at: string | null
          expires_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          content: string
          category?: Database["public"]["Enums"]["announcement_category"]
          priority?: Database["public"]["Enums"]["priority_level"]
          target_roles: Database["public"]["Enums"]["user_role"][]
          target_courses?: string[] | null
          attachments?: Json
          author_id: string
          is_published?: boolean
          published_at?: string | null
          expires_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          category?: Database["public"]["Enums"]["announcement_category"]
          priority?: Database["public"]["Enums"]["priority_level"]
          target_roles?: Database["public"]["Enums"]["user_role"][]
          target_courses?: string[] | null
          attachments?: Json
          author_id?: string
          is_published?: boolean
          published_at?: string | null
          expires_at?: string | null
          created_at?: string
        }
      }
      attendance: {
        Row: {
          id: string
          schedule_id: string
          schedule_instance_id: string | null
          student_id: string
          course_id: string
          status: string
          check_in_time: string | null
          check_out_time: string | null
          notes: string | null
          recorded_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          schedule_id: string
          schedule_instance_id?: string | null
          student_id: string
          course_id: string
          status?: string
          check_in_time?: string | null
          check_out_time?: string | null
          notes?: string | null
          recorded_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          schedule_id?: string
          schedule_instance_id?: string | null
          student_id?: string
          course_id?: string
          status?: string
          check_in_time?: string | null
          check_out_time?: string | null
          notes?: string | null
          recorded_by?: string | null
          created_at?: string
        }
      }
      assignments: {
        Row: {
          id: string
          course_id: string
          title: string
          description: string | null
          due_date: string
          total_points: number
          attachment_urls: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          course_id: string
          title: string
          description?: string | null
          due_date: string
          total_points?: number
          attachment_urls?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          course_id?: string
          title?: string
          description?: string | null
          due_date?: string
          total_points?: number
          attachment_urls?: Json
          created_at?: string
          updated_at?: string
        }
      }
      billing_subscriptions: {
        Row: {
          id: string
          user_id: string
          plan_id: string
          provider: Database["public"]["Enums"]["provider_type"]
          provider_subscription_id: string
          status: Database["public"]["Enums"]["subscription_status"]
          current_period_start: string
          current_period_end: string
          cancel_at_period_end: boolean
          canceled_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          plan_id: string
          provider: Database["public"]["Enums"]["provider_type"]
          provider_subscription_id: string
          status?: Database["public"]["Enums"]["subscription_status"]
          current_period_start: string
          current_period_end: string
          cancel_at_period_end?: boolean
          canceled_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          plan_id?: string
          provider?: Database["public"]["Enums"]["provider_type"]
          provider_subscription_id?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          current_period_start?: string
          current_period_end?: string
          cancel_at_period_end?: boolean
          canceled_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      class_venues: {
        Row: {
          id: string
          institution_id: string | null
          name: string
          building: string | null
          floor: string | null
          room_number: string | null
          capacity: number
          latitude: number | null
          longitude: number | null
          image_urls: Json
          facilities: Json
          directions: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          institution_id?: string | null
          name: string
          building?: string | null
          floor?: string | null
          room_number?: string | null
          capacity?: number
          latitude?: number | null
          longitude?: number | null
          image_urls?: Json
          facilities?: Json
          directions?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          institution_id?: string | null
          name?: string
          building?: string | null
          floor?: string | null
          room_number?: string | null
          capacity?: number
          latitude?: number | null
          longitude?: number | null
          image_urls?: Json
          facilities?: Json
          directions?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      course_constraints: {
        Row: {
          id: string
          user_id: string
          course_id: string
          preferred_days: number[]
          preferred_start_time: string | null
          preferred_end_time: string | null
          avoid_conflicts_with: string[]
          max_gap_minutes: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          course_id: string
          preferred_days?: number[]
          preferred_start_time?: string | null
          preferred_end_time?: string | null
          avoid_conflicts_with?: string[]
          max_gap_minutes?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          course_id?: string
          preferred_days?: number[]
          preferred_start_time?: string | null
          preferred_end_time?: string | null
          avoid_conflicts_with?: string[]
          max_gap_minutes?: number
          created_at?: string
          updated_at?: string
        }
      }
      course_materials: {
        Row: {
          id: string
          course_id: string
          title: string
          description: string | null
          file_url: string
          file_type: string | null
          file_size: number | null
          material_type: string
          week_number: number | null
          is_published: boolean
          uploaded_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          course_id: string
          title: string
          description?: string | null
          file_url: string
          file_type?: string | null
          file_size?: number | null
          material_type?: string
          week_number?: number | null
          is_published?: boolean
          uploaded_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          course_id?: string
          title?: string
          description?: string | null
          file_url?: string
          file_type?: string | null
          file_size?: number | null
          material_type?: string
          week_number?: number | null
          is_published?: boolean
          uploaded_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      course_outlines: {
        Row: {
          id: string
          course_id: string
          week_number: number
          title: string
          description: string | null
          learning_objectives: Json
          topics: Json
          readings: string | null
          created_at: string
        }
        Insert: {
          id?: string
          course_id: string
          week_number: number
          title: string
          description?: string | null
          learning_objectives?: Json
          topics?: Json
          readings?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          course_id?: string
          week_number?: number
          title?: string
          description?: string | null
          learning_objectives?: Json
          topics?: Json
          readings?: string | null
          created_at?: string
        }
      }
      courses: {
        Row: {
          id: string
          course_code: string
          title: string
          description: string | null
          credits: number
          department_id: string | null
          lecturer_id: string | null
          capacity: number
          enrolled_count: number
          is_active: boolean
          created_at: string
          updated_at: string
          semester: string | null
          academic_year: string | null
          syllabus_url: string | null
        }
        Insert: {
          id?: string
          course_code: string
          title: string
          description?: string | null
          credits?: number
          department_id?: string | null
          lecturer_id?: string | null
          capacity?: number
          enrolled_count?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
          semester?: string | null
          academic_year?: string | null
          syllabus_url?: string | null
        }
        Update: {
          id?: string
          course_code?: string
          title?: string
          description?: string | null
          credits?: number
          department_id?: string | null
          lecturer_id?: string | null
          capacity?: number
          enrolled_count?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
          semester?: string | null
          academic_year?: string | null
          syllabus_url?: string | null
        }
      }
      crm_sync: {
        Row: {
          id: string
          user_id: string
          provider: string
          external_id: string
          sync_type: string
          last_synced_at: string
          sync_data: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          provider: string
          external_id: string
          sync_type?: string
          last_synced_at?: string
          sync_data?: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          provider?: string
          external_id?: string
          sync_type?: string
          last_synced_at?: string
          sync_data?: Json
          created_at?: string
        }
      }
      departments: {
        Row: {
          id: string
          name: string
          code: string
          institution_id: string | null
          faculty_id: string | null
          head_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          code: string
          institution_id?: string | null
          faculty_id?: string | null
          head_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          code?: string
          institution_id?: string | null
          faculty_id?: string | null
          head_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      enrollments: {
        Row: {
          id: string
          student_id: string
          course_id: string
          enrolled_at: string
          status: Database["public"]["Enums"]["enrollment_status"]
        }
        Insert: {
          id?: string
          student_id: string
          course_id: string
          enrolled_at?: string
          status?: Database["public"]["Enums"]["enrollment_status"]
        }
        Update: {
          id?: string
          student_id?: string
          course_id?: string
          enrolled_at?: string
          status?: Database["public"]["Enums"]["enrollment_status"]
        }
      }
      event_registrations: {
        Row: {
          id: string
          event_id: string
          user_id: string
          registered_at: string
          attended: boolean
        }
        Insert: {
          id?: string
          event_id: string
          user_id: string
          registered_at?: string
          attended?: boolean
        }
        Update: {
          id?: string
          event_id?: string
          user_id?: string
          registered_at?: string
          attended?: boolean
        }
      }
      events: {
        Row: {
          id: string
          title: string
          description: string | null
          category: Database["public"]["Enums"]["event_category"]
          start_date: string
          end_date: string
          location: string | null
          organizer_id: string
          is_public: boolean
          max_participants: number | null
          registration_required: boolean
          attachments: Json
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          category?: Database["public"]["Enums"]["event_category"]
          start_date: string
          end_date: string
          location?: string | null
          organizer_id: string
          is_public?: boolean
          max_participants?: number | null
          registration_required?: boolean
          attachments?: Json
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          category?: Database["public"]["Enums"]["event_category"]
          start_date?: string
          end_date?: string
          location?: string | null
          organizer_id?: string
          is_public?: boolean
          max_participants?: number | null
          registration_required?: boolean
          attachments?: Json
          created_at?: string
        }
      }
      exams: {
        Row: {
          id: string
          course_id: string
          title: string
          exam_type: Database["public"]["Enums"]["exam_type"]
          exam_date: string
          duration_minutes: number
          location: string | null
          total_marks: number
          passing_marks: number
          instructions: string | null
          attachments: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          course_id: string
          title: string
          exam_type?: Database["public"]["Enums"]["exam_type"]
          exam_date: string
          duration_minutes: number
          location?: string | null
          total_marks?: number
          passing_marks?: number
          instructions?: string | null
          attachments?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          course_id?: string
          title?: string
          exam_type?: Database["public"]["Enums"]["exam_type"]
          exam_date?: string
          duration_minutes?: number
          location?: string | null
          total_marks?: number
          passing_marks?: number
          instructions?: string | null
          attachments?: Json
          created_at?: string
          updated_at?: string
        }
      }
      faculty: {
        Row: {
          id: string
          institution_id: string
          name: string
          code: string
          dean_id: string | null
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          institution_id: string
          name: string
          code: string
          dean_id?: string | null
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          institution_id?: string
          name?: string
          code?: string
          dean_id?: string | null
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      feature_access: {
        Row: {
          id: string
          plan_id: string
          feature: Database["public"]["Enums"]["feature_name"]
          is_enabled: boolean
          limits: Json
        }
        Insert: {
          id?: string
          plan_id: string
          feature: Database["public"]["Enums"]["feature_name"]
          is_enabled?: boolean
          limits?: Json
        }
        Update: {
          id?: string
          plan_id?: string
          feature?: Database["public"]["Enums"]["feature_name"]
          is_enabled?: boolean
          limits?: Json
        }
      }
      grades: {
        Row: {
          id: string
          student_id: string
          assignment_id: string | null
          exam_id: string | null
          points_earned: number | null
          percentage: number | null
          grade_letter: string | null
          submitted_at: string | null
          graded_at: string | null
          feedback: string | null
          attachment_urls: Json
        }
        Insert: {
          id?: string
          student_id: string
          assignment_id?: string | null
          exam_id?: string | null
          points_earned?: number | null
          percentage?: number | null
          grade_letter?: string | null
          submitted_at?: string | null
          graded_at?: string | null
          feedback?: string | null
          attachment_urls?: Json
        }
        Update: {
          id?: string
          student_id?: string
          assignment_id?: string | null
          exam_id?: string | null
          points_earned?: number | null
          percentage?: number | null
          grade_letter?: string | null
          submitted_at?: string | null
          graded_at?: string | null
          feedback?: string | null
          attachment_urls?: Json
        }
      }
      institutions: {
        Row: {
          id: string
          name: string
          code: string
          logo_url: string | null
          primary_color: string
          secondary_color: string
          domain: string | null
          address: string | null
          phone: string | null
          email: string | null
          website: string | null
          is_active: boolean
          settings: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          code: string
          logo_url?: string | null
          primary_color?: string
          secondary_color?: string
          domain?: string | null
          address?: string | null
          phone?: string | null
          email?: string | null
          website?: string | null
          is_active?: boolean
          settings?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          code?: string
          logo_url?: string | null
          primary_color?: string
          secondary_color?: string
          domain?: string | null
          address?: string | null
          phone?: string | null
          email?: string | null
          website?: string | null
          is_active?: boolean
          settings?: Json
          created_at?: string
          updated_at?: string
        }
      }
      lecture_videos: {
        Row: {
          id: string
          course_id: string
          schedule_id: string | null
          title: string
          description: string | null
          video_url: string
          video_type: string
          thumbnail_url: string | null
          duration_seconds: number | null
          semester: string | null
          academic_year: string | null
          ai_summary: string | null
          ai_key_points: Json
          ai_transcript: string | null
          is_published: boolean
          view_count: number
          uploaded_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          course_id: string
          schedule_id?: string | null
          title: string
          description?: string | null
          video_url: string
          video_type?: string
          thumbnail_url?: string | null
          duration_seconds?: number | null
          semester?: string | null
          academic_year?: string | null
          ai_summary?: string | null
          ai_key_points?: Json
          ai_transcript?: string | null
          is_published?: boolean
          view_count?: number
          uploaded_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          course_id?: string
          schedule_id?: string | null
          title?: string
          description?: string | null
          video_url?: string
          video_type?: string
          thumbnail_url?: string | null
          duration_seconds?: number | null
          semester?: string | null
          academic_year?: string | null
          ai_summary?: string | null
          ai_key_points?: Json
          ai_transcript?: string | null
          is_published?: boolean
          view_count?: number
          uploaded_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: Database["public"]["Enums"]["notification_type"]
          title: string
          message: string
          data: Json
          is_read: boolean
          read_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: Database["public"]["Enums"]["notification_type"]
          title: string
          message: string
          data?: Json
          is_read?: boolean
          read_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: Database["public"]["Enums"]["notification_type"]
          title?: string
          message?: string
          data?: Json
          is_read?: boolean
          read_at?: string | null
          created_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          user_id: string
          subscription_id: string | null
          provider: Database["public"]["Enums"]["provider_type"]
          provider_payment_id: string
          amount: number
          currency: string
          status: Database["public"]["Enums"]["payment_status"]
          description: string | null
          paid_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          subscription_id?: string | null
          provider: Database["public"]["Enums"]["provider_type"]
          provider_payment_id: string
          amount: number
          currency?: string
          status?: Database["public"]["Enums"]["payment_status"]
          description?: string | null
          paid_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          subscription_id?: string | null
          provider?: Database["public"]["Enums"]["provider_type"]
          provider_payment_id?: string
          amount?: number
          currency?: string
          status?: Database["public"]["Enums"]["payment_status"]
          description?: string | null
          paid_at?: string | null
          created_at?: string
        }
      }
      schedule_instances: {
        Row: {
          id: string
          schedule_id: string
          instance_date: string
          start_time: string
          end_time: string
          location: string | null
          is_cancelled: boolean
          cancellation_reason: string | null
          created_at: string
        }
        Insert: {
          id?: string
          schedule_id: string
          instance_date: string
          start_time: string
          end_time: string
          location?: string | null
          is_cancelled?: boolean
          cancellation_reason?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          schedule_id?: string
          instance_date?: string
          start_time?: string
          end_time?: string
          location?: string | null
          is_cancelled?: boolean
          cancellation_reason?: string | null
          created_at?: string
        }
      }
      schedules: {
        Row: {
          id: string
          course_id: string
          lecturer_id: string
          title: string
          description: string | null
          schedule_type: Database["public"]["Enums"]["schedule_type"]
          start_time: string
          end_time: string
          location: string | null
          is_recurring: boolean
          recurrence_rule: string | null
          recurring_end_date: string | null
          attachments: Json
          venue_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          course_id: string
          lecturer_id: string
          title: string
          description?: string | null
          schedule_type: Database["public"]["Enums"]["schedule_type"]
          start_time: string
          end_time: string
          location?: string | null
          is_recurring?: boolean
          recurrence_rule?: string | null
          recurring_end_date?: string | null
          attachments?: Json
          venue_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          course_id?: string
          lecturer_id?: string
          title?: string
          description?: string | null
          schedule_type?: Database["public"]["Enums"]["schedule_type"]
          start_time?: string
          end_time?: string
          location?: string | null
          is_recurring?: boolean
          recurrence_rule?: string | null
          recurring_end_date?: string | null
          attachments?: Json
          venue_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      search_queries: {
        Row: {
          id: string
          user_id: string | null
          query: string
          results_count: number
          search_type: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          query: string
          results_count?: number
          search_type?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          query?: string
          results_count?: number
          search_type?: string
          created_at?: string
        }
      }
      users: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["user_role"]
          department: string | null
          student_id: string | null
          employee_id: string | null
          full_name: string
          avatar_url: string | null
          phone: string | null
          email: string
          email_verified: boolean
          institution_id: string | null
          faculty_id: string | null
          gender: string | null
          date_of_birth: string | null
          address: string | null
          matriculation_number: string | null
          level: string | null
          bio: string | null
          emergency_contact: Json
          is_active: boolean
          last_login: string | null
          notification_preferences: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          role?: Database["public"]["Enums"]["user_role"]
          department?: string | null
          student_id?: string | null
          employee_id?: string | null
          full_name: string
          avatar_url?: string | null
          phone?: string | null
          email: string
          email_verified?: boolean
          institution_id?: string | null
          faculty_id?: string | null
          gender?: string | null
          date_of_birth?: string | null
          address?: string | null
          matriculation_number?: string | null
          level?: string | null
          bio?: string | null
          emergency_contact?: Json
          is_active?: boolean
          last_login?: string | null
          notification_preferences?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          department?: string | null
          student_id?: string | null
          employee_id?: string | null
          full_name?: string
          avatar_url?: string | null
          phone?: string | null
          email?: string
          email_verified?: boolean
          institution_id?: string | null
          faculty_id?: string | null
          gender?: string | null
          date_of_birth?: string | null
          address?: string | null
          matriculation_number?: string | null
          level?: string | null
          bio?: string | null
          emergency_contact?: Json
          is_active?: boolean
          last_login?: string | null
          notification_preferences?: Json
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_schedule_conflicts: {
        Args: {
          schedule_id: string
          check_date: string
          start_time: string
          end_time: string
        }
        Returns: {
          conflicting_schedule_id: string
          conflicting_title: string
          overlap_minutes: number
        }[]
      }
      get_attendance_stats: {
        Args: {
          p_course_id: string
          p_start_date?: string
          p_end_date?: string
        }
        Returns: {
          student_id: string
          student_name: string
          total_sessions: number
          present_count: number
          absent_count: number
          late_count: number
          attendance_rate: number
        }[]
      }
      get_population_census: {
        Args: {
          p_institution_id?: string
          p_role?: string
        }
        Returns: {
          department_name: string
          faculty_name: string
          total_count: number
          male_count: number
          female_count: number
          active_count: number
        }[]
      }
      is_date_in_rrule: {
        Args: {
          check_date: string
          rrule: string
        }
        Returns: boolean
      }
      generate_schedule_instances: {
        Args: {
          schedule_id: string
          from_date?: string
          days_ahead?: number
        }
        Returns: {
          id: string
          schedule_id: string
          instance_date: string
          start_time: string
          end_time: string
          location: string | null
          is_cancelled: boolean
          cancellation_reason: string | null
          created_at: string
        }[]
      }
      update_updated_at_column: {
        Args: Record<string, never>
        Returns: unknown
      }
      decrement_enrolled_count: {
        Args: {
          p_course_id: string
        }
        Returns: {
          success: boolean
        }
      }
    }
    Enums: {
      announcement_category:
        | "general"
        | "academic"
        | "event"
        | "emergency"
        | "billing"
        | "maintenance"
      enrollment_status: "active" | "completed" | "dropped" | "failed"
      event_category: "academic" | "social" | "sports" | "career" | "other"
      exam_type: "midterm" | "final" | "quiz" | "assignment" | "test"
      feature_name:
        | "unlimited_courses"
        | "unlimited_notifications"
        | "push_notifications"
        | "email_notifications"
        | "ai_scheduler"
        | "advanced_analytics"
        | "priority_support"
        | "custom_branding"
      notification_type:
        | "announcement"
        | "schedule_reminder"
        | "schedule_change"
        | "grade_posted"
        | "assignment_due"
        | "payment_reminder"
        | "system_maintenance"
        | "exam_reminder"
      payment_status: "pending" | "completed" | "failed" | "refunded"
      priority_level: "low" | "normal" | "high" | "urgent"
      provider_type: "paystack" | "paypal"
      schedule_type: "lecture" | "tutorial" | "lab" | "exam" | "assignment"
      subscription_status:
        | "active"
        | "canceled"
        | "past_due"
        | "unpaid"
        | "trialing"
      user_role: "student" | "lecturer" | "admin" | "dean"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
