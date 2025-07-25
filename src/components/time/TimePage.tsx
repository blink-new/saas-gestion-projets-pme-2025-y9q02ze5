import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Badge } from '../ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { Label } from '../ui/label'
import { Clock, Play, Pause, Plus, Calendar } from 'lucide-react'
import { timeEntriesApi, tasksApi, projectsApi } from '../../services/supabaseApi'
import type { TimeEntry, Task, Project } from '../../types'

export function TimePage() {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isTracking, setIsTracking] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [startTime, setStartTime] = useState<Date | null>(null)

  // Formulaire pour nouvelle entrée
  const [formData, setFormData] = useState({
    task_id: '',
    hours: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  })

  const loadData = async () => {
    try {
      const [entriesData, tasksData, projectsData] = await Promise.all([
        timeEntriesApi.getAll(),
        tasksApi.getAll(),
        projectsApi.getAll()
      ])
      setTimeEntries(entriesData)
      setTasks(tasksData)
      setProjects(projectsData)
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStartTracking = () => {
    setIsTracking(true)
    setStartTime(new Date())
    setCurrentTime(0)
  }

  const handleStopTracking = () => {
    if (startTime) {
      const endTime = new Date()
      const hours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60)
      setFormData(prev => ({ ...prev, hours: hours.toFixed(2) }))
      setIsDialogOpen(true)
    }
    setIsTracking(false)
    setStartTime(null)
    setCurrentTime(0)
  }

  const handleSubmit = async () => {
    try {
      const entry = await timeEntriesApi.create({
        task_id: formData.task_id,
        user_id: 'current-user', // À remplacer par l'ID utilisateur réel
        hours: parseFloat(formData.hours),
        description: formData.description,
        date: formData.date
      })
      setTimeEntries(prev => [entry, ...prev])
      setFormData({
        task_id: '',
        hours: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
      })
      setIsDialogOpen(false)
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'entrée:', error)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Timer pour le suivi en temps réel
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isTracking && startTime) {
      interval = setInterval(() => {
        const now = new Date()
        setCurrentTime(Math.floor((now.getTime() - startTime.getTime()) / 1000))
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isTracking, startTime])

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getTotalHours = () => {
    return timeEntries.reduce((sum, entry) => sum + entry.hours, 0)
  }

  const getTaskName = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId)
    return task?.title || 'Tâche inconnue'
  }

  const getProjectName = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId)
    if (!task?.project_id) return 'Projet inconnu'
    const project = projects.find(p => p.id === task.project_id)
    return project?.name || 'Projet inconnu'
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Suivi du Temps</h1>
          <p className="text-gray-600 mt-1">Enregistrement et analyse du temps de travail</p>
        </div>
      </div>

      {/* Timer et statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Timer Actuel</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-4xl font-mono font-bold text-indigo-600 mb-4">
                {formatTime(currentTime)}
              </div>
              <div className="space-x-2">
                {!isTracking ? (
                  <Button onClick={handleStartTracking} className="w-full">
                    <Play className="h-4 w-4 mr-2" />
                    Démarrer
                  </Button>
                ) : (
                  <Button onClick={handleStopTracking} variant="destructive" className="w-full">
                    <Pause className="h-4 w-4 mr-2" />
                    Arrêter
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Aujourd'hui</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {timeEntries
                .filter(entry => entry.date === new Date().toISOString().split('T')[0])
                .reduce((sum, entry) => sum + entry.hours, 0)
                .toFixed(1)}h
            </div>
            <p className="text-sm text-gray-600">Temps enregistré</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Global</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {getTotalHours().toFixed(1)}h
            </div>
            <p className="text-sm text-gray-600">Toutes périodes</p>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Entrées de Temps</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter une Entrée
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nouvelle Entrée de Temps</DialogTitle>
              <DialogDescription>
                Enregistrez le temps passé sur une tâche
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="task">Tâche</Label>
                <Select value={formData.task_id} onValueChange={(value) => setFormData(prev => ({ ...prev, task_id: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une tâche" />
                  </SelectTrigger>
                  <SelectContent>
                    {tasks.map((task) => (
                      <SelectItem key={task.id} value={task.id}>
                        {task.title} - {getProjectName(task.id)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="hours">Heures</Label>
                <Input
                  id="hours"
                  type="number"
                  step="0.25"
                  value={formData.hours}
                  onChange={(e) => setFormData(prev => ({ ...prev, hours: e.target.value }))}
                  placeholder="Ex: 2.5"
                />
              </div>
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Description du travail effectué..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleSubmit} disabled={!formData.task_id || !formData.hours}>
                Enregistrer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tableau des entrées */}
      <Card>
        <CardHeader>
          <CardTitle>Historique des Entrées</CardTitle>
          <CardDescription>Liste de toutes les entrées de temps enregistrées</CardDescription>
        </CardHeader>
        <CardContent>
          {timeEntries.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Aucune entrée de temps enregistrée</p>
              <p className="text-sm">Commencez à suivre votre temps de travail</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Tâche</TableHead>
                  <TableHead>Projet</TableHead>
                  <TableHead>Heures</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {timeEntries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>{new Date(entry.date).toLocaleDateString()}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{getTaskName(entry.task_id || '')}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{getProjectName(entry.task_id || '')}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono font-medium">{entry.hours}h</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">{entry.description || 'Aucune description'}</span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}