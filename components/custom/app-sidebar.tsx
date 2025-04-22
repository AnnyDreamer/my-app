import * as React from "react";
import { Calendar, Inbox, Search, Settings, ScrollText } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { UserPanle } from "./peopleCard";
import { Metadata } from "next";
import { ThemeToggle } from "../ThemeToggle";
// Menu items.
const items = [
  {
    title: "Plan",
    url: "/",
    icon: Calendar,
  },
  {
    title: "Docs",
    url: "/docs",
    icon: ScrollText,
  },
  {
    title: "Inbox",
    url: "#",
    icon: Inbox,
  },

  {
    title: "Search",
    url: "#",
    icon: Search,
  },
  {
    title: "Settings",
    url: "#",
    icon: Settings,
  },
];

export function AppSidebar({ metaData }: { metaData: Metadata }) {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{metaData.title}</SidebarGroupLabel>
          <SidebarGroupContent>
            <UserPanle userInfo={{ name: "John Doe", email: "john@doe.com" }} />
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
            <ThemeToggle />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
