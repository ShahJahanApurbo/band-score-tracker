"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, TrendingUp, BarChart3 } from "lucide-react"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import ProgressChart from "@/components/progress-chart"
import PartInputModal from "@/components/part-input-modal"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"
import AuthCard from "@/components/auth-card"

interface SkillPageProps {
  skill: {
    id: string
    name: string
    icon: any
    parts: string[]
    color: string
  }
}

export default function SkillPage({ skill }: SkillPageProps) {
  const [skillData, setSkillData] = useState<any[]>([])
  const [selectedPart, setSelectedPart] = useState<number | null>(null)
  const [showAddPart, setShowAddPart] = useState(false)
  const [selectedPartForInput, setSelectedPartForInput] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const { user, loading: authLoading } = useAuth()

  const Icon = skill.icon

  useEffect(() => {
    if (user) {
      fetchSkillData()
    } else if (!authLoading) {
      setLoading(false)
    }
  }, [user, skill.id, authLoading])

  const fetchSkillData = async () => {
    if (!user) return

    try {
      const { data: scores, error } = await supabase
        .from("part_scores")
        .select("*")
        .eq("user_id", user.id)
        .eq("skill", skill.id)
        .order("test_date", { ascending: true })
        .order("part_number", { ascending: true })

      if (error) throw error

      // Group scores by test date and part
      const groupedData = new Map()

      scores?.forEach((score) => {
        const testKey = score.test_date
        if (!groupedData.has(testKey)) {
          groupedData.set(testKey, {
            date: testKey,
            parts: new Array(skill.parts.length).fill(null).map((_, index) => ({
              name: skill.parts[index],
              score: null,
            })),
          })
        }

        const test = groupedData.get(testKey)
        if (score.part_number <= skill.parts.length) {
          test.parts[score.part_number - 1].score = score.score
        }
      })

      setSkillData(Array.from(groupedData.values()))
    } catch (error) {
      console.error("Error fetching skill data:", error)
      toast({
        title: "Error",
        description: "Failed to load skill data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSavePart = async (partData: any) => {
    if (!user) return

    try {
      const { error } = await supabase.from("part_scores").insert({
        user_id: user.id,
        skill: skill.id,
        part_number: partData.partNumber,
        score: partData.score,
        test_date: partData.date,
      })

      if (error) throw error

      toast({
        title: "Success",
        description: `${skill.parts[partData.partNumber - 1]} score saved successfully!`,
      })

      fetchSkillData()
      setShowAddPart(false)
    } catch (error) {
      console.error("Error saving part:", error)
      toast({
        title: "Error",
        description: "Failed to save part score",
        variant: "destructive",
      })
    }
  }

  if (authLoading || loading) {
    return (
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex items-center gap-2">
            <Icon className="h-5 w-5" />
            <h1 className="text-xl font-semibold">{skill.name}</h1>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="text-center">Loading...</div>
        </div>
      </SidebarInset>
    )
  }

  if (!user) {
    return (
      <SidebarInset>
        <div className="flex flex-1 items-center justify-center p-4">
          <AuthCard />
        </div>
      </SidebarInset>
    )
  }

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5" />
          <h1 className="text-xl font-semibold">{skill.name}</h1>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-6 p-6">
        {/* Individual Parts */}
        <Card>
          <CardHeader>
            <CardTitle>Add Individual Part Scores</CardTitle>
            <CardDescription>Record scores for individual parts as you complete them</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {skill.parts.map((part, index) => {
                const latestScore = skillData.length > 0 ? skillData[skillData.length - 1]?.parts[index]?.score : null

                return (
                  <Button
                    key={index}
                    variant="outline"
                    onClick={() => {
                      setSelectedPartForInput(index)
                      setShowAddPart(true)
                    }}
                    className="h-auto p-4 flex flex-col items-start gap-2"
                  >
                    <div className="flex items-center gap-2 w-full">
                      <Plus className="h-4 w-4" />
                      <span className="font-semibold">Part {index + 1}</span>
                    </div>
                    <span className="text-xs text-muted-foreground text-left">{part}</span>
                    {latestScore !== null && (
                      <Badge variant="secondary" className="text-xs">
                        Latest: {latestScore.toFixed(1)}
                      </Badge>
                    )}
                  </Button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Parts Selection for Chart */}
        <Card>
          <CardHeader>
            <CardTitle>View Progress</CardTitle>
            <CardDescription>Choose a specific part or view overall progress</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button
                variant={selectedPart === null ? "default" : "outline"}
                onClick={() => setSelectedPart(null)}
                className="h-auto p-4 flex flex-col items-start"
              >
                <span className="font-semibold">Overall</span>
                <span className="text-sm text-muted-foreground">All parts</span>
              </Button>
              {skill.parts.map((part, index) => {
                const allScores = skillData.flatMap((test) =>
                  test.parts[index]?.score !== null ? [test.parts[index].score] : [],
                )
                const avgScore =
                  allScores.length > 0 ? allScores.reduce((sum, score) => sum + score, 0) / allScores.length : 0

                return (
                  <Button
                    key={index}
                    variant={selectedPart === index ? "default" : "outline"}
                    onClick={() => setSelectedPart(index)}
                    className="h-auto p-4 flex flex-col items-start"
                  >
                    <span className="font-semibold text-left">Part {index + 1}</span>
                    <span className="text-xs text-muted-foreground text-left mb-1">{part}</span>
                    <Badge variant="secondary" className="text-xs">
                      Avg: {avgScore > 0 ? avgScore.toFixed(1) : "N/A"}
                    </Badge>
                  </Button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Progress Chart */}
        <Tabs defaultValue="progress" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="progress" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Progress Over Time
            </TabsTrigger>
            <TabsTrigger value="comparison" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Part Comparison
            </TabsTrigger>
          </TabsList>

          <TabsContent value="progress">
            <ProgressChart
              data={skillData}
              selectedPart={selectedPart}
              partNames={skill.parts}
              skillName={skill.name}
              loading={loading}
            />
          </TabsContent>

          <TabsContent value="comparison">
            <ProgressChart
              data={skillData}
              selectedPart={null}
              partNames={skill.parts}
              skillName={skill.name}
              loading={loading}
              showAllParts={true}
            />
          </TabsContent>
        </Tabs>

        <PartInputModal
          open={showAddPart}
          onOpenChange={setShowAddPart}
          skill={skill}
          partIndex={selectedPartForInput}
          onSave={handleSavePart}
        />
      </div>
    </SidebarInset>
  )
}
