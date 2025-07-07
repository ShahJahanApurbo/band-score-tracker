"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  Target,
  Award,
} from "lucide-react";

interface SkillStatsProps {
  skillData: any[];
  skill: {
    name: string;
    parts: string[];
  };
}

export default function SkillStats({ skillData, skill }: SkillStatsProps) {
  if (skillData.length === 0) {
    return null;
  }

  const calculateStats = () => {
    const allScores = skillData.flatMap((test) =>
      test.parts
        .filter((part: any) => part.score !== null)
        .map((part: any) => part.score)
    );

    if (allScores.length === 0) return null;

    const currentScore = skillData[skillData.length - 1];
    const previousScore =
      skillData.length > 1 ? skillData[skillData.length - 2] : null;

    const currentAvg =
      currentScore.parts
        .filter((part: any) => part.score !== null)
        .reduce((sum: number, part: any) => sum + part.score, 0) /
      currentScore.parts.filter((part: any) => part.score !== null).length;

    let previousAvg = 0;
    if (previousScore) {
      const validPrevScores = previousScore.parts.filter(
        (part: any) => part.score !== null
      );
      if (validPrevScores.length > 0) {
        previousAvg =
          validPrevScores.reduce(
            (sum: number, part: any) => sum + part.score,
            0
          ) / validPrevScores.length;
      }
    }

    const trend = previousScore ? currentAvg - previousAvg : 0;
    const overallAvg =
      allScores.reduce((sum, score) => sum + score, 0) / allScores.length;
    const bestScore = Math.max(...allScores);
    const totalTests = skillData.length;

    // Calculate part averages
    const partStats = skill.parts.map((partName, index) => {
      const partScores = skillData
        .map((test) => test.parts[index]?.score)
        .filter((score) => score !== null);

      if (partScores.length === 0) return { name: partName, avg: 0, count: 0 };

      const avg =
        partScores.reduce((sum, score) => sum + score, 0) / partScores.length;
      return { name: partName, avg, count: partScores.length };
    });

    return {
      currentAvg,
      previousAvg,
      trend,
      overallAvg,
      bestScore,
      totalTests,
      partStats,
    };
  };

  const stats = calculateStats();
  if (!stats) return null;

  const getTrendIcon = (trend: number) => {
    if (trend > 0.1) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (trend < -0.1) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  const getTrendColor = (trend: number) => {
    if (trend > 0.1) return "text-green-600";
    if (trend < -0.1) return "text-red-600";
    return "text-gray-600";
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return "bg-green-500";
    if (score >= 6.5) return "bg-blue-500";
    if (score >= 5.5) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Current Performance */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Target className="h-4 w-4" />
            Latest Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.currentAvg.toFixed(1)}
          </div>
          <div
            className={`text-xs flex items-center gap-1 ${getTrendColor(
              stats.trend
            )}`}
          >
            {getTrendIcon(stats.trend)}
            {stats.trend !== 0 && (
              <>
                {stats.trend > 0 ? "+" : ""}
                {stats.trend.toFixed(1)} from last test
              </>
            )}
            {stats.trend === 0 && "No previous test"}
          </div>
        </CardContent>
      </Card>

      {/* Overall Average */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Award className="h-4 w-4" />
            Overall Average
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.overallAvg.toFixed(1)}
          </div>
          <div className="text-xs text-muted-foreground">
            Across all {stats.totalTests} test
            {stats.totalTests !== 1 ? "s" : ""}
          </div>
        </CardContent>
      </Card>

      {/* Best Score */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Best Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.bestScore.toFixed(1)}</div>
          <div className="text-xs text-muted-foreground">
            Personal best achievement
          </div>
        </CardContent>
      </Card>

      {/* Progress to Target */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Progress to 7.0
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {Math.min(100, (stats.currentAvg / 7.0) * 100).toFixed(0)}%
          </div>
          <Progress
            value={Math.min(100, (stats.currentAvg / 7.0) * 100)}
            className="h-2 mt-2"
          />
        </CardContent>
      </Card>

      {/* Part Breakdown */}
      <Card className="md:col-span-2 lg:col-span-4">
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            Part Performance Breakdown
          </CardTitle>
          <CardDescription>
            Average scores for each part of the {skill.name.toLowerCase()} test
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.partStats.map((part, index) => (
              <div
                key={index}
                className="flex flex-col items-center p-3 rounded-lg border bg-muted/30"
              >
                <span className="text-sm font-medium mb-1">
                  Part {index + 1}
                </span>
                <span className="text-xs text-muted-foreground text-center mb-2">
                  {part.name}
                </span>
                {part.count > 0 ? (
                  <>
                    <Badge
                      variant="secondary"
                      className={`text-white mb-1 ${getScoreColor(part.avg)}`}
                    >
                      {part.avg.toFixed(1)} avg
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {part.count} test{part.count !== 1 ? "s" : ""}
                    </span>
                  </>
                ) : (
                  <Badge variant="outline">Not taken</Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
