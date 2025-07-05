"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"

interface MultiUserChartProps {
  allUsersData: any
  skillId: string
  selectedPart: number | null
  partNames: string[]
  skillName: string
}

export default function MultiUserChart({
  allUsersData,
  skillId,
  selectedPart,
  partNames,
  skillName,
}: MultiUserChartProps) {
  const chartData = Object.entries(allUsersData)
    .map(([username, userData]: [string, any]) => {
      const skillData = userData[skillId]
      if (skillData.length === 0) return { user: username.replace("_", " "), score: 0 }

      const latestEntry = skillData[skillData.length - 1]

      let score = 0
      if (selectedPart === null) {
        // Overall average
        score = latestEntry.parts.reduce((sum: number, part: any) => sum + part.score, 0) / latestEntry.parts.length
      } else {
        // Specific part
        score = latestEntry.parts[selectedPart]?.score || 0
      }

      return {
        user: username.replace("_", " "),
        score: score,
      }
    })
    .sort((a, b) => b.score - a.score)

  const chartTitle =
    selectedPart === null
      ? `${skillName} - User Comparison (Overall)`
      : `${skillName} - User Comparison (${partNames[selectedPart]})`

  return (
    <Card>
      <CardHeader>
        <CardTitle>{chartTitle}</CardTitle>
        <CardDescription>Compare latest scores across all users</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            score: {
              label: "Score",
              color: "hsl(var(--chart-2))",
            },
          }}
          className="h-[400px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="user" />
              <YAxis domain={[0, 9]} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="score" fill="var(--color-score)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
