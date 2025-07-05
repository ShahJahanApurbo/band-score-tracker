"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface PartInputModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  skill: {
    id: string
    name: string
    parts: string[]
  }
  partIndex: number
  onSave: (partData: { partNumber: number; score: number; date: string }) => void
}

export default function PartInputModal({ open, onOpenChange, skill, partIndex, onSave }: PartInputModalProps) {
  const [score, setScore] = useState<number>(0)
  const [testDate, setTestDate] = useState(new Date().toISOString().split("T")[0])

  const handleScoreChange = (value: string) => {
    const numValue = Number.parseFloat(value) || 0
    setScore(Math.max(0, Math.min(9, numValue)))
  }

  const handleSave = () => {
    const partData = {
      partNumber: partIndex + 1,
      score: score,
      date: testDate,
    }
    onSave(partData)
    setScore(0)
    setTestDate(new Date().toISOString().split("T")[0])
  }

  const isValid = score > 0 && testDate

  const partName = skill.parts[partIndex] || `Part ${partIndex + 1}`

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add {skill.name} Score</DialogTitle>
          <DialogDescription>
            Record your score for Part {partIndex + 1}: {partName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Test Date */}
          <div className="space-y-2">
            <Label htmlFor="test-date">Test Date</Label>
            <Input id="test-date" type="date" value={testDate} onChange={(e) => setTestDate(e.target.value)} />
          </div>

          {/* Part Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                Part {partIndex + 1}: {partName}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Label htmlFor="score" className="text-sm font-medium">
                      Score (0-9)
                    </Label>
                    <Input
                      id="score"
                      type="number"
                      min="0"
                      max="9"
                      step="0.1"
                      value={score || ""}
                      onChange={(e) => handleScoreChange(e.target.value)}
                      placeholder="0.0"
                      className="text-lg mt-1"
                    />
                  </div>
                  <div className="text-sm text-muted-foreground pt-6">/ 9.0</div>
                </div>

                {score > 0 && (
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="text-sm text-muted-foreground">Your Score</div>
                    <div className="text-2xl font-bold">{score.toFixed(1)}</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!isValid} className="flex-1">
              Save Score
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
