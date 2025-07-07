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
import { Plus, TrendingUp, BarChart3, Users, History } from "lucide-react";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import ProgressChart from "@/components/progress-chart";
import MultiUserChart from "@/components/multi-user-chart";
import PartInputModal from "@/components/part-input-modal";
import ScoreHistory from "@/components/score-history";
import SkillStats from "@/components/skill-stats";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import AuthCard from "@/components/auth-card";

interface MultiUserSkillPageProps {
  skill: {
    id: string;
    name: string;
    icon: any;
    parts: string[];
    color: string;
  };
}

export default function MultiUserSkillPage({ skill }: MultiUserSkillPageProps) {
  const [skillData, setSkillData] = useState<any[]>([]);
  const [allUsersData, setAllUsersData] = useState<any>({});
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
      fetchAllUsersData();
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
    }
  };

  const fetchAllUsersData = async () => {
    try {
      // Fetch all users' data from the database
      const { data: allScores, error } = await supabase
        .from("part_scores")
        .select(
          `
          *,
          profiles:user_id (
            username,
            full_name
          )
        `
        )
        .eq("skill", skill.id)
        .order("test_date", { ascending: true })
        .order("part_number", { ascending: true });

      if (error) throw error;

      // Group data by user
      const userDataMap = new Map();

      allScores?.forEach((score) => {
        const userId = score.user_id;
        const username =
          score.profiles?.username ||
          score.profiles?.full_name ||
          `User_${userId.slice(0, 8)}`;

        if (!userDataMap.has(userId)) {
          userDataMap.set(userId, {
            username,
            [skill.id]: [],
          });
        }

        const userData = userDataMap.get(userId);
        let testEntry = userData[skill.id].find(
          (test: any) => test.date === score.test_date
        );

        if (!testEntry) {
          testEntry = {
            date: score.test_date,
            parts: new Array(skill.parts.length).fill(null).map((_, index) => ({
              name: skill.parts[index],
              score: null,
            })),
          };
          userData[skill.id].push(testEntry);
        }

        if (score.part_number <= skill.parts.length) {
          testEntry.parts[score.part_number - 1].score = score.score;
        }
      });

      // Convert to the expected format
      const formattedData: any = {};
      userDataMap.forEach((userData, userId) => {
        const username = userData.username.replace(/\s+/g, "_").toLowerCase();
        formattedData[username] = {
          [skill.id]: userData[skill.id],
        };
      });

      setAllUsersData(formattedData);
    } catch (error) {
      console.error("Error fetching all users data:", error);
      toast({
        title: "Error",
        description: "Failed to load users comparison data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSavePart = async (partData: any) => {
    if (!user) return;

    try {
      const { error } = await supabase.from("part_scores").insert({
        user_id: user.id,
        skill: skill.id,
        part_number: partData.partNumber,
        score: partData.score,
        test_date: partData.date,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: `${
          skill.parts[partData.partNumber - 1]
        } score saved successfully!`,
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
            <Badge
              variant="secondary"
              className="bg-blue-500/10 text-blue-700 dark:text-blue-300"
            >
              <Users className="h-3 w-3 mr-1" />
              Multi-User View
            </Badge>
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
        <div className="flex flex-1 items-center justify-center p-4">
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
          <Badge
            variant="secondary"
            className="bg-blue-500/10 text-blue-700 dark:text-blue-300"
          >
            <Users className="h-3 w-3 mr-1" />
            Multi-User View
          </Badge>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-6 p-6">
        {/* Your Skill Statistics */}
        <SkillStats skillData={skillData} skill={skill} />

        {/* Multi-User Comparison Notice */}
        <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
              <Users className="h-5 w-5" />
              Multi-User Comparison Mode
            </CardTitle>
            <CardDescription>
              This page shows data from all users so everyone can compare their{" "}
              {skill.name.toLowerCase()} scores. You can still add your own
              scores and view your personal progress alongside others.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Individual Parts for Current User */}
        <Card>
          <CardHeader>
            <CardTitle>Add Your {skill.name} Scores</CardTitle>
            <CardDescription>
              Record your individual part scores to compare with other users
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {skill.parts.map((part, index) => {
                const latestScore =
                  skillData.length > 0
                    ? skillData[skillData.length - 1]?.parts[index]?.score
                    : null;

                return (
                  <Button
                    key={index}
                    variant="outline"
                    onClick={() => {
                      setSelectedPartForInput(index);
                      setShowAddPart(true);
                    }}
                    className="h-auto p-4 flex flex-col items-start gap-2"
                  >
                    <div className="flex items-center gap-2 w-full">
                      <Plus className="h-4 w-4" />
                      <span className="font-semibold">Part {index + 1}</span>
                    </div>
                    <span className="text-xs text-muted-foreground text-left">
                      {part}
                    </span>
                    {latestScore !== null && (
                      <Badge variant="secondary" className="text-xs">
                        Your Latest: {latestScore.toFixed(1)}
                      </Badge>
                    )}
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Parts Selection for Multi-User Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Compare Across All Users</CardTitle>
            <CardDescription>
              Select a specific part or view overall scores to compare with
              other users
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button
                variant={selectedPart === null ? "default" : "outline"}
                onClick={() => setSelectedPart(null)}
                className="h-auto p-4 flex flex-col items-start"
              >
                <span className="font-semibold">Overall</span>
                <span className="text-sm text-muted-foreground">
                  All parts average
                </span>
              </Button>
              {skill.parts.map((part, index) => {
                // Calculate average score across all users for this part
                const allUserScores = Object.values(allUsersData).flatMap(
                  (userData: any) => {
                    const skillDataForUser = userData[skill.id] || [];
                    return skillDataForUser.flatMap((test: any) =>
                      test.parts[index]?.score !== null &&
                      test.parts[index]?.score !== undefined
                        ? [test.parts[index].score]
                        : []
                    );
                  }
                );
                const avgScore =
                  allUserScores.length > 0
                    ? allUserScores.reduce((sum, score) => sum + score, 0) /
                      allUserScores.length
                    : 0;

                return (
                  <Button
                    key={index}
                    variant={selectedPart === index ? "default" : "outline"}
                    onClick={() => setSelectedPart(index)}
                    className="h-auto p-4 flex flex-col items-start"
                  >
                    <span className="font-semibold text-left">
                      Part {index + 1}
                    </span>
                    <span className="text-xs text-muted-foreground text-left mb-1">
                      {part}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      All Users Avg:{" "}
                      {avgScore > 0 ? avgScore.toFixed(1) : "N/A"}
                    </Badge>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Multi-User Charts */}
        <Tabs defaultValue="multiuser" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="multiuser" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              User Comparison
            </TabsTrigger>
            <TabsTrigger value="progress" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Your Progress
            </TabsTrigger>
            <TabsTrigger value="parts" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Your Parts
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              Your History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="multiuser">
            <MultiUserChart
              allUsersData={allUsersData}
              skillId={skill.id}
              selectedPart={selectedPart}
              partNames={skill.parts}
              skillName={skill.name}
            />
          </TabsContent>

          <TabsContent value="progress">
            <ProgressChart
              data={skillData}
              selectedPart={selectedPart}
              partNames={skill.parts}
              skillName={skill.name}
              loading={loading}
            />
          </TabsContent>

          <TabsContent value="parts">
            <ProgressChart
              data={skillData}
              selectedPart={null}
              partNames={skill.parts}
              skillName={skill.name}
              loading={loading}
              showAllParts={true}
            />
          </TabsContent>

          <TabsContent value="history">
            <ScoreHistory
              skillData={skillData}
              skill={skill}
              onDataUpdate={fetchSkillData}
              userId={user.id}
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
  );
}
