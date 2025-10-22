"use client"

import { useTranslations } from "next-intl"

import {
  SidebarGroup,
  SidebarGroupLabel,
} from "@/components/ui/sidebar"

export function NavProjects() {
  const t = useTranslations()

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>{t('projects.label')}</SidebarGroupLabel>
    </SidebarGroup>
  )
}
