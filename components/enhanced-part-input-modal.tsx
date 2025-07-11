"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface QuestionType {
  id: string;
  name: string;
  questionCount: number;
  score: number;
}

interface EnhancedPartInputModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  skill: {
    id: string;
    name: string;
    parts: string[];
    questionTypes?: string[];
  };
  partIndex: number;
  onSave: (partData: {
    partNumber: number;
    score: number;
    date: string;
    questionTypes: QuestionType[];
  }) => void;
}

export default function EnhancedPartInputModal({
  open,
  onOpenChange,
  skill,
  partIndex,
  onSave,
}: EnhancedPartInputModalProps) {
  const [testDate, setTestDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [questionTypes, setQuestionTypes] = useState<QuestionType[]>([]);
  const [newQuestionTypeName, setNewQuestionTypeName] = useState("");

  const addQuestionType = () => {
    if (newQuestionTypeName.trim()) {
      const newId = (questionTypes.length + 1).toString();
      setQuestionTypes([
        ...questionTypes,
        {
          id: newId,
          name: newQuestionTypeName.trim(),
          questionCount: 0,
          score: 0,
        },
      ]);
      setNewQuestionTypeName("");
    }
  };

  const removeQuestionType = (id: string) => {
    setQuestionTypes(questionTypes.filter((qt) => qt.id !== id));
  };

  const updateQuestionType = (
    id: string,
    field: keyof QuestionType,
    value: string | number
  ) => {
    setQuestionTypes(
      questionTypes.map((qt) => (qt.id === id ? { ...qt, [field]: value } : qt))
    );
  };

  const calculateWeightedAverage = (): number => {
    const totalQuestions = questionTypes.reduce(
      (sum, qt) => sum + qt.questionCount,
      0
    );
    if (totalQuestions === 0) return 0;

    const weightedSum = questionTypes.reduce(
      (sum, qt) => sum + qt.score * qt.questionCount,
      0
    );

    return weightedSum / totalQuestions;
  };

  const handleSave = () => {
    const finalScore = calculateWeightedAverage();
    const partData = {
      partNumber: partIndex + 1,
      score: finalScore,
      date: testDate,
      questionTypes: questionTypes,
    };
    onSave(partData);

    // Reset form
    setTestDate(new Date().toISOString().split("T")[0]);
    setQuestionTypes([]);
    setNewQuestionTypeName("");
  };

  const isValid =
    testDate &&
    questionTypes.some((qt) => qt.questionCount > 0 && qt.score > 0);
  const finalScore = calculateWeightedAverage();
  const partName = skill.parts[partIndex] || `Part ${partIndex + 1}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
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
            <Input
              id="test-date"
              type="date"
              value={testDate}
              onChange={(e) => setTestDate(e.target.value)}
            />
          </div>

          {/* Question Types */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-lg font-semibold">Question Types</Label>
              <Badge variant="outline" className="text-sm">
                Final Score: {finalScore.toFixed(1)}/9.0
              </Badge>
            </div>

            {questionTypes.length === 0 && (
              <Card className="border-dashed border-muted-foreground/50">
                <CardContent className="pt-6 text-center">
                  <div className="text-muted-foreground">
                    No question types added yet. Add your first question type
                    below to get started.
                  </div>
                </CardContent>
              </Card>
            )}

            {questionTypes.map((qt, index) => (
              <Card key={qt.id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{qt.name}</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeQuestionType(qt.id)}
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label
                        htmlFor={`questions-${qt.id}`}
                        className="text-sm font-medium"
                      >
                        Number of Questions
                      </Label>
                      <Input
                        id={`questions-${qt.id}`}
                        type="number"
                        min="0"
                        max="50"
                        value={qt.questionCount || ""}
                        onChange={(e) =>
                          updateQuestionType(
                            qt.id,
                            "questionCount",
                            parseInt(e.target.value) || 0
                          )
                        }
                        placeholder="0"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor={`score-${qt.id}`}
                        className="text-sm font-medium"
                      >
                        Score (0-9)
                      </Label>
                      <Input
                        id={`score-${qt.id}`}
                        type="number"
                        min="0"
                        max="9"
                        step="0.1"
                        value={qt.score || ""}
                        onChange={(e) =>
                          updateQuestionType(
                            qt.id,
                            "score",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        placeholder="0.0"
                        className="mt-1"
                      />
                    </div>
                  </div>
                  {qt.questionCount > 0 && qt.score > 0 && (
                    <div className="mt-3 p-2 bg-muted rounded text-sm">
                      <div className="text-muted-foreground">
                        Contribution to final score:
                      </div>
                      <div className="font-semibold">
                        {qt.questionCount} questions × {qt.score.toFixed(1)} ={" "}
                        {(qt.questionCount * qt.score).toFixed(1)} points
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {/* Add New Question Type */}
            <Card className="border-dashed">
              <CardContent className="pt-6">
                {/* Predefined Question Types (if available) */}
                {skill.questionTypes && skill.questionTypes.length > 0 && (
                  <div className="mb-4">
                    <Label className="text-sm font-medium mb-2 block">
                      Quick Add - Common Question Types
                    </Label>
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {skill.questionTypes.map((questionType) => (
                        <Button
                          key={questionType}
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newId = (questionTypes.length + 1).toString();
                            setQuestionTypes([
                              ...questionTypes,
                              {
                                id: newId,
                                name: questionType,
                                questionCount: 0,
                                score: 0,
                              },
                            ]);
                          }}
                          disabled={questionTypes.some(
                            (qt) => qt.name === questionType
                          )}
                          className="justify-start text-xs h-8"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          {questionType}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Manual Entry */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Add Custom Question Type
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter custom question type name..."
                      value={newQuestionTypeName}
                      onChange={(e) => setNewQuestionTypeName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addQuestionType()}
                    />
                    <Button
                      onClick={addQuestionType}
                      disabled={!newQuestionTypeName.trim()}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Final Score Summary */}
          {finalScore > 0 && (
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-sm text-muted-foreground mb-2">
                    Final Weighted Average Score
                  </div>
                  <div className="text-3xl font-bold text-primary">
                    {finalScore.toFixed(1)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Based on{" "}
                    {questionTypes.reduce(
                      (sum, qt) => sum + qt.questionCount,
                      0
                    )}{" "}
                    total questions
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!isValid} className="flex-1">
              Save Score
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
