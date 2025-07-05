"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel } from "@/components/ui/sidebar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Plus, User } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useUserStore } from "@/lib/user-store"
import { useToast } from "@/hooks/use-toast"

export default function UserSelector() {
  const [users, setUsers] = useState<any[]>([])
  const [showAddUser, setShowAddUser] = useState(false)
  const [newUsername, setNewUsername] = useState("")
  const { currentUser, setCurrentUser } = useUserStore()
  const { toast } = useToast()

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const { data: users, error } = await supabase.from("users").select("*").order("username")

      if (error) throw error
      setUsers(users || [])

      // Set first user as current if none selected
      if (!currentUser && users && users.length > 0) {
        setCurrentUser(users[0])
      }
    } catch (error) {
      console.error("Error fetching users:", error)
    }
  }

  const handleAddUser = async () => {
    if (!newUsername.trim()) return

    try {
      const { data, error } = await supabase
        .from("users")
        .insert([{ username: newUsername.trim() }])
        .select()
        .single()

      if (error) throw error

      toast({
        title: "Success",
        description: "User added successfully!",
      })

      setNewUsername("")
      setShowAddUser(false)
      fetchUsers()

      // Set as current user
      if (data) {
        setCurrentUser(data)
      }
    } catch (error) {
      console.error("Error adding user:", error)
      toast({
        title: "Error",
        description: "Failed to add user",
        variant: "destructive",
      })
    }
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Current User</SidebarGroupLabel>
      <SidebarGroupContent>
        <div className="space-y-2">
          {currentUser && (
            <div className="flex items-center gap-2 p-2 rounded-lg bg-sidebar-accent">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs">{currentUser.username.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium capitalize">{currentUser.username}</span>
            </div>
          )}

          <div className="flex gap-1">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                  <User className="h-4 w-4 mr-1" />
                  Switch User
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Select User</DialogTitle>
                  <DialogDescription>Choose a user to track scores for</DialogDescription>
                </DialogHeader>
                <div className="grid gap-2 max-h-60 overflow-y-auto">
                  {users.map((user) => (
                    <Button
                      key={user.id}
                      variant={currentUser?.id === user.id ? "default" : "outline"}
                      onClick={() => setCurrentUser(user)}
                      className="justify-start"
                    >
                      <Avatar className="h-6 w-6 mr-2">
                        <AvatarFallback className="text-xs">{user.username.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <span className="capitalize">{user.username}</span>
                    </Button>
                  ))}
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={showAddUser} onOpenChange={setShowAddUser}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New User</DialogTitle>
                  <DialogDescription>Create a new user to track scores</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      placeholder="Enter username"
                      onKeyDown={(e) => e.key === "Enter" && handleAddUser()}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setShowAddUser(false)} className="flex-1">
                      Cancel
                    </Button>
                    <Button onClick={handleAddUser} disabled={!newUsername.trim()} className="flex-1">
                      Add User
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
