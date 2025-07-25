import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Users, Clock, CheckSquare, FolderKanban } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface StatCardProps {
  title: string
  value: string
  change: string
  trend: 'up' | 'down'
  icon: React.ComponentType<{ className?: string }>
  index: number
}

function StatCard({ title, value, change, trend, icon: Icon, index }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="relative overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <div className="p-2 bg-primary/10 rounded-lg">
            <Icon className="h-4 w-4 text-primary" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value}</div>
          <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-1">
            {trend === 'up' ? (
              <TrendingUp className="h-3 w-3 text-green-500" />
            ) : (
              <TrendingDown className="h-3 w-3 text-red-500" />
            )}
            <span className={trend === 'up' ? 'text-green-500' : 'text-red-500'}>
              {change}
            </span>
            <span>vs mois dernier</span>
          </div>
        </CardContent>
        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-primary/5 to-accent/5 rounded-full -translate-y-10 translate-x-10" />
      </Card>
    </motion.div>
  )
}

export function DashboardStats() {
  const stats = [
    {
      title: 'Projets Actifs',
      value: '12',
      change: '+2.5%',
      trend: 'up' as const,
      icon: FolderKanban
    },
    {
      title: 'Tâches Complétées',
      value: '248',
      change: '+12.3%',
      trend: 'up' as const,
      icon: CheckSquare
    },
    {
      title: 'Membres Équipe',
      value: '24',
      change: '+4.1%',
      trend: 'up' as const,
      icon: Users
    },
    {
      title: 'Heures Travaillées',
      value: '1,247h',
      change: '-2.1%',
      trend: 'down' as const,
      icon: Clock
    }
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <StatCard key={stat.title} {...stat} index={index} />
      ))}
    </div>
  )
}