"use client"

import SkillPage from "@/components/skill-page"
import { Headphones } from "lucide-react"

const listeningParts = ["Conversations", "Monologues", "Discussions", "Academic Lectures"]

export default function ListeningPage() {
  return (
    <SkillPage
      skill={{
        id: "listening",
        name: "Listening",
        icon: Headphones,
        parts: listeningParts,
        color: "bg-green-500",
      }}
    />
  )
}
