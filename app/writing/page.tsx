"use client"

import SkillPage from "@/components/skill-page"
import { PenTool } from "lucide-react"

const writingParts = ["Task 1 - Report/Letter", "Task 2 - Essay"]

export default function WritingPage() {
  return (
    <SkillPage
      skill={{
        id: "writing",
        name: "Writing",
        icon: PenTool,
        parts: writingParts,
        color: "bg-purple-500",
      }}
    />
  )
}
