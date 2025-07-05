"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Plus, TrendingUp, Users } from "lucide-react"
import ProgressChart from "@/components/progress-chart"
import ScoreInputModal from "@/components/score-input-modal"
import MultiUserChart from "@/components/multi-user-chart"

interface SkillDashboardProps {
  skill: {
    id: string
    name: string
    icon: any
    parts: string[]
    color: string
  }
  userData: any
  allUsersData: any
  selectedUser: string
  onBack: () => void
}

export default function SkillDashboard({ skill, userData, allUsersData, selectedUser, onBack }: SkillDashboardProps) {
  const [selectedPart, setSelectedPart] = useState<number | null>(null)
  const [showAddScore, setShowAddScore] = useState(false)

  const skillData = userData[skill.id as keyof typeof userData]
  const Icon = skill.icon

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-3">
            <Icon className="h-8 w-8 text-gray-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{skill.name}</h1>
              <p className="text-gray-600">Track your progress and compare with others</p>
            </div>
          </div>
          <Button className="ml-auto" onClick={() => setShowAddScore(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Score
          </Button>
        </div>

        {/* Parts Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Part</CardTitle>
            <CardDescription>Choose a specific part to view detailed progress</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                variant={selectedPart === null ? "default" : "outline"}
                onClick={() => setSelectedPart(null)}
                className="h-auto p-4 flex flex-col items-start"
              >
                <span className="font-semibold">Overall</span>
                <span className="text-sm text-muted-foreground">All parts combined</span>
              </Button>
              {skill.parts.map((part, index) => {
                const latestScore = skillData.length > 0 ? skillData[skillData.length - 1].parts[index]?.score || 0 : 0
                return (
                  <Button
                    key={index}
                    variant={selectedPart === index ? "default" : "outline"}
                    onClick={() => setSelectedPart(index)}
                    className="h-auto p-4 flex flex-col items-start"
                  >
                    <span className="font-semibold">{part}</span>
                    <Badge variant="secondary" className="mt-1">
                      Latest: {latestScore.toFixed(1)}
                    </Badge>
                  </Button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="progress" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="progress" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Your Progress
            </TabsTrigger>
            <TabsTrigger value="comparison" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Multi-User Comparison
            </TabsTrigger>
          </TabsList>

          <TabsContent value="progress">
            <ProgressChart
              data={skillData}
              selectedPart={selectedPart}
              partNames={skill.parts}
              skillName={skill.name}
            />
          </TabsContent>

          <TabsContent value="comparison">
            <MultiUserChart
              allUsersData={allUsersData}
              skillId={skill.id}
              selectedPart={selectedPart}
              partNames={skill.parts}
              skillName={skill.name}
            />
          </TabsContent>
        </Tabs>

        <ScoreInputModal
          open={showAddScore}
          onOpenChange={setShowAddScore}
          skill={skill}
          onSave={(scores) => {
            // In a real app, this would save to a database
            console.log("Saving scores:", scores)
            setShowAddScore(false)
          }}
        />
      </div>
    </div>
  )
}
