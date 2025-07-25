import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ceuauxjomiqezjipzqqw.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNldWF1eGpvbWlxZXpqaXB6cXF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzNjkwOTUsImV4cCI6MjA2ODk0NTA5NX0.xTqHTo2Ljt_EdO2oMF5KoUpGQIolMXf_LkEO2md2jBw'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string
          name: string
          description: string | null
          status: string
          priority: string
          budget: number | null
          start_date: string | null
          end_date: string | null
          progress: number
          tags: string[] | null
          manager_id: string | null
          team_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          status?: string
          priority?: string
          budget?: number | null
          start_date?: string | null
          end_date?: string | null
          progress?: number
          tags?: string[] | null
          manager_id?: string | null
          team_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          status?: string
          priority?: string
          budget?: number | null
          start_date?: string | null
          end_date?: string | null
          progress?: number
          tags?: string[] | null
          manager_id?: string | null
          team_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          title: string
          description: string | null
          status: string
          priority: string
          project_id: string | null
          assigned_to: string | null
          due_date: string | null
          estimated_hours: number | null
          actual_hours: number
          tags: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          status?: string
          priority?: string
          project_id?: string | null
          assigned_to?: string | null
          due_date?: string | null
          estimated_hours?: number | null
          actual_hours?: number
          tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          status?: string
          priority?: string
          project_id?: string | null
          assigned_to?: string | null
          due_date?: string | null
          estimated_hours?: number | null
          actual_hours?: number
          tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      teams: {
        Row: {
          id: string
          name: string
          description: string | null
          manager_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          manager_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          manager_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      time_entries: {
        Row: {
          id: string
          task_id: string | null
          user_id: string | null
          hours: number
          description: string | null
          date: string
          created_at: string
        }
        Insert: {
          id?: string
          task_id?: string | null
          user_id?: string | null
          hours: number
          description?: string | null
          date?: string
          created_at?: string
        }
        Update: {
          id?: string
          task_id?: string | null
          user_id?: string | null
          hours?: number
          description?: string | null
          date?: string
          created_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          project_id: string | null
          user_id: string | null
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          project_id?: string | null
          user_id?: string | null
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string | null
          user_id?: string | null
          content?: string
          created_at?: string
        }
      }
    }
  }
}