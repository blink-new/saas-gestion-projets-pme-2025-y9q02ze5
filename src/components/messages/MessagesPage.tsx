import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Textarea } from '../ui/textarea'
import { Badge } from '../ui/badge'
import { Avatar, AvatarFallback } from '../ui/avatar'
import { Send, MessageSquare, Users } from 'lucide-react'
import { messagesApi, projectsApi } from '../../services/supabaseApi'
import type { Message, Project } from '../../types'

export function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<string>('')
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)

  const loadProjects = async () => {
    try {
      const projectsData = await projectsApi.getAll()
      setProjects(projectsData)
      if (projectsData.length > 0) {
        setSelectedProject(projectsData[0].id)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des projets:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadMessages = async (projectId: string) => {
    try {
      const messagesData = await messagesApi.getByProject(projectId)
      setMessages(messagesData)
    } catch (error) {
      console.error('Erreur lors du chargement des messages:', error)
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedProject) return

    try {
      const message = await messagesApi.create({
        project_id: selectedProject,
        user_id: 'current-user', // À remplacer par l'ID utilisateur réel
        content: newMessage
      })
      setMessages(prev => [...prev, message])
      setNewMessage('')
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error)
    }
  }

  useEffect(() => {
    loadProjects()
  }, [])

  useEffect(() => {
    if (selectedProject) {
      loadMessages(selectedProject)
    }
  }, [selectedProject])

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  const selectedProjectData = projects.find(p => p.id === selectedProject)

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
          <p className="text-gray-600 mt-1">Communication d'équipe par projet</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar - Liste des projets */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Projets</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {projects.map((project) => (
                <Button
                  key={project.id}
                  variant={selectedProject === project.id ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setSelectedProject(project.id)}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  <span className="truncate">{project.name}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Zone de chat principale */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5" />
                <span>{selectedProjectData?.name || 'Sélectionner un projet'}</span>
              </div>
              {selectedProjectData && (
                <Badge variant="secondary">{selectedProjectData.status}</Badge>
              )}
            </CardTitle>
            {selectedProjectData && (
              <CardDescription>{selectedProjectData.description}</CardDescription>
            )}
          </CardHeader>
          <CardContent>
            {selectedProject ? (
              <div className="space-y-4">
                {/* Zone des messages */}
                <div className="h-96 overflow-y-auto border rounded-lg p-4 space-y-4 bg-gray-50">
                  {messages.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>Aucun message pour ce projet</p>
                      <p className="text-sm">Commencez la conversation !</p>
                    </div>
                  ) : (
                    messages.map((message) => (
                      <div key={message.id} className="flex items-start space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {message.user_id?.substring(0, 2).toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="bg-white rounded-lg p-3 shadow-sm">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium text-gray-900">
                                Utilisateur {message.user_id?.substring(0, 8)}
                              </span>
                              <span className="text-xs text-gray-500">
                                {new Date(message.created_at).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700">{message.content}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Zone de saisie */}
                <div className="flex space-x-2">
                  <Textarea
                    placeholder="Tapez votre message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1 min-h-[60px]"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage()
                      }
                    }}
                  />
                  <Button 
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="self-end"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-12">
                <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p>Sélectionnez un projet pour voir les messages</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}