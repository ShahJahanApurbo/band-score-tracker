"use client";

import EnhancedSkillPage from "@/components/enhanced-skill-page";
import { BookOpen } from "lucide-react";

const readingParts = ["Part 1", "Part 2", "Part 3"];

export default function ReadingPage() {
  return (
    <EnhancedSkillPage
      skill={{
        id: "reading",
        name: "Reading",
        icon: BookOpen,
        parts: readingParts,
        color: "bg-blue-500",
      }}
    />
  );
}
