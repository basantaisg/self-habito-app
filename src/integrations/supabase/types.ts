export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      categories: {
        Row: {
          created_at: string | null
          id: string
          name: string
          sort_order: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          sort_order?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          sort_order?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      settings: {
        Row: {
          created_at: string | null
          goal_weight_kg: number | null
          id: number
          pomodoro_break_min: number | null
          pomodoro_cycles_before_long: number | null
          pomodoro_long_break_min: number | null
          pomodoro_work_min: number | null
          start_weight_kg: number | null
          ultradian_break_min: number | null
          ultradian_work_min: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          goal_weight_kg?: number | null
          id?: number
          pomodoro_break_min?: number | null
          pomodoro_cycles_before_long?: number | null
          pomodoro_long_break_min?: number | null
          pomodoro_work_min?: number | null
          start_weight_kg?: number | null
          ultradian_break_min?: number | null
          ultradian_work_min?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          goal_weight_kg?: number | null
          id?: number
          pomodoro_break_min?: number | null
          pomodoro_cycles_before_long?: number | null
          pomodoro_long_break_min?: number | null
          pomodoro_work_min?: number | null
          start_weight_kg?: number | null
          ultradian_break_min?: number | null
          ultradian_work_min?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      sleep_logs: {
        Row: {
          bedtime: string | null
          created_at: string | null
          date: string
          hours: number
          id: string
          note: string | null
          quality: number | null
          user_id: string | null
          wake_time: string | null
        }
        Insert: {
          bedtime?: string | null
          created_at?: string | null
          date: string
          hours: number
          id?: string
          note?: string | null
          quality?: number | null
          user_id?: string | null
          wake_time?: string | null
        }
        Update: {
          bedtime?: string | null
          created_at?: string | null
          date?: string
          hours?: number
          id?: string
          note?: string | null
          quality?: number | null
          user_id?: string | null
          wake_time?: string | null
        }
        Relationships: []
      }
      weight_logs: {
        Row: {
          created_at: string | null
          date: string
          id: string
          user_id: string | null
          weight_kg: number
        }
        Insert: {
          created_at?: string | null
          date: string
          id?: string
          user_id?: string | null
          weight_kg: number
        }
        Update: {
          created_at?: string | null
          date?: string
          id?: string
          user_id?: string | null
          weight_kg?: number
        }
        Relationships: []
      }
      work_sessions: {
        Row: {
          category_id: string | null
          created_at: string | null
          date: string
          duration_minutes: number
          end_time: string
          id: string
          note: string | null
          session_type: Database["public"]["Enums"]["session_type"]
          start_time: string
          user_id: string | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          date?: string
          duration_minutes: number
          end_time: string
          id?: string
          note?: string | null
          session_type: Database["public"]["Enums"]["session_type"]
          start_time: string
          user_id?: string | null
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          date?: string
          duration_minutes?: number
          end_time?: string
          id?: string
          note?: string | null
          session_type?: Database["public"]["Enums"]["session_type"]
          start_time?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "work_sessions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_logs: {
        Row: {
          created_at: string | null
          date: string
          duration_minutes: number
          id: string
          intensity: number | null
          note: string | null
          user_id: string | null
          workout_type: string
        }
        Insert: {
          created_at?: string | null
          date?: string
          duration_minutes: number
          id?: string
          intensity?: number | null
          note?: string | null
          user_id?: string | null
          workout_type: string
        }
        Update: {
          created_at?: string | null
          date?: string
          duration_minutes?: number
          id?: string
          intensity?: number | null
          note?: string | null
          user_id?: string | null
          workout_type?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      session_type: "pomodoro_work" | "ultradian_work" | "manual_work"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      session_type: ["pomodoro_work", "ultradian_work", "manual_work"],
    },
  },
} as const
