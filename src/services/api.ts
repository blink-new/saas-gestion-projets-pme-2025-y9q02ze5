import { Project, Task, Team, User, TimeEntry, ApiResponse, ProjectFilters, TaskFilters, PaginationParams } from '../types'

// Mock data storage (simule une base de données)
const mockProjects: Project[] = [
  {
    id: '1',
    name: 'Refonte Site Web',
    description: 'Modernisation complète du site web de l\'entreprise avec nouvelle identité visuelle',
    status: 'active',
    priority: 'high',
    startDate: '2025-01-15',
    endDate: '2025-03-15',
    progress: 65,
    budget: 25000,
    teamId: '1',
    managerId: '1',
    tags: ['web', 'design', 'frontend'],
    createdAt: '2025-01-10T10:00:00Z',
    updatedAt: '2025-01-20T15:30:00Z'
  },
  {
    id: '2',
    name: 'Application Mobile',
    description: 'Développement d\'une application mobile native pour iOS et Android',
    status: 'planning',
    priority: 'medium',
    startDate: '2025-02-01',
    endDate: '2025-06-01',
    progress: 15,
    budget: 45000,
    teamId: '2',
    managerId: '2',
    tags: ['mobile', 'ios', 'android'],
    createdAt: '2025-01-05T09:00:00Z',
    updatedAt: '2025-01-18T11:20:00Z'
  },
  {
    id: '3',
    name: 'Migration Cloud',
    description: 'Migration de l\'infrastructure vers le cloud AWS',
    status: 'active',
    priority: 'urgent',
    startDate: '2025-01-20',
    endDate: '2025-04-20',
    progress: 30,
    budget: 35000,
    teamId: '3',
    managerId: '1',
    tags: ['cloud', 'aws', 'infrastructure'],
    createdAt: '2025-01-15T14:00:00Z',
    updatedAt: '2025-01-22T16:45:00Z'
  }
]

const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Conception maquettes homepage',
    description: 'Créer les maquettes desktop et mobile de la page d\'accueil',
    status: 'in-progress',
    priority: 'high',
    projectId: '1',
    assigneeId: '2',
    creatorId: '1',
    dueDate: '2025-01-30',
    estimatedHours: 16,
    actualHours: 8,
    tags: ['design', 'ui/ux'],
    attachments: [],
    comments: [],
    createdAt: '2025-01-15T10:00:00Z',
    updatedAt: '2025-01-20T14:30:00Z'
  },
  {
    id: '2',
    title: 'Développement API REST',
    description: 'Mise en place de l\'API backend avec authentification JWT',
    status: 'todo',
    priority: 'medium',
    projectId: '2',
    assigneeId: '3',
    creatorId: '2',
    dueDate: '2025-02-15',
    estimatedHours: 32,
    actualHours: 0,
    tags: ['backend', 'api'],
    attachments: [],
    comments: [],
    createdAt: '2025-01-18T09:00:00Z',
    updatedAt: '2025-01-18T09:00:00Z'
  },
  {
    id: '3',
    title: 'Configuration serveurs AWS',
    description: 'Setup des instances EC2 et configuration des groupes de sécurité',
    status: 'done',
    priority: 'urgent',
    projectId: '3',
    assigneeId: '1',
    creatorId: '1',
    dueDate: '2025-01-25',
    estimatedHours: 12,
    actualHours: 14,
    tags: ['aws', 'devops'],
    attachments: [],
    comments: [],
    createdAt: '2025-01-20T08:00:00Z',
    updatedAt: '2025-01-25T17:00:00Z'
  }
]

const mockTeams: Team[] = [
  {
    id: '1',
    name: 'Équipe Frontend',
    description: 'Équipe spécialisée dans le développement frontend et UX/UI',
    managerId: '1',
    members: [
      { userId: '1', role: 'manager', joinedAt: '2024-12-01T00:00:00Z' },
      { userId: '2', role: 'member', joinedAt: '2024-12-15T00:00:00Z' }
    ],
    projects: ['1'],
    createdAt: '2024-12-01T00:00:00Z',
    updatedAt: '2025-01-15T00:00:00Z'
  },
  {
    id: '2',
    name: 'Équipe Mobile',
    description: 'Développement d\'applications mobiles natives et hybrides',
    managerId: '2',
    members: [
      { userId: '2', role: 'manager', joinedAt: '2024-11-01T00:00:00Z' },
      { userId: '3', role: 'member', joinedAt: '2024-11-15T00:00:00Z' }
    ],
    projects: ['2'],
    createdAt: '2024-11-01T00:00:00Z',
    updatedAt: '2025-01-10T00:00:00Z'
  }
]

const mockUsers: User[] = [
  {
    id: '1',
    email: 'alice@projectflow.com',
    name: 'Alice Martin',
    role: 'admin',
    createdAt: '2024-10-01T00:00:00Z'
  },
  {
    id: '2',
    email: 'bob@projectflow.com',
    name: 'Bob Dupont',
    role: 'manager',
    createdAt: '2024-10-15T00:00:00Z'
  },
  {
    id: '3',
    email: 'charlie@projectflow.com',
    name: 'Charlie Leroy',
    role: 'member',
    createdAt: '2024-11-01T00:00:00Z'
  }
]

