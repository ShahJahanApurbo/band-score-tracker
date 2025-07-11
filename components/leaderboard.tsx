"use client";

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
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";

interface LeaderboardProps {
  allUsersData: any;
  skills: any[];
}

export default function Leaderboard({
  allUsersData,
  skills,
}: LeaderboardProps) {
  // Calculate current scores for each user
  const calculateUserScores = (skipMostRecent = false) => {
    return Object.entries(allUsersData)
      .map(([username, userData]: [string, any]) => {
        let totalScore = 0;
        let totalTests = 0;

        skills.forEach((skill) => {
          const skillData = userData[skill.id];
          if (skillData.length > 0) {
            // If skipMostRecent is true, use second-to-last entry for previous ranking
            const entryIndex =
              skipMostRecent && skillData.length > 1
                ? skillData.length - 2
                : skillData.length - 1;

            if (entryIndex >= 0) {
              const entry = skillData[entryIndex];
              const avgScore =
                entry.parts.reduce(
                  (sum: number, part: any) => sum + part.score,
                  0
                ) / entry.parts.length;
              totalScore += avgScore;
              totalTests++;
            }
          }
        });

        return {
          username: username.replace("_", " "),
          averageScore: totalTests > 0 ? totalScore / totalTests : 0,
          totalTests: totalTests,
          skillBreakdown: skills.map((skill) => {
            const skillData = userData[skill.id];
            if (skillData.length === 0) return { skill: skill.name, score: 0 };

            const entryIndex =
              skipMostRecent && skillData.length > 1
                ? skillData.length - 2
                : skillData.length - 1;

            if (entryIndex < 0) return { skill: skill.name, score: 0 };

            const entry = skillData[entryIndex];
            const avgScore =
              entry.parts.reduce(
                (sum: number, part: any) => sum + part.score,
                0
              ) / entry.parts.length;
            return { skill: skill.name, score: avgScore };
          }),
        };
      })
      .sort((a, b) => b.averageScore - a.averageScore);
  };

  // Calculate current and previous rankings
  const currentUserScores = calculateUserScores(false);
  const previousUserScores = calculateUserScores(true);

  // Create a map of previous rankings
  const previousRankings = new Map();
  previousUserScores.forEach((user, index) => {
    previousRankings.set(user.username, index);
  });

  // Add ranking change information to current scores
  const userScores = currentUserScores.map((user, currentIndex) => {
    const previousIndex = previousRankings.get(user.username);
    let rankChange = 0;
    let isNew = false;

    if (previousIndex !== undefined) {
      rankChange = previousIndex - currentIndex; // Positive means moved up, negative means moved down
    } else {
      isNew = true; // New user, no previous ranking
    }

    return {
      ...user,
      rankChange,
      isNew,
    };
  });

  const getRankChangeIndicator = (rankChange: number, isNew: boolean) => {
    if (isNew) {
      return (
        <Badge variant="outline" className="text-xs px-1 py-0">
          NEW
        </Badge>
      );
    }

    if (rankChange > 0) {
      return (
        <div className="flex items-center text-green-600">
          <TrendingUp className="h-3 w-3" />
          <span className="text-xs ml-1">+{rankChange}</span>
        </div>
      );
    } else if (rankChange < 0) {
      return (
        <div className="flex items-center text-red-600">
          <TrendingDown className="h-3 w-3" />
          <span className="text-xs ml-1">{rankChange}</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center text-gray-400">
          <Minus className="h-3 w-3" />
        </div>
      );
    }
  };

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 1:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 2:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return (
          <span className="text-lg font-bold text-gray-500">#{index + 1}</span>
        );
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-6 w-6" />
            Overall Leaderboard
          </CardTitle>
          <CardDescription>
            Rankings based on average scores across all skills
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {userScores.map((user, index) => (
              <div
                key={user.username}
                className="flex items-center gap-4 p-4 rounded-lg border bg-card"
              >
                <div className="flex items-center justify-center w-12 h-12">
                  {getRankIcon(index)}
                </div>

                <Avatar className="h-10 w-10">
                  <AvatarFallback className="capitalize">
                    {user.username
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold capitalize">
                      {user.username}
                    </h3>
                    {getRankChangeIndicator(user.rankChange, user.isNew)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {user.totalTests} tests completed
                  </p>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-bold">
                    {user.averageScore.toFixed(1)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Average Score
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Skill-specific leaderboards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {skills.map((skill) => {
          // Calculate current skill rankings
          const currentSkillRankings = userScores
            .map((user) => ({
              username: user.username,
              score:
                user.skillBreakdown.find((s) => s.skill === skill.name)
                  ?.score || 0,
            }))
            .sort((a, b) => b.score - a.score);

          // Calculate previous skill rankings
          const previousSkillRankings = previousUserScores
            .map((user) => ({
              username: user.username,
              score:
                user.skillBreakdown.find((s) => s.skill === skill.name)
                  ?.score || 0,
            }))
            .sort((a, b) => b.score - a.score);

          // Create a map of previous skill rankings
          const previousSkillRankMap = new Map();
          previousSkillRankings.forEach((user, index) => {
            previousSkillRankMap.set(user.username, index);
          });

          // Add ranking change information to current skill rankings
          const skillRankings = currentSkillRankings.map(
            (user, currentIndex) => {
              const previousIndex = previousSkillRankMap.get(user.username);
              let rankChange = 0;
              let isNew = false;

              if (previousIndex !== undefined) {
                rankChange = previousIndex - currentIndex;
              } else {
                isNew = true;
              }

              return {
                ...user,
                rankChange,
                isNew,
              };
            }
          );

          return (
            <Card key={skill.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <skill.icon className="h-5 w-5" />
                  {skill.name} Leaderboard
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {skillRankings.slice(0, 5).map((user, index) => (
                    <div
                      key={user.username}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-500">
                          #{index + 1}
                        </span>
                        <span className="capitalize">{user.username}</span>
                        {getRankChangeIndicator(user.rankChange, user.isNew)}
                      </div>
                      <Badge variant="secondary">{user.score.toFixed(1)}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
