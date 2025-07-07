"use client";

import EnhancedSkillPage from "@/components/enhanced-skill-page";
import { Headphones } from "lucide-react";

const listeningParts = ["Part 1", "Part 2", "Part 3", "Part 4"];

export default function ListeningPage() {
  return (
    <EnhancedSkillPage
      skill={{
        id: "listening",
        name: "Listening",
        icon: Headphones,
        parts: listeningParts,
        color: "bg-green-500",
      }}
    />
  );
}
