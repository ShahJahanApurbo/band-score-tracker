"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

interface TestInputModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  skill: {
    id: string
    name: string
    parts: string[]
  }
  onSave: (testData: { parts: { name: string; score: number }[]; date: string }) => void
}

export default function TestInputModal({ open, onOpenChange, skill, onSave }: TestInputModalProps) {
  const [scores, setScores] = useState<number[]>(new Array(skill.parts.length).fill(0))
  const [testDate, setTestDate] = useState(new Date().toISOString().split("T")[0])

  const handleScoreChange = (index: number, value: string) => {
    const newScores = [...scores]
    const numValue = Number.parseFloat(value) || 0
    newScores[index] = Math.max(0, Math.min(9, numValue))
    setScores(newScores)
  }

  const handleSave = () => {
    const testData = {
      parts: skill.parts.map((part, index) => ({
        name: part,
        score: scores[index],
      })),
      date: testDate,
    }
    onSave(testData)
    setScores(new Array(skill.parts.length).fill(0))
    setTestDate(new Date().toISOString().split("T")[0])
  }

  const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length
  const isValid = scores.every((score) => score > 0) && testDate

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add {skill.name} Test Scores</DialogTitle>
          <DialogDescription>
            Enter your scores for each part of the {skill.name.toLowerCase()} test (0-9 scale)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Test Date */}
          <div className="space-y-2">
            <Label htmlFor="test-date">Test Date</Label>
            <Input id="test-date" type="date" value={testDate} onChange={(e) => setTestDate(e.target.value)} />
          </div>

          <Separator />

          {/* Individual Part Scores */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Part Scores</h3>
            <div className="grid gap-4">
              {skill.parts.map((part, index) => (
                <Card key={index}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">
                      Part {index + 1}: {part}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <Label htmlFor={`score-${index}`} className="sr-only">
                          Score for {part}
                        </Label>
                        <Input
                          id={`score-${index}`}
                          type="number"
                          min="0"
                          max="9"
                          step="0.1"
                          value={scores[index] || ""}
                          onChange={(e) => handleScoreChange(index, e.target.value)}
                          placeholder="0.0"
                          className="text-lg"
                        />
                      </div>
                      <div className="text-sm text-muted-foreground">/ 9.0</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <Separator />

          {/* Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Test Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Average Score</div>
                  <div className="text-2xl font-bold">{averageScore.toFixed(1)}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Total Parts</div>
                  <div className="text-2xl font-bold">{skill.parts.length}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!isValid} className="flex-1">
              Save Test Scores
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
