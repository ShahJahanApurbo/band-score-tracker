import { create } from "zustand"
import { persist } from "zustand/middleware"

interface User {
  id: string
  username: string
}

interface UserStore {
  currentUser: User | null
  setCurrentUser: (user: User | null) => void
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      currentUser: null,
      setCurrentUser: (user) => set({ currentUser: user }),
    }),
    {
      name: "user-store",
    },
  ),
)
