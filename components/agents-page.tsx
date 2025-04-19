"use client"

import React, { useState, useEffect } from "react"
import { Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import AgentEditPanel from "@/components/agent-edit-panel"
import BentoGrid from "@/components/bento-grid"
import "react"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { saveAgentToS3, getAgentFromS3, listUserAgents, deleteAgentFromS3, AgentData } from "@/lib/s3-service"
import { useAuth } from "@clerk/nextjs"

// Helper function to generate a random 16-character string
function generateRandomString(length: number): string {
  const characters = "abcdefghijklmnopqrstuvwxyz0123456789"
  let result = ""
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  return result
}

export default function AgentsPage({
  agentToEdit,
  setAgentToEdit,
}: {
  agentToEdit?: string | null
  setAgentToEdit?: (agent: string | null) => void
}) {
  const { userId } = useAuth()
  const [agents, setAgents] = useState<AgentData[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [currentAgent, setCurrentAgent] = useState<AgentData | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (userId) {
      loadUserAgents()
    }
  }, [userId])

  const loadUserAgents = async () => {
    try {
      setIsLoading(true)
      const agentList = await listUserAgents(userId!)
      const loadedAgents = await Promise.all(
        agentList.map(async (item) => {
          if (!item.agentId) return null
          const agentData = await getAgentFromS3(userId!, item.agentId)
          return { ...agentData, id: item.agentId }
        })
      )
      setAgents(loadedAgents.filter((agent): agent is AgentData => agent !== null))
    } catch (error) {
      console.error("Error loading agents:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleNewAgent = () => {
    const newAgent: AgentData = {
      id: `agent-${generateRandomString(16)}`,
      name: "New Agent",
      description: "Brief description of what this agent does",
      role: "Describe what this agent does... You can use {{client:user_name}} or {{app:company_name}} variables.",
      firstMessage: "Hello! How can I assist you today?",
      avatarId: "avatar-male-01",
      avatarSrc: "/avatars/avatar-male-01.svg",
      status: "Dev",
      language: "vi",
      tone: "Friendly",
      voice: "Allison",
      voiceEnabled: true,
      speed: "medium",
      confidence: "normal",
      motivation: "interested",
      model: "gpt-4o-mini",
      conversationCount: 0,
      tools: [],
      memory: true,
      personality: "Friendly",
      handoffRules: [],
      updatedAt: new Date(),
      version: "0.1",
      ragDatasources: [],
      appVariables: [{ key: "", value: "" }],
      pronunciationDictionaries: [],
      speedValue: 1.0,
      confidenceValue: 50,
      motivationValue: 50,
    }
    setCurrentAgent(newAgent)
    setIsEditing(true)
  }

  const handleEditAgent = (agent: AgentData) => {
    setCurrentAgent(agent)
    setIsEditing(true)
  }

  const handleDuplicateAgent = async (agent: AgentData) => {
    const duplicatedAgent: AgentData = {
      ...agent,
      id: `agent-${generateRandomString(16)}`,
      name: `${agent.name} (Copy)`,
      status: "Dev",
      conversationCount: 0,
      updatedAt: new Date(),
      version: "0.1",
    }
    try {
      await saveAgentToS3(userId!, duplicatedAgent.id, duplicatedAgent)
      setAgents([...agents, duplicatedAgent])
    } catch (error) {
      console.error("Error duplicating agent:", error)
    }
  }

  const handleDeleteAgent = async (agentId: string) => {
    try {
      await deleteAgentFromS3(userId!, agentId)
      setAgents(agents.filter((agent) => agent.id !== agentId))
    } catch (error) {
      console.error("Error deleting agent:", error)
    }
  }

  const handleSaveAgent = async (updatedAgent: AgentData) => {
    try {
      const formattedAgent: AgentData = {
        ...updatedAgent,
        updatedAt: new Date(),
        avatarId: updatedAgent.avatarId,
        avatarSrc: updatedAgent.avatarSrc,
        version: updatedAgent.version || "0.1",
        conversationCount: updatedAgent.conversationCount || 0,
      }

      await saveAgentToS3(userId!, formattedAgent.id, formattedAgent)

      if (agents.some((agent) => agent.id === formattedAgent.id)) {
        setAgents(agents.map((agent) => (agent.id === formattedAgent.id ? formattedAgent : agent)))
      } else {
        setAgents([...agents, formattedAgent])
      }
      setIsEditing(false)
      setCurrentAgent(null)
    } catch (error) {
      console.error("Error saving agent:", error)
    }
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setCurrentAgent(null)
  }

  // Format agents for BentoGrid
  const bentoItems = agents
    .filter(
      (agent) =>
        searchQuery === "" ||
        agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (agent.description && agent.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (agent.role && agent.role.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (agent.personality && agent.personality.toLowerCase().includes(searchQuery.toLowerCase())),
    )
    .map((agent) => ({
      title: agent.name,
      description: agent.description || agent.role.substring(0, 100),
      avatarSrc: agent.avatarSrc,
      status: agent.status,
      language: agent.language,
      tone: agent.personality,
      voice: agent.voice,
      model: agent.model,
      tags: agent.tools,
      conversationCount: agent.conversationCount,
      updatedAt: agent.updatedAt,
      version: agent.version,
      originalData: agent,
    }))

  const handleItemAction = (index: number, action: string) => {
    const agent = agents[index]
    if (action === "edit") {
      handleEditAgent(agent)
    } else if (action === "duplicate") {
      handleDuplicateAgent(agent)
    } else if (action === "delete") {
      handleDeleteAgent(agent.id)
    }
  }

  if (isLoading) {
    return <div className="p-6">Loading agents...</div>
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Agents</h1>
          <p className="text-muted-foreground mt-1 text-sm">Create and manage your voice assistant agents</p>
        </div>
        <Button onClick={handleNewAgent} size="sm" className="gap-2 bg-black hover:bg-black/90 text-white">
          <Plus className="h-4 w-4" />
          New Agent
        </Button>
      </div>

      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search agents..."
            className="pl-8 h-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <BentoGrid
        items={bentoItems}
        onItemClick={(index) => handleEditAgent(agents[index])}
        onItemAction={handleItemAction}
      />

      {isEditing && currentAgent && (
        <Dialog
          open={isEditing}
          onOpenChange={(open) => {
            if (!open) handleCancelEdit()
          }}
        >
          <DialogContent className="max-w-[60vw] w-full h-[95vh] flex flex-col">
            <div className="w-fit sticky top-0 bg-background z-50 flex items-center p-3 border-b border-b-[0.5px]">
              <h2 className="text-base font-medium">Edit Agent</h2>
            </div>
            <div className="flex-1 overflow-y-auto">
              <AgentEditPanel agent={currentAgent} onSave={handleSaveAgent} onCancel={handleCancelEdit} />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
