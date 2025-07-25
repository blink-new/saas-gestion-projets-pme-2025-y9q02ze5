import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Progress } from '../ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
import { TrendingUp, TrendingDown, Clock, Target, Users, CheckCircle } from 'lucide-react'
import { analyticsApi } from '../../services/supabaseApi'

interface AnalyticsData {
  projectsByStatus: Record<string, number>
  tasksByStatus: Record<string, number>
  tasksByPriority: Record<string, number>
  totalEstimatedHours: number
  totalActualHours: number
  efficiency: number
}

const COLORS = ['#6366F1', '#F59E0B', '#10B981', '#EF4444', '#8B5CF6']

const statusLabels: Record<string, string> = {
  active: 'Actif',
  completed: 'Terminé',
  planning: 'Planification',
  on_hold: 'En pause',
  todo: 'À faire',
  in_progress: 'En cours',
  review: 'Révision'
}

const priorityLabels: Record<string, string> = {
  low: 'Faible',
  medium: 'Moyenne',
  high: 'Élevée',
  urgent: 'Urgente'
}

export function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  const loadAnalytics = async () => {
    try {
      const analyticsData = await analyticsApi.getProjectStats()
      setData(analyticsData)
    } catch (error) {
      console.error('Erreur lors du chargement des analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAnalytics()
  }, [])

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-500">
          Erreur lors du chargement des données analytiques
        </div>
      </div>
    )
  }

  const projectsData = Object.entries(data.projectsByStatus).map(([status, count]) => ({
    name: statusLabels[status] || status,
    value: count,
    status
  }))

  const tasksData = Object.entries(data.tasksByStatus).map(([status, count]) => ({
    name: statusLabels[status] || status,
    value: count,
    status
  }))

  const priorityData = Object.entries(data.tasksByPriority).map(([priority, count]) => ({
    name: priorityLabels[priority] || priority,
    value: count,
    priority
  }))

  const totalProjects = Object.values(data.projectsByStatus).reduce((sum, count) => sum + count, 0)
  const totalTasks = Object.values(data.tasksByStatus).reduce((sum, count) => sum + count, 0)
  const completedTasks = data.tasksByStatus.completed || 0
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics & KPIs</h1>
          <p className="text-gray-600 mt-1">Tableau de bord des performances et indicateurs clés</p>
        </div>
      </div>

      {/* KPIs principaux */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projets Totaux</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProjects}</div>
            <p className="text-xs text-muted-foreground">
              {data.projectsByStatus.active || 0} actifs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux de Completion</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completionRate.toFixed(1)}%</div>
            <Progress value={completionRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Efficacité Temps</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.efficiency.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {data.totalActualHours}h / {data.totalEstimatedHours}h
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tâches Actives</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.tasksByStatus.in_progress || 0}</div>
            <p className="text-xs text-muted-foreground">
              {totalTasks} au total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques détaillés */}
      <Tabs defaultValue="projects" className="space-y-4">
        <TabsList>
          <TabsTrigger value="projects">Projets</TabsTrigger>
          <TabsTrigger value="tasks">Tâches</TabsTrigger>
          <TabsTrigger value="priority">Priorités</TabsTrigger>
          <TabsTrigger value="time">Temps</TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Répartition des Projets par Statut</CardTitle>
                <CardDescription>Distribution des projets selon leur état d'avancement</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={projectsData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {projectsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Détail des Statuts</CardTitle>
                <CardDescription>Nombre de projets par catégorie</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {projectsData.map((item, index) => (
                    <div key={item.status} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="text-sm font-medium">{item.name}</span>
                      </div>
                      <Badge variant="secondary">{item.value}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Répartition des Tâches</CardTitle>
              <CardDescription>Distribution des tâches par statut d'avancement</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={tasksData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#6366F1" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="priority" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Répartition par Priorité</CardTitle>
              <CardDescription>Distribution des tâches selon leur niveau de priorité</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={priorityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#F59E0B" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="time" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Gestion du Temps</CardTitle>
                <CardDescription>Comparaison temps estimé vs temps réel</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm">
                      <span>Temps Estimé</span>
                      <span>{data.totalEstimatedHours}h</span>
                    </div>
                    <Progress value={100} className="mt-1" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm">
                      <span>Temps Réel</span>
                      <span>{data.totalActualHours}h</span>
                    </div>
                    <Progress 
                      value={data.totalEstimatedHours > 0 ? (data.totalActualHours / data.totalEstimatedHours) * 100 : 0} 
                      className="mt-1" 
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Indicateurs de Performance</CardTitle>
                <CardDescription>Métriques clés de productivité</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Efficacité Globale</span>
                    <div className="flex items-center space-x-2">
                      {data.efficiency > 100 ? (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      ) : (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      )}
                      <span className="text-sm font-bold">{data.efficiency.toFixed(1)}%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Taux de Completion</span>
                    <span className="text-sm font-bold">{completionRate.toFixed(1)}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Projets Actifs</span>
                    <span className="text-sm font-bold">{data.projectsByStatus.active || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}