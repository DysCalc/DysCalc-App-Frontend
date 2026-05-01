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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      classrooms: {
        Row: {
          created_at: string
          educator_id: string
          id: string
          is_archived: boolean
          name: string
        }
        Insert: {
          created_at?: string
          educator_id?: string
          id?: string
          is_archived?: boolean
          name: string
        }
        Update: {
          created_at?: string
          educator_id?: string
          id?: string
          is_archived?: boolean
          name?: string
        }
        Relationships: []
      }
      educator: {
        Row: {
          doctorate: Json | null
          id: string
          license_id: number
          masters: Json | null
          undergrad: Json
          workplace_address: string
          workplace_name: string | null
        }
        Insert: {
          doctorate?: Json | null
          id?: string
          license_id: number
          masters?: Json | null
          undergrad: Json
          workplace_address: string
          workplace_name?: string | null
        }
        Update: {
          doctorate?: Json | null
          id?: string
          license_id?: number
          masters?: Json | null
          undergrad?: Json
          workplace_address?: string
          workplace_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "educator_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_modules: {
        Row: {
          created_at: string
          paths: Json | null
          prompt: string | null
          result_id: string
        }
        Insert: {
          created_at?: string
          paths?: Json | null
          prompt?: string | null
          result_id?: string
        }
        Update: {
          created_at?: string
          paths?: Json | null
          prompt?: string | null
          result_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_modules_result_id_fkey"
            columns: ["result_id"]
            isOneToOne: true
            referencedRelation: "test_results"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          date_of_birth: string
          id: string
          nickname: string | null
          sex: Database["public"]["Enums"]["SEX"]
        }
        Insert: {
          created_at?: string
          date_of_birth: string
          id?: string
          nickname?: string | null
          sex: Database["public"]["Enums"]["SEX"]
        }
        Update: {
          created_at?: string
          date_of_birth?: string
          id?: string
          nickname?: string | null
          sex?: Database["public"]["Enums"]["SEX"]
        }
        Relationships: []
      }
      student_invites: {
        Row: {
          classroom_id: string
          email: string
          invited_at: string
          is_accepted: boolean
        }
        Insert: {
          classroom_id?: string
          email: string
          invited_at?: string
          is_accepted?: boolean
        }
        Update: {
          classroom_id?: string
          email?: string
          invited_at?: string
          is_accepted?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "student_invites_classroom_id_fkey"
            columns: ["classroom_id"]
            isOneToOne: false
            referencedRelation: "classrooms"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          accepted: boolean | null
          classroom_id: string
          id: string
          invited_at: string
          joined_at: string | null
        }
        Insert: {
          accepted?: boolean | null
          classroom_id: string
          id?: string
          invited_at?: string
          joined_at?: string | null
        }
        Update: {
          accepted?: boolean | null
          classroom_id?: string
          id?: string
          invited_at?: string
          joined_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "students_classroom_id_fkey"
            columns: ["classroom_id"]
            isOneToOne: false
            referencedRelation: "classrooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_id_fkey"
            columns: ["id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      test_results: {
        Row: {
          classification: Database["public"]["Enums"]["CLASSIFICATION"] | null
          classroom_id: string | null
          complex_arithmetic: Json
          created_at: string
          dot_matching: Json
          id: string
          is_approved: boolean
          number_comparison: Json
          number_series: Json
          single_addition: Json
          single_subtraction: Json
          student_id: string | null
        }
        Insert: {
          classification?: Database["public"]["Enums"]["CLASSIFICATION"] | null
          classroom_id?: string | null
          complex_arithmetic: Json
          created_at?: string
          dot_matching: Json
          id?: string
          is_approved?: boolean
          number_comparison: Json
          number_series: Json
          single_addition: Json
          single_subtraction: Json
          student_id?: string | null
        }
        Update: {
          classification?: Database["public"]["Enums"]["CLASSIFICATION"] | null
          classroom_id?: string | null
          complex_arithmetic?: Json
          created_at?: string
          dot_matching?: Json
          id?: string
          is_approved?: boolean
          number_comparison?: Json
          number_series?: Json
          single_addition?: Json
          single_subtraction?: Json
          student_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "initial_test_results_classroom_id_fkey"
            columns: ["classroom_id"]
            isOneToOne: false
            referencedRelation: "classrooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "initial_test_results_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      educator_details: {
        Row: {
          avatar_url: string | null
          classroom_count: number | null
          email: string | null
          full_name: string | null
          id: string | null
          nickname: string | null
        }
        Relationships: [
          {
            foreignKeyName: "educator_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      create_educator_with_profile: {
        Args: {
          p_date_of_birth: string
          p_doctorate: string
          p_id: string
          p_license_id: string
          p_masters: string
          p_nickname: string
          p_sex: string
          p_undergrad: string
          p_workplace_address: string
          p_workplace_name: string
        }
        Returns: undefined
      }
      delete_educator_with_profile: {
        Args: { p_id: string }
        Returns: undefined
      }
      update_educator_with_profile: {
        Args: {
          p_date_of_birth: string
          p_doctorate: string
          p_id: string
          p_license_id: string
          p_masters: string
          p_nickname: string
          p_sex: string
          p_undergrad: string
          p_workplace_address: string
          p_workplace_name: string
        }
        Returns: undefined
      }
      validate_education_jsonb: { Args: { obj: Json }; Returns: boolean }
      validate_educational_jsonb_array: {
        Args: { arr: Json[] }
        Returns: boolean
      }
    }
    Enums: {
      CLASSIFICATION: "TYPICAL" | "AT-RISK"
      ROLE: "ADMIN" | "EDUCATOR" | "STUDENT"
      SEX: "MALE" | "FEMALE"
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
      CLASSIFICATION: ["TYPICAL", "AT-RISK"],
      ROLE: ["ADMIN", "EDUCATOR", "STUDENT"],
      SEX: ["MALE", "FEMALE"],
    },
  },
} as const
