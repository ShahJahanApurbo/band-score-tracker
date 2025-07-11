"use client";

import EnhancedSkillPage from "@/components/enhanced-skill-page";
import { Headphones } from "lucide-react";

const listeningParts = ["Part 1", "Part 2", "Part 3", "Part 4"];

const listeningQuestionTypes = [
  "Matching",
  "Multiple Choice",
  "Note Completion",
  "Form Completion",
  "Table Completion",
  "Sentence Completion",
  "Summary Completion",
  "Short Answer Questions",
  "Map & Plan Labelling",
  "Diagram & Flowchart Completion",
];

export default function ListeningPage() {
  return (
    <EnhancedSkillPage
      skill={{
        id: "listening",
        name: "Listening",
        icon: Headphones,
        parts: listeningParts,
        color: "bg-green-500",
        questionTypes: listeningQuestionTypes,
      }}
    />
  );
}
