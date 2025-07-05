"use client"

import SkillPage from "@/components/skill-page"
import { Mic } from "lucide-react"

const speakingParts = ["Introduction & Interview", "Individual Long Turn", "Two-way Discussion"]

export default function SpeakingPage() {
  return (
    <SkillPage
      skill={{
        id: "speaking",
        name: "Speaking",
        icon: Mic,
        parts: speakingParts,
        color: "bg-orange-500",
      }}
    />
  )
}
