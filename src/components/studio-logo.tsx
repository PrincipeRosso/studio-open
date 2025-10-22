"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { useSidebar } from "@/components/ui/sidebar"
import Image from "next/image"

export function StudioLogo() {
  const { resolvedTheme } = useTheme()
  const { state } = useSidebar()
  const [mounted, setMounted] = React.useState(false)
  
  // Assicura che il componente sia montato prima di renderizzare
  React.useEffect(() => {
    setMounted(true)
  }, [])
  
  // Determina se la sidebar è collassata
  const isCollapsed = state === "collapsed"
  
  // Determina il tema corrente, default a light se non ancora montato
  const isDark = mounted ? resolvedTheme === "dark" : false
  
  // Seleziona il logo appropriato
  const getLogoSrc = () => {
    if (isCollapsed) {
      // Versione icona per sidebar collassata
      return isDark 
        ? "/assets/llIlI Studio-logo-icon-darktheme.svg"
        : "/assets/llIlI Studio-logo-icon-lighttheme.svg"
    } else {
      // Versione completa per sidebar espansa
      return isDark 
        ? "/assets/llIlI Studio-logo-darktheme.svg"
        : "/assets/llIlI Studio-logo-lighttheme.svg"
    }
  }
  
  const getLogoAlt = () => {
    return isCollapsed ? "Studio Logo Icon" : "Studio Logo"
  }
  
  const getLogoSize = () => {
    if (isCollapsed) {
      return { width: 44, height: 44 }
    } else {
      return { width: 140, height: 40 }
    }
  }
  
  const logoSize = getLogoSize()
  
  // Non renderizzare fino a quando il componente non è montato
  if (!mounted) {
    return (
      <div className={`flex items-center transition-all duration-200 ${isCollapsed ? 'justify-center p-1' : 'justify-start p-2 pl-3'}`}>
        <div 
          className="relative overflow-hidden transition-all duration-200 ease-in-out"
          style={{
            width: logoSize.width,
            height: logoSize.height,
          }}
        />
      </div>
    )
  }
  
  return (
    <div className={`flex items-center transition-all duration-200 ${isCollapsed ? 'justify-center p-1' : 'justify-start p-2 pl-3'}`}>
      <div 
        className="relative overflow-hidden transition-all duration-200 ease-in-out"
        style={{
          width: logoSize.width,
          height: logoSize.height,
        }}
      >
        <Image
          src={getLogoSrc()}
          alt={getLogoAlt()}
          fill
          className="object-contain"
          priority
          sizes={`${logoSize.width}px`}
        />
      </div>
    </div>
  )
}