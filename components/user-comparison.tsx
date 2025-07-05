"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from "recharts"

interface UserComparisonProps {
  allUsersData: any
  skills: any[]
}

export default function UserComparison({ allUsersData, skills }: UserComparisonProps) {
  const chartData = skills.map((skill) => {
    const skillData: any = { skill: skill.name }

    Object.entries(allUsersData).forEach(([username, userData]: [string, any]) => {
      const userSkillData = userData[skill.id]
      if (userSkillData.length > 0) {
        const latestEntry = userSkillData[userSkillData.length - 1]
        const avgScore =
          latestEntry.parts.reduce((sum: number, part: any) => sum + part.score, 0) / latestEntry.parts.length
        skillData[username.replace("_", " ")] = avgScore
      } else {
        skillData[username.replace("_", " ")] = 0
      }
    })

    return skillData
  })

  const users = Object.keys(allUsersData).map((u) => u.replace("_", " "))
  const colors = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))"]

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Performance Comparison</CardTitle>
        <CardDescription>Compare average scores across all skills and users</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={users.reduce(
            (acc, user, index) => ({
              ...acc,
              [user]: {
                label: user,
                color: colors[index % colors.length],
              },
            }),
            {},
          )}
          className="h-[400px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="skill" />
              <YAxis domain={[0, 9]} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              {users.map((user, index) => (
                <Bar key={user} dataKey={user} fill={colors[index % colors.length]} radius={[2, 2, 0, 0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
