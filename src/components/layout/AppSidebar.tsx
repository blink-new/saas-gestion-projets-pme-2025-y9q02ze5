import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
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
  TrendingUp,
  Menu,
  X
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/dashboard', badge: null },
  { id: 'projects', label: 'Projets', icon: FolderKanban, path: '/projects', badge: '4' },
  { id: 'tasks', label: 'Tâches', icon: CheckSquare, path: '/tasks', badge: '12' },
  { id: 'teams', label: 'Équipes', icon: Users, path: '/teams', badge: '3' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, path: '/analytics', badge: null },
  { id: 'messages', label: 'Messages', icon: MessageSquare, path: '/messages', badge: '2' },
  { id: 'time', label: 'Temps', icon: Clock, path: '/time', badge: null },
  { id: 'settings', label: 'Paramètres', icon: Settings, path: '/settings', badge: null }
]

export function AppSidebar({ isOpen, onToggle }: SidebarProps) {
  const location = useLocation()

  return (
    <motion.div
      initial={{ x: -280 }}
      animate={{ x: 0 }}
      className={cn(
        'fixed left-0 top-0 z-40 h-screen bg-white border-r border-gray-200 transition-all duration-300 shadow-lg',
        isOpen ? 'w-64' : 'w-16'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center space-x-2"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-amber-500 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-lg text-gray-900">ProjectFlow</h1>
              <p className="text-xs text-gray-500">Pro</p>
            </div>
          </motion.div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="h-8 w-8 p-0 hover:bg-gray-100"
        >
          {isOpen ? (
            <X className="w-4 h-4" />
          ) : (
            <Menu className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="p-2 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path || 
                          (item.path === '/projects' && location.pathname.startsWith('/projects/'))
          
          return (
            <motion.div
              key={item.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link to={item.path}>
                <Button
                  variant={isActive ? 'default' : 'ghost'}
                  className={cn(
                    'w-full justify-start h-10 relative',
                    !isOpen && 'justify-center px-2',
                    isActive && 'bg-indigo-600 text-white shadow-sm hover:bg-indigo-700',
                    !isActive && 'hover:bg-gray-100 text-gray-700'
                  )}
                >
                  <Icon className={cn('w-4 h-4', isOpen && 'mr-3')} />
                  {isOpen && (
                    <>
                      <span className="flex-1 text-left">{item.label}</span>
                      {item.badge && (
                        <Badge
                          variant={isActive ? 'secondary' : 'default'}
                          className="ml-auto h-5 px-2 text-xs bg-amber-100 text-amber-800 hover:bg-amber-200"
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </>
                  )}
                </Button>
              </Link>
            </motion.div>
          )
        })}
      </nav>

      {/* User Profile */}
      <div className="absolute bottom-4 left-2 right-2">
        <div className={cn(
          'flex items-center space-x-3 p-3 rounded-lg bg-gray-50 border',
          !isOpen && 'justify-center'
        )}>
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-amber-500 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">U</span>
          </div>
          {isOpen && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate text-gray-900">Utilisateur Demo</p>
              <p className="text-xs text-gray-500 truncate">demo@projectflow.com</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}