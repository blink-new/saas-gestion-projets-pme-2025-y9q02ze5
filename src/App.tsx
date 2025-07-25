import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AppSidebar } from './components/layout/AppSidebar'
import { Dashboard } from './components/dashboard/Dashboard'
import { ProjectsPage } from './components/projects/ProjectsPage'
import { ProjectDetailPage } from './components/projects/ProjectDetailPage'
import { TasksPage } from './components/tasks/TasksPage'
import { TeamsPage } from './components/teams/TeamsPage'
import { AnalyticsPage } from './components/analytics/AnalyticsPage'
import { MessagesPage } from './components/messages/MessagesPage'
import { TimePage } from './components/time/TimePage'
import { SettingsPage } from './components/settings/SettingsPage'
import { Toaster } from './components/ui/toaster'

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <Router>
      <div className="flex h-screen bg-gray-50">
        <AppSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className={`flex-1 transition-all duration-300 overflow-auto ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/projects/:id" element={<ProjectDetailPage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/teams" element={<TeamsPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/messages" element={<MessagesPage />} />
            <Route path="/time" element={<TimePage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </main>
      </div>
      <Toaster />
    </Router>
  )
}

export default App