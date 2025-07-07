"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, TrendingUp, BarChart3, History } from "lucide-react";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import ProgressChart from "@/components/progress-chart";
import EnhancedPartInputModal from "@/components/enhanced-part-input-modal";
import ScoreHistory from "@/components/score-history";
import SkillStats from "@/components/skill-stats";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import AuthCard from "@/components/auth-card";

interface QuestionType {
  id: string;
  name: string;
  questionCount: number;
  score: number;
}

interface EnhancedSkillPageProps {
  skill: {
    id: string;
    name: string;
    icon: any;
    parts: string[];
    color: string;
  };
}

export default function EnhancedSkillPage({ skill }: EnhancedSkillPageProps) {
  const [skillData, setSkillData] = useState<any[]>([]);
  const [selectedPart, setSelectedPart] = useState<number | null>(null);
  const [showAddPart, setShowAddPart] = useState(false);
  const [selectedPartForInput, setSelectedPartForInput] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();

  const Icon = skill.icon;

  useEffect(() => {
    if (user) {
      fetchSkillData();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, skill.id, authLoading]);

  const fetchSkillData = async () => {
    if (!user) return;

    try {
      const { data: scores, error } = await supabase
        .from("part_scores")
        .select("*")
        .eq("user_id", user.id)
        .eq("skill", skill.id)
        .order("test_date", { ascending: true })
        .order("part_number", { ascending: true });

      if (error) throw error;

      // Group scores by test date and part
      const groupedData = new Map();

      scores?.forEach((score) => {
        const testKey = score.test_date;
        if (!groupedData.has(testKey)) {
          groupedData.set(testKey, {
            date: testKey,
            parts: new Array(skill.parts.length).fill(null).map((_, index) => ({
              name: skill.parts[index],
              score: null,
            })),
          });
        }

        const test = groupedData.get(testKey);
        if (score.part_number <= skill.parts.length) {
          test.parts[score.part_number - 1].score = score.score;
        }
      });

      setSkillData(Array.from(groupedData.values()));
    } catch (error) {
      console.error("Error fetching skill data:", error);
      toast({
        title: "Error",
        description: "Failed to load skill data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSavePart = async (partData: {
    partNumber: number;
    score: number;
    date: string;
    questionTypes: QuestionType[];
  }) => {
    if (!user) return;

    try {
      // Save the main score
      const { error: scoreError } = await supabase.from("part_scores").insert({
        user_id: user.id,
        skill: skill.id,
        part_number: partData.partNumber,
        score: partData.score,
        test_date: partData.date,
      });

      if (scoreError) throw scoreError;

      // Save question types details (we'll need to create a new table for this)
      // For now, let's store it as JSON in the existing table or create a new table
      const { error: detailsError } = await supabase
        .from("part_score_details")
        .insert({
          user_id: user.id,
          skill: skill.id,
          part_number: partData.partNumber,
          test_date: partData.date,
          question_types: partData.questionTypes,
          final_score: partData.score,
        });

      // If the details table doesn't exist, we'll ignore this error for now
      if (detailsError && !detailsError.message.includes("does not exist")) {
        console.warn("Could not save question type details:", detailsError);
      }

      toast({
        title: "Success",
        description: `${
          skill.parts[partData.partNumber - 1]
        } score saved successfully! Final score: ${partData.score.toFixed(1)}`,
      });

      fetchSkillData();
      setShowAddPart(false);
    } catch (error) {
      console.error("Error saving part:", error);
      toast({
        title: "Error",
        description: "Failed to save part score",
        variant: "destructive",
      });
    }
  };

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
    );
  }

  if (!user) {
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
          <AuthCard />
        </div>
      </SidebarInset>
    );
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

      <div className="flex flex-1 flex-col gap-4 p-4">
        {/* Quick Add Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add New {skill.name} Score
            </CardTitle>
            <CardDescription>
              Record scores for different question types and get a weighted
              average
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {skill.parts.map((part, index) => (
                <Button
                  key={index}
                  variant="outline"
                  onClick={() => {
                    setSelectedPartForInput(index);
                    setShowAddPart(true);
                  }}
                  className="justify-start"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {part}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">
              <TrendingUp className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="progress">
              <BarChart3 className="h-4 w-4 mr-2" />
              Progress
            </TabsTrigger>
            <TabsTrigger value="history">
              <History className="h-4 w-4 mr-2" />
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <SkillStats skillData={skillData} skill={skill} />
          </TabsContent>

          <TabsContent value="progress" className="space-y-4">
            <ProgressChart
              data={skillData}
              selectedPart={selectedPart}
              partNames={skill.parts}
              skillName={skill.name}
              loading={loading}
            />
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <ScoreHistory
              skillData={skillData}
              skill={skill}
              onDataUpdate={fetchSkillData}
              userId={user?.id || ""}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Enhanced Part Input Modal */}
      <EnhancedPartInputModal
        open={showAddPart}
        onOpenChange={setShowAddPart}
        skill={skill}
        partIndex={selectedPartForInput}
        onSave={handleSavePart}
      />
    </SidebarInset>
  );
}
