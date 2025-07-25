import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, Filter, Grid, List, Calendar, MoreHorizontal, Edit, Trash2, Eye } from 'lucide-react'
import { Project, ProjectFilters } from '../../types'
import { projectsApi, usersApi, teamsApi } from '../../services/api'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Progress } from '../ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { useToast } from '../../hooks/use-toast'

type ViewMode = 'grid' | 'list' | 'calendar'

const statusColors = {
  planning: 'bg-blue-100 text-blue-800',
  active: 'bg-green-100 text-green-800',
  'on-hold': 'bg-yellow-100 text-yellow-800',
  completed: 'bg-purple-100 text-purple-800',
  cancelled: 'bg-red-100 text-red-800'
}

const priorityColors = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800'
}

export function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState<ProjectFilters>({})
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [users, setUsers] = useState([])
  const [teams, setTeams] = useState([])
  const { toast } = useToast()

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'planning' as Project['status'],
    priority: 'medium' as Project['priority'],
    startDate: '',
    endDate: '',
    budget: '',
    teamId: '',
    managerId: '',
    tags: ''
  })

  const resetForm = useCallback(() => {
    setFormData({
      name: '',
      description: '',
      status: 'planning',
      priority: 'medium',
      startDate: '',
      endDate: '',
      budget: '',
      teamId: '',
      managerId: '',
      tags: ''
    })
  }, [])

  const loadProjects = useCallback(async () => {
    try {
      setLoading(true)
      const response = await projectsApi.getAll({
        ...filters,
        search: searchTerm || undefined
      })
      
      if (response.success && response.data) {
        setProjects(response.data.projects)
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les projets',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }, [filters, searchTerm, toast])

  const loadUsers = useCallback(async () => {
    const response = await usersApi.getAll()
    if (response.success && response.data) {
      setUsers(response.data)
    }
  }, [])

  const loadTeams = useCallback(async () => {
    const response = await teamsApi.getAll()
    if (response.success && response.data) {
      setTeams(response.data)
    }
  }, [])

  useEffect(() => {
    loadProjects()
    loadUsers()
    loadTeams()
  }, [loadProjects, loadUsers, loadTeams])

  const handleCreateProject = async () => {
    try {
      const projectData = {
        ...formData,
        budget: formData.budget ? parseFloat(formData.budget) : undefined,
        progress: 0,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
      }

      const response = await projectsApi.create(projectData)
      
      if (response.success && response.data) {
        setProjects(prev => [response.data!, ...prev])
        setShowCreateDialog(false)
        resetForm()
        toast({
          title: 'Succès',
          description: 'Projet créé avec succès'
        })
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de créer le projet',
        variant: 'destructive'
      })
    }
  }

  const handleUpdateProject = async () => {
    if (!editingProject) return

    try {
      const updates = {
        ...formData,
        budget: formData.budget ? parseFloat(formData.budget) : undefined,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
      }

      const response = await projectsApi.update(editingProject.id, updates)
      
      if (response.success && response.data) {
        setProjects(prev => prev.map(p => p.id === editingProject.id ? response.data! : p))
        setEditingProject(null)
        resetForm()
        toast({
          title: 'Succès',
          description: 'Projet mis à jour avec succès'
        })
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour le projet',
        variant: 'destructive'
      })
    }
  }

  const handleDeleteProject = async (projectId: string) => {
    try {
      const response = await projectsApi.delete(projectId)
      
      if (response.success) {
        setProjects(prev => prev.filter(p => p.id !== projectId))
        toast({
          title: 'Succès',
          description: 'Projet supprimé avec succès'
        })
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer le projet',
        variant: 'destructive'
      })
    }
  }

  const openEditDialog = (project: Project) => {
    setEditingProject(project)
    setFormData({
      name: project.name,
      description: project.description,
      status: project.status,
      priority: project.priority,
      startDate: project.startDate,
      endDate: project.endDate || '',
      budget: project.budget?.toString() || '',
      teamId: project.teamId,
      managerId: project.managerId,
      tags: project.tags.join(', ')
    })
  }

  const ProjectCard = ({ project }: { project: Project }) => (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -4 }}
      className="group"
    >
      <Card className="h-full hover:shadow-lg transition-all duration-200">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1 flex-1">
              <CardTitle className="text-lg line-clamp-1">{project.name}</CardTitle>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {project.description}
              </p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => openEditDialog(project)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Modifier
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Eye className="w-4 h-4 mr-2" />
                  Voir détails
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleDeleteProject(project.id)}
                  className="text-red-600"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Supprimer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge className={statusColors[project.status]}>
              {project.status}
            </Badge>
            <Badge className={priorityColors[project.priority]}>
              {project.priority}
            </Badge>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progression</span>
              <span>{project.progress}%</span>
            </div>
            <Progress value={project.progress} className="h-2" />
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Début: {new Date(project.startDate).toLocaleDateString()}</span>
            {project.budget && (
              <span>{project.budget.toLocaleString()}€</span>
            )}
          </div>

          {project.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {project.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {project.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{project.tags.length - 3}
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
          <h1 className="text-3xl font-bold">Projets</h1>
          <p className="text-muted-foreground">
            Gérez vos projets et suivez leur progression
          </p>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Nouveau projet
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Créer un nouveau projet</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom du projet</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Nom du projet"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Statut</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as Project['status'] }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planning">Planification</SelectItem>
                    <SelectItem value="active">Actif</SelectItem>
                    <SelectItem value="on-hold">En pause</SelectItem>
                    <SelectItem value="completed">Terminé</SelectItem>
                    <SelectItem value="cancelled">Annulé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Description du projet"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Priorité</Label>
                <Select value={formData.priority} onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value as Project['priority'] }))}>
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
                <Label htmlFor="budget">Budget (€)</Label>
                <Input
                  id="budget"
                  type="number"
                  value={formData.budget}
                  onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
                  placeholder="Budget"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="startDate">Date de début</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">Date de fin</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="tags">Tags (séparés par des virgules)</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="web, design, frontend"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Annuler
              </Button>
              <Button onClick={handleCreateProject}>
                Créer le projet
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
            placeholder="Rechercher des projets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={filters.status?.[0] || 'all'} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value === 'all' ? undefined : [value as Project['status']] }))}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="planning">Planification</SelectItem>
            <SelectItem value="active">Actif</SelectItem>
            <SelectItem value="on-hold">En pause</SelectItem>
            <SelectItem value="completed">Terminé</SelectItem>
            <SelectItem value="cancelled">Annulé</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center border rounded-lg">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('grid')}
            className="rounded-r-none"
          >
            <Grid className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
            className="rounded-none"
          >
            <List className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'calendar' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('calendar')}
            className="rounded-l-none"
          >
            <Calendar className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-full"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <div className="h-6 bg-muted rounded w-16"></div>
                    <div className="h-6 bg-muted rounded w-16"></div>
                  </div>
                  <div className="h-2 bg-muted rounded w-full"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <AnimatePresence>
          {viewMode === 'grid' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingProject} onOpenChange={(open) => !open && setEditingProject(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Modifier le projet</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nom du projet</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Nom du projet"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-status">Statut</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as Project['status'] }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planning">Planification</SelectItem>
                  <SelectItem value="active">Actif</SelectItem>
                  <SelectItem value="on-hold">En pause</SelectItem>
                  <SelectItem value="completed">Terminé</SelectItem>
                  <SelectItem value="cancelled">Annulé</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Description du projet"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-priority">Priorité</Label>
              <Select value={formData.priority} onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value as Project['priority'] }))}>
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
              <Label htmlFor="edit-budget">Budget (€)</Label>
              <Input
                id="edit-budget"
                type="number"
                value={formData.budget}
                onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
                placeholder="Budget"
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label htmlFor="edit-tags">Tags (séparés par des virgules)</Label>
              <Input
                id="edit-tags"
                value={formData.tags}
                onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                placeholder="web, design, frontend"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setEditingProject(null)}>
              Annuler
            </Button>
            <Button onClick={handleUpdateProject}>
              Mettre à jour
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {projects.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Grid className="w-12 h-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Aucun projet trouvé</h3>
          <p className="text-muted-foreground mb-4">
            Commencez par créer votre premier projet
          </p>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Créer un projet
          </Button>
        </div>
      )}
    </div>
  )
}