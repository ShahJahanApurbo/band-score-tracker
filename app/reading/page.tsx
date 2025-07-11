"use client";

import EnhancedSkillPage from "@/components/enhanced-skill-page";
import { BookOpen } from "lucide-react";

const readingParts = ["Part 1", "Part 2", "Part 3"];

const readingQuestionTypes = [
  "Matching Headings",
  "Matching Paragraph Information",
  "Matching Features",
  "Matching Sentence Endings",
  "True / False / Not Given",
  "Yes / No / Not Given",
  "Multiple Choice",
  "List of Options",
  "Choose a Title",
  "Short Answers",
  "Sentence Completion",
  "Summary Completion",
  "Table Completion",
  "Flow Chart Completion",
  "Diagram Completion",
];

export default function ReadingPage() {
  return (
    <EnhancedSkillPage
      skill={{
        id: "reading",
        name: "Reading",
        icon: BookOpen,
        parts: readingParts,
        color: "bg-blue-500",
        questionTypes: readingQuestionTypes,
      }}
    />
  );
}
