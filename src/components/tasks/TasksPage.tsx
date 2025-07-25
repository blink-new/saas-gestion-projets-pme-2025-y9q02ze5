import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, Filter, User, Calendar, Clock, MoreHorizontal, Edit, Trash2 } from 'lucide-react'
import { Task, TaskFilters, Project } from '../../types'
import { tasksApi, projectsApi, usersApi } from '../../services/api'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { useToast } from '../../hooks/use-toast'

const statusColumns = [
  { id: 'todo', title: 'À faire', color: 'bg-gray-100' },
  { id: 'in-progress', title: 'En cours', color: 'bg-blue-100' },
  { id: 'review', title: 'En révision', color: 'bg-yellow-100' },
  { id: 'done', title: 'Terminé', color: 'bg-green-100' }
]

const priorityColors = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800'
}

export function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState<TaskFilters>({})
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [draggedTask, setDraggedTask] = useState<Task | null>(null)
  const { toast } = useToast()

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'todo' as Task['status'],
    priority: 'medium' as Task['priority'],
    projectId: '',
    assigneeId: '',
    dueDate: '',
    estimatedHours: '',
    tags: ''
  })

  const resetForm = useCallback(() => {
    setFormData({
      title: '',
      description: '',
      status: 'todo',
      priority: 'medium',
      projectId: '',
      assigneeId: '',
      dueDate: '',
      estimatedHours: '',
      tags: ''
    })
  }, [])

  const loadTasks = useCallback(async () => {
    try {
      setLoading(true)
      const response = await tasksApi.getAll({
        ...filters,
        search: searchTerm || undefined
      })
      
      if (response.success && response.data) {
        setTasks(response.data.tasks)
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les tâches',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }, [filters, searchTerm, toast])

  const loadProjects = useCallback(async () => {
    const response = await projectsApi.getAll()
    if (response.success && response.data) {
      setProjects(response.data.projects)
    }
  }, [])

  const loadUsers = useCallback(async () => {
    const response = await usersApi.getAll()
    if (response.success && response.data) {
      setUsers(response.data)
    }
  }, [])

  useEffect(() => {
    loadTasks()
    loadProjects()
    loadUsers()
  }, [loadTasks, loadProjects, loadUsers])

  const handleCreateTask = async () => {
    try {
      const taskData = {
        ...formData,
        creatorId: '1', // Mock user ID
        estimatedHours: formData.estimatedHours ? parseFloat(formData.estimatedHours) : undefined,
        actualHours: 0,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        attachments: [],
        comments: []
      }

      const response = await tasksApi.create(taskData)
      
      if (response.success && response.data) {
        setTasks(prev => [response.data!, ...prev])
        setShowCreateDialog(false)
        resetForm()
        toast({
          title: 'Succès',
          description: 'Tâche créée avec succès'
        })
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de créer la tâche',
        variant: 'destructive'
      })
    }
  }

  const handleUpdateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      const response = await tasksApi.update(taskId, updates)
      
      if (response.success && response.data) {
        setTasks(prev => prev.map(t => t.id === taskId ? response.data! : t))
        
        if (editingTask && editingTask.id === taskId) {
          setEditingTask(null)
          resetForm()
        }
        
        toast({
          title: 'Succès',
          description: 'Tâche mise à jour avec succès'
        })
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour la tâche',
        variant: 'destructive'
      })
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    try {
      const response = await tasksApi.delete(taskId)
      
      if (response.success) {
        setTasks(prev => prev.filter(t => t.id !== taskId))
        toast({
          title: 'Succès',
          description: 'Tâche supprimée avec succès'
        })
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer la tâche',
        variant: 'destructive'
      })
    }
  }

  const openEditDialog = (task: Task) => {
    setEditingTask(task)
    setFormData({
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      projectId: task.projectId,
      assigneeId: task.assigneeId || '',
      dueDate: task.dueDate || '',
      estimatedHours: task.estimatedHours?.toString() || '',
      tags: task.tags.join(', ')
    })
  }

  const handleDragStart = (task: Task) => {
    setDraggedTask(task)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, newStatus: Task['status']) => {
    e.preventDefault()
    if (draggedTask && draggedTask.status !== newStatus) {
      handleUpdateTask(draggedTask.id, { status: newStatus })
    }
    setDraggedTask(null)
  }

  const getTasksByStatus = (status: Task['status']) => {
    return tasks.filter(task => task.status === status)
  }

  const getProjectName = (projectId: string) => {
    const project = projects.find(p => p.id === projectId)
    return project?.name || 'Projet inconnu'
  }

  const getUserName = (userId: string) => {
    const user = users.find((u: any) => u.id === userId)
    return user?.name || 'Non assigné'
  }

  const TaskCard = ({ task }: { task: Task }) => (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ scale: 1.02 }}
      draggable
      onDragStart={() => handleDragStart(task)}
      className="group cursor-move"
    >
      <Card className="hover:shadow-md transition-all duration-200">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1 flex-1">
              <CardTitle className="text-sm line-clamp-2">{task.title}</CardTitle>
              {task.description && (
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {task.description}
                </p>
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0">
                  <MoreHorizontal className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => openEditDialog(task)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Modifier
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleDeleteTask(task.id)}
                  className="text-red-600"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Supprimer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge className={priorityColors[task.priority]} variant="secondary">
              {task.priority}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {getProjectName(task.projectId)}
            </Badge>
          </div>

          {task.assigneeId && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <User className="w-3 h-3" />
              <span>{getUserName(task.assigneeId)}</span>
            </div>
          )}

          {task.dueDate && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="w-3 h-3" />
              <span>{new Date(task.dueDate).toLocaleDateString()}</span>
            </div>
          )}

          {task.estimatedHours && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span>{task.estimatedHours}h estimées</span>
            </div>
          )}

          {task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {task.tags.slice(0, 2).map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {task.tags.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{task.tags.length - 2}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tâches</h1>
          <p className="text-muted-foreground">
            Gérez vos tâches avec le tableau Kanban
          </p>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Nouvelle tâche
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Créer une nouvelle tâche</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-2">
                <Label htmlFor="title">Titre de la tâche</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Titre de la tâche"
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Description de la tâche"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="projectId">Projet</Label>
                <Select value={formData.projectId} onValueChange={(value) => setFormData(prev => ({ ...prev, projectId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un projet" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="assigneeId">Assigné à</Label>
                <Select value={formData.assigneeId} onValueChange={(value) => setFormData(prev => ({ ...prev, assigneeId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un utilisateur" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user: any) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Priorité</Label>
                <Select value={formData.priority} onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value as Task['priority'] }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Faible</SelectItem>
                    <SelectItem value="medium">Moyenne</SelectItem>
                    <SelectItem value="high">Élevée</SelectItem>
                    <SelectItem value="urgent">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="estimatedHours">Heures estimées</Label>
                <Input
                  id="estimatedHours"
                  type="number"
                  value={formData.estimatedHours}
                  onChange={(e) => setFormData(prev => ({ ...prev, estimatedHours: e.target.value }))}
                  placeholder="Heures"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueDate">Date d'échéance</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tags">Tags (séparés par des virgules)</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="frontend, urgent, bug"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Annuler
              </Button>
              <Button onClick={handleCreateTask}>
                Créer la tâche
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters and Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Rechercher des tâches..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={filters.projectId || 'all'} onValueChange={(value) => setFilters(prev => ({ ...prev, projectId: value === 'all' ? undefined : value }))}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Tous les projets" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les projets</SelectItem>
            {projects.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                {project.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.assigneeId || 'all'} onValueChange={(value) => setFilters(prev => ({ ...prev, assigneeId: value === 'all' ? undefined : value }))}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Tous les assignés" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les assignés</SelectItem>
            {users.map((user: any) => (
              <SelectItem key={user.id} value={user.id}>
                {user.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statusColumns.map((column) => (
          <div
            key={column.id}
            className="space-y-4"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.id as Task['status'])}
          >
            <div className={`p-4 rounded-lg ${column.color}`}>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{column.title}</h3>
                <Badge variant="secondary">
                  {getTasksByStatus(column.id as Task['status']).length}
                </Badge>
              </div>
            </div>
            
            <div className="space-y-3 min-h-[400px]">
              <AnimatePresence>
                {getTasksByStatus(column.id as Task['status']).map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </AnimatePresence>
              
              {getTasksByStatus(column.id as Task['status']).length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-2">
                    <Plus className="w-6 h-6" />
                  </div>
                  <p className="text-sm">Aucune tâche</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingTask} onOpenChange={(open) => !open && setEditingTask(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Modifier la tâche</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="edit-title">Titre de la tâche</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Titre de la tâche"
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Description de la tâche"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-status">Statut</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as Task['status'] }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">À faire</SelectItem>
                  <SelectItem value="in-progress">En cours</SelectItem>
                  <SelectItem value="review">En révision</SelectItem>
                  <SelectItem value="done">Terminé</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-priority">Priorité</Label>
              <Select value={formData.priority} onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value as Task['priority'] }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Faible</SelectItem>
                  <SelectItem value="medium">Moyenne</SelectItem>
                  <SelectItem value="high">Élevée</SelectItem>
                  <SelectItem value="urgent">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-2">
              <Label htmlFor="edit-tags">Tags (séparés par des virgules)</Label>
              <Input
                id="edit-tags"
                value={formData.tags}
                onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                placeholder="frontend, urgent, bug"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setEditingTask(null)}>
              Annuler
            </Button>
            <Button onClick={() => editingTask && handleUpdateTask(editingTask.id, {
              ...formData,
              estimatedHours: formData.estimatedHours ? parseFloat(formData.estimatedHours) : undefined,
              tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
            })}>
              Mettre à jour
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}