"use client"

import { ThemeToggle } from "@/components/theme-toggle"
import { LanguageSwitcher } from "@/components/language-switcher"
import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel } from "@/components/ui/sidebar"
import { useTranslations } from "next-intl"

export function NavControls() {
  const t = useTranslations()

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{t('nav.preferences')}</SidebarGroupLabel>
      <SidebarGroupContent className="space-y-2">
        <div className="flex items-center justify-between px-2 py-1">
          <span className="text-sm">{t('theme.label')}</span>
          <ThemeToggle />
        </div>
        <div className="flex items-center justify-between px-2 py-1">
          <span className="text-sm">{t('language.label')}</span>
          <LanguageSwitcher />
        </div>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}