"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Trophy,
  Medal,
  Award,
  BookOpen,
  Headphones,
  Mic,
  PenTool,
} from "lucide-react";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import AuthCard from "@/components/auth-card";

interface UserScore {
  user_id: string;
  username: string;
  email: string;
  averageScore: number;
  totalTests: number;
  skillBreakdown: { skill: string; score: number; icon: any }[];
}

const skills = [
  { id: "reading", name: "Reading", icon: BookOpen, parts: 3 },
  { id: "listening", name: "Listening", icon: Headphones, parts: 4 },
  { id: "speaking", name: "Speaking", icon: Mic, parts: 3 },
  { id: "writing", name: "Writing", icon: PenTool, parts: 2 },
];

export default function HomePage() {
  const [userScores, setUserScores] = useState<UserScore[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    console.log("useEffect triggered with:", { user, authLoading });
    // Always fetch leaderboard data, regardless of authentication state for testing
    if (!authLoading) {
      fetchLeaderboardData();
    }
  }, [authLoading]);

  const fetchLeaderboardData = async () => {
    try {
      console.log("Fetching leaderboard data...");
      console.log("Current user:", user);

      // First, get all part scores
      const { data: scores, error: scoresError } = await supabase
        .from("part_scores")
        .select("*")
        .order("created_at", { ascending: false });

      console.log("Part scores result:", { scores, scoresError });

      if (scoresError) {
        console.error("Error fetching scores:", scoresError);
        console.error("Error code:", scoresError.code);
        console.error("Error message:", scoresError.message);
        console.error("Error details:", scoresError.details);
        console.error("Error hint:", scoresError.hint);
        throw scoresError;
      }

      if (!scores || scores.length === 0) {
        console.log("No scores found");
        setUserScores([]);
        return;
      }

      // Get unique user IDs
      const userIds = [...new Set(scores.map((score) => score.user_id))];
      console.log("User IDs found:", userIds);

      // Fetch profiles for these users
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, username, email")
        .in("id", userIds);

      console.log("Profiles result:", { profiles, profilesError });

      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
        // Continue without profiles if there's an error
      }

      // Combine the data
      const scoresWithProfiles = scores.map((score) => {
        const profile = profiles?.find((p) => p.id === score.user_id);
        return {
          ...score,
          profiles: profile
            ? {
                username: profile.username,
                email: profile.email,
              }
            : {
                username: `User ${score.user_id.slice(0, 8)}`,
                email: "",
              },
        };
      });

      console.log("Combined scores with profiles:", scoresWithProfiles);
      processLeaderboardData(scoresWithProfiles);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));
      toast({
        title: "Error",
        description: "Failed to load leaderboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const processLeaderboardData = (scores: any[]) => {
    // Group scores by user and calculate averages
    const userScoreMap = new Map<string, any>();

    scores?.forEach((score) => {
      const userId = score.user_id;
      const username =
        score.profiles?.username || score.profiles?.email || "Unknown";
      const email = score.profiles?.email || "";

      if (!userScoreMap.has(userId)) {
        userScoreMap.set(userId, {
          user_id: userId,
          username,
          email,
          skillScores: new Map(),
          totalParts: 0,
        });
      }

      const userScore = userScoreMap.get(userId);
      const skillKey = score.skill;

      if (!userScore.skillScores.has(skillKey)) {
        userScore.skillScores.set(skillKey, []);
      }

      userScore.skillScores.get(skillKey).push(score.score);
      userScore.totalParts++;
    });

    // Calculate averages and create leaderboard
    const leaderboardData: UserScore[] = Array.from(userScoreMap.values())
      .map((user) => {
        const skillBreakdown = skills.map((skill) => {
          const skillScores = user.skillScores.get(skill.id) || [];
          const avgScore =
            skillScores.length > 0
              ? skillScores.reduce(
                  (sum: number, score: number) => sum + score,
                  0
                ) / skillScores.length
              : 0;

          return {
            skill: skill.name,
            score: avgScore,
            icon: skill.icon,
          };
        });

        const validScores = skillBreakdown.filter((skill) => skill.score > 0);
        const overallAverage =
          validScores.length > 0
            ? validScores.reduce((sum, skill) => sum + skill.score, 0) /
              validScores.length
            : 0;

        return {
          user_id: user.user_id,
          username: user.username,
          email: user.email,
          averageScore: overallAverage,
          totalTests: user.totalParts,
          skillBreakdown,
        };
      })
      .sort((a, b) => b.averageScore - a.averageScore);

    setUserScores(leaderboardData);
  };

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 1:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 2:
        return <Award className="h-6 w-6 text-amber-600" />;
      default:
        return (
          <span className="text-xl font-bold text-gray-500">#{index + 1}</span>
        );
    }
  };

  if (authLoading || loading) {
    return (
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <h1 className="text-xl font-semibold">Leaderboard</h1>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="text-center">Loading leaderboard data...</div>
        </div>
      </SidebarInset>
    );
  }

  // Show authentication card if user is not logged in
  if (!user) {
    return (
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <h1 className="text-xl font-semibold">Welcome</h1>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 items-center justify-center">
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
          <Trophy className="h-5 w-5" />
          <h1 className="text-xl font-semibold">Leaderboard</h1>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-6 p-6">
        {/* Overall Leaderboard */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-6 w-6" />
              Overall Rankings
            </CardTitle>
            <CardDescription>
              Rankings based on average scores across all skills
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {userScores.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No test scores available yet. Start by taking a test!
                </div>
              ) : (
                userScores.map((userScore, index) => (
                  <div
                    key={userScore.user_id}
                    className="flex items-center gap-4 p-4 rounded-lg border bg-card"
                  >
                    <div className="flex items-center justify-center w-12 h-12">
                      {getRankIcon(index)}
                    </div>

                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="capitalize text-lg">
                        {userScore.username
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      <h3 className="font-semibold text-lg capitalize">
                        {userScore.username}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {userScore.totalTests} parts completed
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="text-3xl font-bold">
                        {userScore.averageScore.toFixed(1)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Average Score
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Skill-specific leaderboards */}
        {userScores.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {skills.map((skill) => {
              const skillRankings = userScores
                .map((userScore) => ({
                  username: userScore.username,
                  score:
                    userScore.skillBreakdown.find((s) => s.skill === skill.name)
                      ?.score || 0,
                }))
                .filter((userScore) => userScore.score > 0)
                .sort((a, b) => b.score - a.score);

              return (
                <Card key={skill.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <skill.icon className="h-5 w-5" />
                      {skill.name} Rankings
                    </CardTitle>
                    <CardDescription>{skill.parts} parts</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {skillRankings.length === 0 ? (
                        <div className="text-center py-4 text-muted-foreground text-sm">
                          No {skill.name.toLowerCase()} scores yet
                        </div>
                      ) : (
                        skillRankings.slice(0, 5).map((userScore, index) => (
                          <div
                            key={userScore.username}
                            className="flex items-center justify-between"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-medium text-gray-500 w-6">
                                #{index + 1}
                              </span>
                              <span className="capitalize">
                                {userScore.username}
                              </span>
                            </div>
                            <Badge variant="secondary">
                              {userScore.score.toFixed(1)}
                            </Badge>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </SidebarInset>
  );
}
