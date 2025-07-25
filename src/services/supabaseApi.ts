import { supabase } from '../lib/supabase'
import type { Project, Task, Team, TimeEntry, Message } from '../types'

// Projects API
export const projectsApi = {
  async getAll(): Promise<Project[]> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  async getById(id: string): Promise<Project | null> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  async create(project: Omit<Project, 'id' | 'created_at' | 'updated_at'>): Promise<Project> {
    const { data, error } = await supabase
      .from('projects')
      .insert([project])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async update(id: string, updates: Partial<Project>): Promise<Project> {
    const { data, error } = await supabase
      .from('projects')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

// Tasks API
export const tasksApi = {
  async getAll(): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        projects:project_id (
          name
        )
      `)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  async getByProject(projectId: string): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  async create(task: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task> {
    const { data, error } = await supabase
      .from('tasks')
      .insert([task])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async update(id: string, updates: Partial<Task>): Promise<Task> {
    const { data, error } = await supabase
      .from('tasks')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

// Teams API
export const teamsApi = {
  async getAll(): Promise<Team[]> {
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  async create(team: Omit<Team, 'id' | 'created_at' | 'updated_at'>): Promise<Team> {
    const { data, error } = await supabase
      .from('teams')
      .insert([team])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async update(id: string, updates: Partial<Team>): Promise<Team> {
    const { data, error } = await supabase
      .from('teams')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('teams')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

// Time Entries API
export const timeEntriesApi = {
  async getAll(): Promise<TimeEntry[]> {
    const { data, error } = await supabase
      .from('time_entries')
      .select(`
        *,
        tasks:task_id (
          title,
          projects:project_id (
            name
          )
        )
      `)
      .order('date', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  async create(entry: Omit<TimeEntry, 'id' | 'created_at'>): Promise<TimeEntry> {
    const { data, error } = await supabase
      .from('time_entries')
      .insert([entry])
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}

// Messages API
export const messagesApi = {
  async getByProject(projectId: string): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true })
    
    if (error) throw error
    return data || []
  },

  async create(message: Omit<Message, 'id' | 'created_at'>): Promise<Message> {
    const { data, error } = await supabase
      .from('messages')
      .insert([message])
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}

// Analytics API
export const analyticsApi = {
  async getProjectStats() {
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('status')
    
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('status, priority, estimated_hours, actual_hours')
    
    if (projectsError || tasksError) throw projectsError || tasksError
    
    const projectsByStatus = projects?.reduce((acc, project) => {
      acc[project.status] = (acc[project.status] || 0) + 1
      return acc
    }, {} as Record<string, number>) || {}
    
    const tasksByStatus = tasks?.reduce((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1
      return acc
    }, {} as Record<string, number>) || {}
    
    const tasksByPriority = tasks?.reduce((acc, task) => {
      acc[task.priority] = (acc[task.priority] || 0) + 1
      return acc
    }, {} as Record<string, number>) || {}
    
    const totalEstimatedHours = tasks?.reduce((sum, task) => sum + (task.estimated_hours || 0), 0) || 0
    const totalActualHours = tasks?.reduce((sum, task) => sum + (task.actual_hours || 0), 0) || 0
    
    return {
      projectsByStatus,
      tasksByStatus,
      tasksByPriority,
      totalEstimatedHours,
      totalActualHours,
      efficiency: totalEstimatedHours > 0 ? (totalActualHours / totalEstimatedHours) * 100 : 0
    }
  }
}