// Simulation d'appels API avec délais
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// API Projects
export const projectsApi = {
  async getAll(filters?: ProjectFilters, pagination?: PaginationParams): Promise<ApiResponse<{ projects: Project[], total: number }>> {
    await delay(300)
    
    let filteredProjects = [...mockProjects]
    
    if (filters?.status?.length) {
      filteredProjects = filteredProjects.filter(p => filters.status!.includes(p.status))
    }
    
    if (filters?.priority?.length) {
      filteredProjects = filteredProjects.filter(p => filters.priority!.includes(p.priority))
    }
    
    if (filters?.search) {
      const search = filters.search.toLowerCase()
      filteredProjects = filteredProjects.filter(p => 
        p.name.toLowerCase().includes(search) || 
        p.description.toLowerCase().includes(search)
      )
    }
    
    const total = filteredProjects.length
    
    if (pagination) {
      const start = (pagination.page - 1) * pagination.limit
      filteredProjects = filteredProjects.slice(start, start + pagination.limit)
    }
    
    return {
      success: true,
      data: { projects: filteredProjects, total }
    }
  },

  async getById(id: string): Promise<ApiResponse<Project>> {
    await delay(200)
    const project = mockProjects.find(p => p.id === id)
    
    if (!project) {
      return { success: false, error: 'Projet non trouvé' }
    }
    
    return { success: true, data: project }
  },

  async create(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Project>> {
    await delay(500)
    
    const newProject: Project = {
      ...project,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    mockProjects.push(newProject)
    
    return { success: true, data: newProject }
  },

  async update(id: string, updates: Partial<Project>): Promise<ApiResponse<Project>> {
    await delay(400)
    
    const index = mockProjects.findIndex(p => p.id === id)
    if (index === -1) {
      return { success: false, error: 'Projet non trouvé' }
    }
    
    mockProjects[index] = {
      ...mockProjects[index],
      ...updates,
      updatedAt: new Date().toISOString()
    }
    
    return { success: true, data: mockProjects[index] }
  },

  async delete(id: string): Promise<ApiResponse<void>> {
    await delay(300)
    
    const index = mockProjects.findIndex(p => p.id === id)
    if (index === -1) {
      return { success: false, error: 'Projet non trouvé' }
    }
    
    mockProjects.splice(index, 1)
    
    return { success: true }
  }
}

// API Tasks
export const tasksApi = {
  async getAll(filters?: TaskFilters, pagination?: PaginationParams): Promise<ApiResponse<{ tasks: Task[], total: number }>> {
    await delay(300)
    
    let filteredTasks = [...mockTasks]
    
    if (filters?.status?.length) {
      filteredTasks = filteredTasks.filter(t => filters.status!.includes(t.status))
    }
    
    if (filters?.projectId) {
      filteredTasks = filteredTasks.filter(t => t.projectId === filters.projectId)
    }
    
    if (filters?.assigneeId) {
      filteredTasks = filteredTasks.filter(t => t.assigneeId === filters.assigneeId)
    }
    
    if (filters?.search) {
      const search = filters.search.toLowerCase()
      filteredTasks = filteredTasks.filter(t => 
        t.title.toLowerCase().includes(search) || 
        (t.description && t.description.toLowerCase().includes(search))
      )
    }
    
    const total = filteredTasks.length
    
    if (pagination) {
      const start = (pagination.page - 1) * pagination.limit
      filteredTasks = filteredTasks.slice(start, start + pagination.limit)
    }
    
    return {
      success: true,
      data: { tasks: filteredTasks, total }
    }
  },

  async create(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Task>> {
    await delay(500)
    
    const newTask: Task = {
      ...task,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    mockTasks.push(newTask)
    
    return { success: true, data: newTask }
  },

  async update(id: string, updates: Partial<Task>): Promise<ApiResponse<Task>> {
    await delay(400)
    
    const index = mockTasks.findIndex(t => t.id === id)
    if (index === -1) {
      return { success: false, error: 'Tâche non trouvée' }
    }
    
    mockTasks[index] = {
      ...mockTasks[index],
      ...updates,
      updatedAt: new Date().toISOString()
    }
    
    return { success: true, data: mockTasks[index] }
  },

  async delete(id: string): Promise<ApiResponse<void>> {
    await delay(300)
    
    const index = mockTasks.findIndex(t => t.id === id)
    if (index === -1) {
      return { success: false, error: 'Tâche non trouvée' }
    }
    
    mockTasks.splice(index, 1)
    
    return { success: true }
  }
}

// API Teams
export const teamsApi = {
  async getAll(): Promise<ApiResponse<Team[]>> {
    await delay(300)
    return { success: true, data: mockTeams }
  },

  async getById(id: string): Promise<ApiResponse<Team>> {
    await delay(200)
    const team = mockTeams.find(t => t.id === id)
    
    if (!team) {
      return { success: false, error: 'Équipe non trouvée' }
    }
    
    return { success: true, data: team }
  },

  async create(team: Omit<Team, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Team>> {
    await delay(500)
    
    const newTeam: Team = {
      ...team,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    mockTeams.push(newTeam)
    
    return { success: true, data: newTeam }
  }
}

// API Users
export const usersApi = {
  async getAll(): Promise<ApiResponse<User[]>> {
    await delay(200)
    return { success: true, data: mockUsers }
  },

  async getById(id: string): Promise<ApiResponse<User>> {
    await delay(150)
    const user = mockUsers.find(u => u.id === id)
    
    if (!user) {
      return { success: false, error: 'Utilisateur non trouvé' }
    }
    
    return { success: true, data: user }
  }
}