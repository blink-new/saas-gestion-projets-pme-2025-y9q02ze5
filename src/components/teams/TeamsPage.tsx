import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, Users, Crown, User, Mail, Calendar, MoreHorizontal, Edit, Trash2, UserPlus } from 'lucide-react'
import { Team, User as UserType } from '../../types'
import { teamsApi, usersApi } from '../../services/api'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Avatar, AvatarFallback } from '../ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { useToast } from '../../hooks/use-toast'

const roleColors = {
  manager: 'bg-purple-100 text-purple-800',
  member: 'bg-blue-100 text-blue-800',
  viewer: 'bg-gray-100 text-gray-800'
}

const roleLabels = {
  manager: 'Manager',
  member: 'Membre',
  viewer: 'Observateur'
}

export function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([])
  const [users, setUsers] = useState<UserType[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editingTeam, setEditingTeam] = useState<Team | null>(null)
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)
  const [showAddMemberDialog, setShowAddMemberDialog] = useState(false)
  const { toast } = useToast()

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    managerId: ''
  })

  const [memberFormData, setMemberFormData] = useState({
    userId: '',
    role: 'member' as 'manager' | 'member' | 'viewer'
  })

  const resetForm = useCallback(() => {
    setFormData({
      name: '',
      description: '',
      managerId: ''
    })
  }, [])

  const resetMemberForm = useCallback(() => {
    setMemberFormData({
      userId: '',
      role: 'member'
    })
  }, [])

  const loadTeams = useCallback(async () => {
    try {
      setLoading(true)
      const response = await teamsApi.getAll()
      
      if (response.success && response.data) {
        setTeams(response.data)
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les équipes',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  const loadUsers = useCallback(async () => {
    const response = await usersApi.getAll()
    if (response.success && response.data) {
      setUsers(response.data)
    }
  }, [])

  useEffect(() => {
    loadTeams()
    loadUsers()
  }, [loadTeams, loadUsers])

  const handleCreateTeam = async () => {
    try {
      const teamData = {
        ...formData,
        members: [
          {
            userId: formData.managerId,
            role: 'manager' as const,
            joinedAt: new Date().toISOString()
          }
        ],
        projects: []
      }

      const response = await teamsApi.create(teamData)
      
      if (response.success && response.data) {
        setTeams(prev => [response.data!, ...prev])
        setShowCreateDialog(false)
        resetForm()
        toast({
          title: 'Succès',
          description: 'Équipe créée avec succès'
        })
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de créer l\'équipe',
        variant: 'destructive'
      })
    }
  }

  const openEditDialog = (team: Team) => {
    setEditingTeam(team)
    setFormData({
      name: team.name,
      description: team.description || '',
      managerId: team.managerId
    })
  }

  const getUserById = (userId: string) => {
    return users.find(u => u.id === userId)
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const filteredTeams = teams.filter(team =>
    team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (team.description && team.description.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const TeamCard = ({ team }: { team: Team }) => {
    const manager = getUserById(team.managerId)
    
    return (
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
                <CardTitle className="text-lg line-clamp-1">{team.name}</CardTitle>
                {team.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {team.description}
                  </p>
                )}
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setSelectedTeam(team)}>
                    <Users className="w-4 h-4 mr-2" />
                    Voir détails
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => openEditDialog(team)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Modifier
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {
                    setSelectedTeam(team)
                    setShowAddMemberDialog(true)
                  }}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Ajouter membre
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Supprimer
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Manager */}
            {manager && (
              <div className="flex items-center gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-purple-100 text-purple-800">
                    {getInitials(manager.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">{manager.name}</p>
                    <Crown className="w-3 h-3 text-purple-600" />
                  </div>
                  <p className="text-xs text-muted-foreground">Manager</p>
                </div>
              </div>
            )}

            {/* Members count */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>{team.members.length} membre{team.members.length > 1 ? 's' : ''}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>{team.projects.length} projet{team.projects.length > 1 ? 's' : ''}</span>
              </div>
            </div>

            {/* Members avatars */}
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {team.members.slice(0, 4).map((member, index) => {
                  const user = getUserById(member.userId)
                  if (!user) return null
                  
                  return (
                    <Avatar key={member.userId} className="w-6 h-6 border-2 border-background">
                      <AvatarFallback className="text-xs">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                  )
                })}
                {team.members.length > 4 && (
                  <div className="w-6 h-6 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                    <span className="text-xs text-muted-foreground">+{team.members.length - 4}</span>
                  </div>
                )}
              </div>
              {team.members.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedTeam(team)}
                  className="text-xs h-6 px-2"
                >
                  Voir tous
                </Button>
              )}
            </div>

            <div className="text-xs text-muted-foreground">
              Créée le {new Date(team.createdAt).toLocaleDateString()}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Équipes</h1>
          <p className="text-muted-foreground">
            Gérez vos équipes et leurs membres
          </p>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Nouvelle équipe
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Créer une nouvelle équipe</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom de l'équipe</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Nom de l'équipe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Description de l'équipe"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="managerId">Manager</Label>
                <Select value={formData.managerId} onValueChange={(value) => setFormData(prev => ({ ...prev, managerId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un manager" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name} - {user.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Annuler
              </Button>
              <Button onClick={handleCreateTeam}>
                Créer l'équipe
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Rechercher des équipes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Teams Grid */}
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
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-muted rounded-full"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </div>
                  <div className="h-3 bg-muted rounded w-1/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredTeams.map((team) => (
              <TeamCard key={team.id} team={team} />
            ))}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Team Details Dialog */}
      <Dialog open={!!selectedTeam} onOpenChange={(open) => !open && setSelectedTeam(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              {selectedTeam?.name}
            </DialogTitle>
          </DialogHeader>
          {selectedTeam && (
            <div className="space-y-6">
              {selectedTeam.description && (
                <p className="text-muted-foreground">{selectedTeam.description}</p>
              )}
              
              <div>
                <h4 className="font-semibold mb-3">Membres de l'équipe</h4>
                <div className="space-y-3">
                  {selectedTeam.members.map((member) => {
                    const user = getUserById(member.userId)
                    if (!user) return null
                    
                    return (
                      <div key={member.userId} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>
                              {getInitials(user.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{user.name}</p>
                              {member.role === 'manager' && <Crown className="w-4 h-4 text-purple-600" />}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Mail className="w-3 h-3" />
                              <span>{user.email}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={roleColors[member.role]}>
                            {roleLabels[member.role]}
                          </Badge>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Edit className="w-4 h-4 mr-2" />
                                Modifier rôle
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="w-4 h-4 mr-2" />
                                Retirer de l'équipe
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddMemberDialog(true)
                  }}
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Ajouter un membre
                </Button>
                <Button variant="outline" onClick={() => setSelectedTeam(null)}>
                  Fermer
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Member Dialog */}
      <Dialog open={showAddMemberDialog} onOpenChange={setShowAddMemberDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Ajouter un membre</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="userId">Utilisateur</Label>
              <Select value={memberFormData.userId} onValueChange={(value) => setMemberFormData(prev => ({ ...prev, userId: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un utilisateur" />
                </SelectTrigger>
                <SelectContent>
                  {users
                    .filter(user => !selectedTeam?.members.some(m => m.userId === user.id))
                    .map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name} - {user.email}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Rôle</Label>
              <Select value={memberFormData.role} onValueChange={(value) => setMemberFormData(prev => ({ ...prev, role: value as any }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Membre</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="viewer">Observateur</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => {
              setShowAddMemberDialog(false)
              resetMemberForm()
            }}>
              Annuler
            </Button>
            <Button onClick={() => {
              // TODO: Implement add member logic
              setShowAddMemberDialog(false)
              resetMemberForm()
              toast({
                title: 'Succès',
                description: 'Membre ajouté avec succès'
              })
            }}>
              Ajouter
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {filteredTeams.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-12 h-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Aucune équipe trouvée</h3>
          <p className="text-muted-foreground mb-4">
            Commencez par créer votre première équipe
          </p>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Créer une équipe
          </Button>
        </div>
      )}
    </div>
  )
}