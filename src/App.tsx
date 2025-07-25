import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { blink } from './blink/client'
import { AppSidebar } from './components/layout/AppSidebar'
import { Dashboard } from './components/dashboard/Dashboard'
import { ProjectsPage } from './components/projects/ProjectsPage'
import { TasksPage } from './components/tasks/TasksPage'
import { TeamsPage } from './components/teams/TeamsPage'
import { Toaster } from './components/ui/toaster'
import { Loader2 } from 'lucide-react'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('dashboard')

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setLoading(state.isLoading)
    })
    return unsubscribe
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mx-auto">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">ProjectFlow Pro</h2>
            <p className="text-muted-foreground">Chargement de votre espace de travail...</p>
          </div>
        </motion.div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-6 max-w-md mx-auto p-8"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mx-auto">
            <span className="text-white text-2xl font-bold">PF</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold mb-2">ProjectFlow Pro</h1>
            <p className="text-muted-foreground text-lg">
              Plateforme SaaS de gestion de projets collaboratifs pour PME
            </p>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-card p-4 rounded-lg border">
                <div className="font-semibold text-primary">12+</div>
                <div className="text-muted-foreground">Projets Actifs</div>
              </div>
              <div className="bg-card p-4 rounded-lg border">
                <div className="font-semibold text-accent">24+</div>
                <div className="text-muted-foreground">Membres Équipe</div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Connectez-vous pour accéder à votre espace de travail
            </p>
          </div>
        </motion.div>
      </div>
    )
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />
      case 'projects':
        return <ProjectsPage />
      case 'tasks':
        return <TasksPage />
      case 'teams':
        return <TeamsPage />
      case 'analytics':
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold">Analytics</h1>
            <p className="text-muted-foreground">Analyses et rapports - En développement</p>
          </div>
        )
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="ml-64 min-h-screen">
        <div className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <Toaster />
    </div>
  )
}

export default App