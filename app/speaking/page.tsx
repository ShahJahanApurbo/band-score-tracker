"use client";

import EnhancedSkillPage from "@/components/enhanced-skill-page";
import { Mic } from "lucide-react";

const speakingParts = ["Part 1", "Part 2", "Part 3"];

export default function SpeakingPage() {
  return (
    <EnhancedSkillPage
      skill={{
        id: "speaking",
        name: "Speaking",
        icon: Mic,
        parts: speakingParts,
        color: "bg-orange-500",
      }}
    />
  );
}
