import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart3,
  Calendar,
  FolderKanban,
  Home,
  MessageSquare,
  Settings,
  Users,
  CheckSquare,
  Clock,
  TrendingUp
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface SidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home, badge: null },
  { id: 'projects', label: 'Projets', icon: FolderKanban, badge: '12' },
  { id: 'tasks', label: 'Tâches', icon: CheckSquare, badge: '24' },
  { id: 'teams', label: 'Équipes', icon: Users, badge: null },
  { id: 'calendar', label: 'Calendrier', icon: Calendar, badge: null },
  { id: 'time', label: 'Temps', icon: Clock, badge: null },
  { id: 'chat', label: 'Messages', icon: MessageSquare, badge: '3' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, badge: null },
  { id: 'settings', label: 'Paramètres', icon: Settings, badge: null }
]

export function AppSidebar({ activeTab, onTabChange }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <motion.div
      initial={{ x: -280 }}
      animate={{ x: 0 }}
      className={cn(
        'fixed left-0 top-0 z-40 h-screen bg-white border-r border-border transition-all duration-300',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center space-x-2"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-lg">ProjectFlow</h1>
              <p className="text-xs text-muted-foreground">Pro</p>
            </div>
          </motion.div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-8 w-8 p-0"
        >
          <motion.div
            animate={{ rotate: isCollapsed ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <TrendingUp className="w-4 h-4" />
          </motion.div>
        </Button>
      </div>

      {/* Navigation */}
      <nav className="p-2 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id
          
          return (
            <motion.div
              key={item.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                variant={isActive ? 'default' : 'ghost'}
                className={cn(
                  'w-full justify-start h-10 relative',
                  isCollapsed && 'justify-center px-2',
                  isActive && 'bg-primary text-primary-foreground shadow-sm'
                )}
                onClick={() => onTabChange(item.id)}
              >
                <Icon className={cn('w-4 h-4', !isCollapsed && 'mr-3')} />
                {!isCollapsed && (
                  <>
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.badge && (
                      <Badge
                        variant={isActive ? 'secondary' : 'default'}
                        className="ml-auto h-5 px-2 text-xs"
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </>
                )}
              </Button>
            </motion.div>
          )
        })}
      </nav>

      {/* User Profile */}
      <div className="absolute bottom-4 left-2 right-2">
        <div className={cn(
          'flex items-center space-x-3 p-3 rounded-lg bg-muted/50',
          isCollapsed && 'justify-center'
        )}>
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">U</span>
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">Utilisateur</p>
              <p className="text-xs text-muted-foreground truncate">user@example.com</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}