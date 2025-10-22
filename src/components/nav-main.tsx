"use client"

import { Home, Activity, Layers2, Library, ChevronDown, type LucideIcon } from "lucide-react"
import { useTranslations } from "next-intl"
import { Link } from "@/i18n/routing"
import { useState } from "react"

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

export function NavMain() {
  const t = useTranslations()
  const [isResourcesOpen, setIsResourcesOpen] = useState(false)

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{t('nav.platform')}</SidebarGroupLabel>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton asChild className="font-normal">
            <Link href="/dashboard">
              <Home className="h-4 w-4 opacity-70" />
              <span className="font-normal">{t('nav.home')}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        
        <SidebarMenuItem>
          <SidebarMenuButton asChild className="font-normal">
            <Link href="/activities">
              <Activity className="h-4 w-4 opacity-70" />
              <span className="font-normal">{t('nav.activities')}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        
        <SidebarMenuItem>
          <SidebarMenuButton asChild className="font-normal">
            <Link href="/memory">
              <Layers2 className="h-4 w-4 opacity-70" />
              <span className="font-normal">{t('nav.memory')}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        
        <Collapsible open={isResourcesOpen} onOpenChange={setIsResourcesOpen}>
          <SidebarMenuItem>
            <CollapsibleTrigger asChild>
              <SidebarMenuButton className="font-normal">
                <Library className="h-4 w-4 opacity-70" />
                <span className="font-normal">{t('nav.resources')}</span>
                <ChevronDown className={`ml-auto h-4 w-4 opacity-70 transition-transform ${isResourcesOpen ? 'rotate-180' : ''}`} />
              </SidebarMenuButton>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarMenuSub>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton asChild className="font-normal">
                    <Link href="/resources/agents">
                      <span className="font-normal">{t('nav.agents')}</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              </SidebarMenuSub>
            </CollapsibleContent>
          </SidebarMenuItem>
        </Collapsible>
      </SidebarMenu>
    </SidebarGroup>
  )
}
