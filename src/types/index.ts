export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  role: 'admin' | 'manager' | 'member'
  createdAt: string
}

export interface Project {
  id: string
  name: string
  description: string
  status: 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  startDate: string
  endDate?: string
  progress: number
  budget?: number
  teamId: string
  managerId: string
  tags: string[]
  createdAt: string
  updatedAt: string
}

export interface Task {
  id: string
  title: string
  description?: string
  status: 'todo' | 'in-progress' | 'review' | 'done'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  projectId: string
  assigneeId?: string
  creatorId: string
  dueDate?: string
  estimatedHours?: number
  actualHours?: number
  tags: string[]
  attachments: string[]
  comments: Comment[]
  createdAt: string
  updatedAt: string
}

export interface Team {
  id: string
  name: string
  description?: string
  managerId: string
  members: TeamMember[]
  projects: string[]
  createdAt: string
  updatedAt: string
}

export interface TeamMember {
  userId: string
  role: 'manager' | 'member' | 'viewer'
  joinedAt: string
}

export interface Comment {
  id: string
  content: string
  authorId: string
  createdAt: string
  updatedAt?: string
}

export interface TimeEntry {
  id: string
  userId: string
  taskId: string
  projectId: string
  description?: string
  hours: number
  date: string
  createdAt: string
}

export interface Notification {
  id: string
  userId: string
  type: 'task_assigned' | 'project_update' | 'deadline_reminder' | 'comment_added'
  title: string
  message: string
  read: boolean
  data?: any
  createdAt: string
}

// API Response types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Filter and pagination types
export interface PaginationParams {
  page: number
  limit: number
}

export interface ProjectFilters {
  status?: Project['status'][]
  priority?: Project['priority'][]
  teamId?: string
  managerId?: string
  search?: string
}

export interface TaskFilters {
  status?: Task['status'][]
  priority?: Task['priority'][]
  projectId?: string
  assigneeId?: string
  search?: string
}