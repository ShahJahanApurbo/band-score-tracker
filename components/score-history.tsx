"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Edit2, Trash2, Calendar, TrendingUp, Award } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface ScoreHistoryProps {
  skillData: any[];
  skill: {
    id: string;
    name: string;
    parts: string[];
  };
  onDataUpdate: () => void;
  userId: string;
}

export default function ScoreHistory({
  skillData,
  skill,
  onDataUpdate,
  userId,
}: ScoreHistoryProps) {
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    testDate?: string;
    testData?: any;
  }>({
    open: false,
  });
  const [editDialog, setEditDialog] = useState<{
    open: boolean;
    testData?: any;
  }>({ open: false });
  const [editScores, setEditScores] = useState<number[]>([]);
  const [editDate, setEditDate] = useState("");
  const { toast } = useToast();

  const handleDeleteTest = async () => {
    if (!deleteDialog.testDate) return;

    try {
      const { error } = await supabase
        .from("part_scores")
        .delete()
        .eq("user_id", userId)
        .eq("skill", skill.id)
        .eq("test_date", deleteDialog.testDate);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Test scores deleted successfully!",
      });

      onDataUpdate();
      setDeleteDialog({ open: false });
    } catch (error) {
      console.error("Error deleting test:", error);
      toast({
        title: "Error",
        description: "Failed to delete test scores",
        variant: "destructive",
      });
    }
  };

  const handleEditTest = (testData: any) => {
    setEditDialog({ open: true, testData });
    setEditScores(testData.parts.map((part: any) => part.score || 0));
    setEditDate(testData.date);
  };

  const handleSaveEdit = async () => {
    if (!editDialog.testData) return;

    try {
      // Delete existing scores for this test date
      await supabase
        .from("part_scores")
        .delete()
        .eq("user_id", userId)
        .eq("skill", skill.id)
        .eq("test_date", editDialog.testData.date);

      // Insert updated scores
      const scoresToInsert = editScores.map((score, index) => ({
        user_id: userId,
        skill: skill.id,
        part_number: index + 1,
        score: score,
        test_date: editDate,
      }));

      const { error } = await supabase
        .from("part_scores")
        .insert(scoresToInsert);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Test scores updated successfully!",
      });

      onDataUpdate();
      setEditDialog({ open: false });
    } catch (error) {
      console.error("Error updating test:", error);
      toast({
        title: "Error",
        description: "Failed to update test scores",
        variant: "destructive",
      });
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return "bg-green-500";
    if (score >= 6.5) return "bg-blue-500";
    if (score >= 5.5) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getScoreLevel = (score: number) => {
    if (score >= 8) return "Excellent";
    if (score >= 6.5) return "Good";
    if (score >= 5.5) return "Average";
    return "Needs Work";
  };

  const calculateOverallScore = (parts: any[]) => {
    const validScores = parts
      .filter((part) => part.score !== null)
      .map((part) => part.score);
    if (validScores.length === 0) return 0;
    return (
      validScores.reduce((sum, score) => sum + score, 0) / validScores.length
    );
  };

  if (skillData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Score History
          </CardTitle>
          <CardDescription>
            No previous {skill.name.toLowerCase()} scores found. Add some scores
            to see your progress!
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            {skill.name} Score History
          </CardTitle>
          <CardDescription>
            View, edit, and manage your previous {skill.name.toLowerCase()} test
            scores
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {skillData.map((test, testIndex) => {
              const overallScore = calculateOverallScore(test.parts);
              return (
                <Card key={testIndex} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="font-semibold">
                            {new Date(test.date).toLocaleDateString()}
                          </span>
                        </div>
                        <Badge
                          variant="secondary"
                          className={`text-white ${getScoreColor(
                            overallScore
                          )}`}
                        >
                          <TrendingUp className="h-3 w-3 mr-1" />
                          Overall: {overallScore.toFixed(1)} -{" "}
                          {getScoreLevel(overallScore)}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditTest(test)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setDeleteDialog({
                              open: true,
                              testDate: test.date,
                              testData: test,
                            })
                          }
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                      {test.parts.map((part: any, partIndex: number) => (
                        <div
                          key={partIndex}
                          className="flex flex-col items-center p-3 rounded-lg border bg-muted/30"
                        >
                          <span className="text-sm font-medium mb-1">
                            Part {partIndex + 1}
                          </span>
                          <span className="text-xs text-muted-foreground text-center mb-2">
                            {skill.parts[partIndex]}
                          </span>
                          {part.score !== null ? (
                            <Badge
                              variant="secondary"
                              className={`text-white ${getScoreColor(
                                part.score
                              )}`}
                            >
                              {part.score.toFixed(1)}
                            </Badge>
                          ) : (
                            <Badge variant="outline">Not taken</Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Test Scores</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the test scores from{" "}
              {deleteDialog.testDate
                ? new Date(deleteDialog.testDate).toLocaleDateString()
                : ""}
              ? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTest}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Dialog */}
      <Dialog
        open={editDialog.open}
        onOpenChange={(open) => setEditDialog({ open })}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Test Scores</DialogTitle>
            <DialogDescription>
              Modify the scores for your {skill.name.toLowerCase()} test
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-date">Test Date</Label>
              <Input
                id="edit-date"
                type="date"
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
              />
            </div>
            {skill.parts.map((part, index) => (
              <div key={index}>
                <Label htmlFor={`score-${index}`}>
                  Part {index + 1}: {part}
                </Label>
                <Input
                  id={`score-${index}`}
                  type="number"
                  min="0"
                  max="9"
                  step="0.5"
                  value={editScores[index] || ""}
                  onChange={(e) => {
                    const newScores = [...editScores];
                    newScores[index] = parseFloat(e.target.value) || 0;
                    setEditScores(newScores);
                  }}
                  placeholder="Enter score (0-9)"
                />
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditDialog({ open: false })}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
