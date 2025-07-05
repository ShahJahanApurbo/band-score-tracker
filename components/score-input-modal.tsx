"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ScoreInputModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  skill: {
    id: string
    name: string
    parts: string[]
  }
  onSave: (scores: { parts: { name: string; score: number }[]; date: string }) => void
}

export default function ScoreInputModal({ open, onOpenChange, skill, onSave }: ScoreInputModalProps) {
  const [scores, setScores] = useState<number[]>(new Array(skill.parts.length).fill(0))

  const handleScoreChange = (index: number, value: string) => {
    const newScores = [...scores]
    newScores[index] = Math.max(0, Math.min(9, Number.parseFloat(value) || 0))
    setScores(newScores)
  }

  const handleSave = () => {
    const scoreData = {
      parts: skill.parts.map((part, index) => ({
        name: part,
        score: scores[index],
      })),
      date: new Date().toISOString().split("T")[0],
    }
    onSave(scoreData)
    setScores(new Array(skill.parts.length).fill(0))
  }

  const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add {skill.name} Scores</DialogTitle>
          <DialogDescription>Enter your scores for each part (0-9 scale)</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {skill.parts.map((part, index) => (
            <div key={index} className="space-y-2">
              <Label htmlFor={`score-${index}`}>{part}</Label>
              <Input
                id={`score-${index}`}
                type="number"
                min="0"
                max="9"
                step="0.1"
                value={scores[index]}
                onChange={(e) => handleScoreChange(index, e.target.value)}
                placeholder="0.0"
              />
            </div>
          ))}

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Average Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{averageScore.toFixed(1)}</div>
            </CardContent>
          </Card>

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSave} className="flex-1">
              Save Scores
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
