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
          id: number
          is_archived: boolean
          name: string
        }
        Insert: {
          created_at?: string
          educator_id?: string
          id?: number
          is_archived?: boolean
          name: string
        }
        Update: {
          created_at?: string
          educator_id?: string
          id?: number
          is_archived?: boolean
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "classrooms_educator_fkey"
            columns: ["educator_id"]
            isOneToOne: false
            referencedRelation: "educator"
            referencedColumns: ["id"]
          },
        ]
      }
      educator: {
        Row: {
          doctorate: Json[] | null
          id: string
          license_id: number
          masters: Json[] | null
          undergrad: Json[]
          workplace_address: string
          worksplace_name: string | null
        }
        Insert: {
          doctorate?: Json[] | null
          id?: string
          license_id: number
          masters?: Json[] | null
          undergrad: Json[]
          workplace_address: string
          worksplace_name?: string | null
        }
        Update: {
          doctorate?: Json[] | null
          id?: string
          license_id?: number
          masters?: Json[] | null
          undergrad?: Json[]
          workplace_address?: string
          worksplace_name?: string | null
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
      initial_test_classification: {
        Row: {
          classification: Database["public"]["Enums"]["CLASSIFICATION"]
          created_at: string
          prompt: string
          test_id: number
        }
        Insert: {
          classification: Database["public"]["Enums"]["CLASSIFICATION"]
          created_at?: string
          prompt: string
          test_id?: number
        }
        Update: {
          classification?: Database["public"]["Enums"]["CLASSIFICATION"]
          created_at?: string
          prompt?: string
          test_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "initial_test_classification_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: true
            referencedRelation: "initial_test_results"
            referencedColumns: ["id"]
          },
        ]
      }
      initial_test_results: {
        Row: {
          classroom_id: number | null
          complex_arithmetic: Json
          created_at: string
          dot_matching: Json
          id: number
          number_comparison: Json
          number_series: Json
          single_addition: Json
          single_subtraction: Json
          student_id: string | null
        }
        Insert: {
          classroom_id?: number | null
          complex_arithmetic: Json
          created_at?: string
          dot_matching: Json
          id?: number
          number_comparison: Json
          number_series: Json
          single_addition: Json
          single_subtraction: Json
          student_id?: string | null
        }
        Update: {
          classroom_id?: number | null
          complex_arithmetic?: Json
          created_at?: string
          dot_matching?: Json
          id?: number
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
          classroom_id: number | null
          email: string
          id: number
          invited_at: string
        }
        Insert: {
          classroom_id?: number | null
          email: string
          id?: number
          invited_at?: string
        }
        Update: {
          classroom_id?: number | null
          email?: string
          id?: number
          invited_at?: string
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
          classroom_id: number
          id: string
          invited_at: string | null
          joined_at: string
        }
        Insert: {
          accepted?: boolean | null
          classroom_id: number
          id?: string
          invited_at?: string | null
          joined_at?: string
        }
        Update: {
          accepted?: boolean | null
          classroom_id?: number
          id?: string
          invited_at?: string | null
          joined_at?: string
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
