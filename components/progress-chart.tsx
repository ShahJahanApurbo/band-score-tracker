"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Bar, BarChart } from "recharts"

interface ProgressChartProps {
  data: any[]
  selectedPart: number | null
  partNames: string[]
  skillName: string
  loading?: boolean
  showAllParts?: boolean
}

export default function ProgressChart({
  data,
  selectedPart,
  partNames,
  skillName,
  loading = false,
  showAllParts = false,
}: ProgressChartProps) {
  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-[400px]">
          <div>Loading chart data...</div>
        </CardContent>
      </Card>
    )
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{skillName} Progress</CardTitle>
          <CardDescription>No test data available yet</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <div className="text-center text-muted-foreground">
            <p>No scores recorded yet.</p>
            <p className="text-sm">Add your first part score to see progress charts!</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (showAllParts) {
    // Show average scores for each part across all tests
    const chartData = partNames.map((partName, index) => {
      const partScores = data
        .map((test) => test.parts[index]?.score)
        .filter((score) => score !== null && score !== undefined)

      const avgScore = partScores.length > 0 ? partScores.reduce((sum, score) => sum + score, 0) / partScores.length : 0

      return {
        part: `Part ${index + 1}`,
        score: avgScore,
        name: partName,
        count: partScores.length,
      }
    })

    return (
      <Card>
        <CardHeader>
          <CardTitle>{skillName} - Parts Comparison</CardTitle>
          <CardDescription>Average scores by part across all your tests</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={partNames.reduce(
              (acc, _, index) => ({
                ...acc,
                [`part${index + 1}`]: {
                  label: `Part ${index + 1}`,
                  color: `hsl(var(--chart-${(index % 5) + 1}))`,
                },
              }),
              {},
            )}
            className="h-[400px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="part" />
                <YAxis domain={[0, 9]} />
                <ChartTooltip
                  content={<ChartTooltipContent />}
                  formatter={(value, name, props) => [
                    `${Number(value).toFixed(1)} (${props.payload.count} tests)`,
                    props.payload.name,
                  ]}
                />
                <Bar dataKey="score" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    )
  }

  // Progress over time chart
  const chartData = data
    .map((entry, index) => {
      const result: any = {
        test: entry.date,
        date: entry.date,
      }

      if (selectedPart === null) {
        // Overall average (only count parts that have scores)
        const validParts = entry.parts.filter((part: any) => part.score !== null && part.score !== undefined)
        const average =
          validParts.length > 0
            ? validParts.reduce((sum: number, part: any) => sum + part.score, 0) / validParts.length
            : null
        result.score = average
      } else {
        // Specific part
        result.score = entry.parts[selectedPart]?.score || null
      }

      return result
    })
    .filter((entry) => entry.score !== null) // Only show entries with valid scores

  if (chartData.length === 0) {
    const partName = selectedPart !== null ? partNames[selectedPart] : "any part"
    return (
      <Card>
        <CardHeader>
          <CardTitle>{skillName} Progress</CardTitle>
          <CardDescription>No data available for the selected view</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <div className="text-center text-muted-foreground">
            <p>No scores recorded for {partName} yet.</p>
            <p className="text-sm">Add some scores to see your progress!</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const chartTitle =
    selectedPart === null ? `${skillName} - Overall Progress` : `${skillName} - Part ${selectedPart + 1} Progress`

  const chartDescription =
    selectedPart === null
      ? "Average score across completed parts over time"
      : `${partNames[selectedPart]} progress over time`

  return (
    <Card>
      <CardHeader>
        <CardTitle>{chartTitle}</CardTitle>
        <CardDescription>{chartDescription}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            score: {
              label: "Score",
              color: "hsl(var(--chart-1))",
            },
          }}
          className="h-[400px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="test" />
              <YAxis domain={[0, 9]} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                type="monotone"
                dataKey="score"
                stroke="var(--color-score)"
                strokeWidth={3}
                dot={{ fill: "var(--color-score)", strokeWidth: 2, r: 6 }}
                connectNulls={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
