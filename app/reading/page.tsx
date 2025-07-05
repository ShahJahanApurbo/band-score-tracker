"use client"

import SkillPage from "@/components/skill-page"
import { BookOpen } from "lucide-react"

const readingParts = ["Multiple Choice Questions", "Gap Fill Exercise", "Matching Headings"]

export default function ReadingPage() {
  return (
    <SkillPage
      skill={{
        id: "reading",
        name: "Reading",
        icon: BookOpen,
        parts: readingParts,
        color: "bg-blue-500",
      }}
    />
  )
}
