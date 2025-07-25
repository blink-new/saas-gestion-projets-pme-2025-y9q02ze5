import { motion } from 'framer-motion'
import { MoreHorizontal, Calendar, Users, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

interface ProjectCardProps {
  project: {
    id: string
    name: string
    progress: number
    status: string
    priority: string
    dueDate: string
    teamSize: number
  }
  index: number
}

function ProjectCard({ project, index }: ProjectCardProps) {
  const priorityColors = {
    low: 'bg-blue-100 text-blue-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800'
  }

  const statusColors = {
    active: 'bg-green-100 text-green-800',
    'on-hold': 'bg-gray-100 text-gray-800',
    completed: 'bg-blue-100 text-blue-800'
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <div className="space-y-1">
            <CardTitle className="text-base font-semibold">{project.name}</CardTitle>
            <div className="flex items-center space-x-2">
              <Badge className={priorityColors[project.priority as keyof typeof priorityColors]}>
                {project.priority}
              </Badge>
              <Badge className={statusColors[project.status as keyof typeof statusColors]}>
                {project.status}
              </Badge>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progression</span>
              <span className="font-medium">{project.progress}%</span>
            </div>
            <Progress value={project.progress} className="h-2" />
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-1 text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>{project.dueDate}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Users className="h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground">{project.teamSize}</span>
              <div className="flex -space-x-1 ml-1">
                {Array.from({ length: Math.min(project.teamSize, 3) }).map((_, i) => (
                  <Avatar key={i} className="h-6 w-6 border-2 border-background">
                    <AvatarFallback className="text-xs">
                      {String.fromCharCode(65 + i)}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {project.teamSize > 3 && (
                  <div className="h-6 w-6 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                    <span className="text-xs text-muted-foreground">+{project.teamSize - 3}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export function RecentProjects() {
  const projects = [
    {
      id: '1',
      name: 'Refonte Site Web',
      progress: 75,
      status: 'active',
      priority: 'high',
      dueDate: '15 Fév',
      teamSize: 5
    },
    {
      id: '2',
      name: 'App Mobile iOS',
      progress: 45,
      status: 'active',
      priority: 'urgent',
      dueDate: '28 Fév',
      teamSize: 3
    },
    {
      id: '3',
      name: 'Migration Base Données',
      progress: 90,
      status: 'active',
      priority: 'medium',
      dueDate: '10 Fév',
      teamSize: 2
    },
    {
      id: '4',
      name: 'Formation Équipe',
      progress: 30,
      status: 'on-hold',
      priority: 'low',
      dueDate: '20 Mar',
      teamSize: 8
    }
  ]

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">Projets Récents</CardTitle>
        <Button variant="outline" size="sm">
          Voir tout
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {projects.map((project, index) => (
          <ProjectCard key={project.id} project={project} index={index} />
        ))}
      </CardContent>
    </Card>
  )
}