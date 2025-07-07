"use client";

import EnhancedSkillPage from "@/components/enhanced-skill-page";
import { PenTool } from "lucide-react";

const writingParts = ["Part 1", "Part 2"];

export default function WritingPage() {
  return (
    <EnhancedSkillPage
      skill={{
        id: "writing",
        name: "Writing",
        icon: PenTool,
        parts: writingParts,
        color: "bg-purple-500",
      }}
    />
  );
}
