"use client";

import {
  Home,
  BookOpen,
  Headphones,
  Mic,
  PenTool,
  User,
  LogOut,
  LogIn,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";

const navigationItems = [
  {
    title: "Home",
    url: "/",
    icon: Home,
  },
];

const skillItems = [
  {
    title: "Reading",
    url: "/reading",
    icon: BookOpen,
    parts: 3,
  },
  {
    title: "Listening",
    url: "/listening",
    icon: Headphones,
    parts: 4,
  },
  {
    title: "Speaking",
    url: "/speaking",
    icon: Mic,
    parts: 3,
  },
  {
    title: "Writing",
    url: "/writing",
    icon: PenTool,
    parts: 2,
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <User className="size-4" />
          </div>
          <div className="flex flex-col gap-0.5 leading-none">
            <span className="font-semibold">Band Score Tracker</span>
            <span className="text-xs text-sidebar-foreground/70">
              Track your progress
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {user && (
          <SidebarGroup>
            <SidebarGroupLabel>Current User</SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-sidebar-accent">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">
                    {user.user_metadata?.username?.charAt(0)?.toUpperCase() ||
                      user.email?.charAt(0)?.toUpperCase() ||
                      "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium capitalize truncate">
                    {user.user_metadata?.username || user.email?.split("@")[0]}
                  </div>
                  <div className="text-xs text-sidebar-foreground/70 truncate">
                    {user.email}
                  </div>
                </div>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {user && (
          <SidebarGroup>
            <SidebarGroupLabel>Skills</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {skillItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={pathname === item.url}>
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                        <span className="ml-auto text-xs text-sidebar-foreground/70">
                          {item.parts} parts
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      {user && (
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={signOut}>
                <LogOut />
                <span>Sign Out</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      )}

      {!user && (
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/">
                  <LogIn />
                  <span>Sign In</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      )}

      <SidebarRail />
    </Sidebar>
  );
}
