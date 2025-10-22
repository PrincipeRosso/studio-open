"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import Image from "next/image"

interface StudioIconProps {
  className?: string;
  size?: number;
}

export function StudioIcon({ className, size = 16 }: StudioIconProps) {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  
  // Assicura che il componente sia montato prima di renderizzare
  React.useEffect(() => {
    setMounted(true)
  }, [])
  
  // Determina il tema corrente, default a light se non ancora montato
  const isDark = mounted ? resolvedTheme === "dark" : false
  
  // Seleziona l'icona appropriata
  const getIconSrc = () => {
    return isDark 
      ? "/assets/llIlI Studio-logo-icon-darktheme.svg"
      : "/assets/llIlI Studio-logo-icon-lighttheme.svg"
  }
  
  // Non renderizzare fino a quando il componente non è montato
  if (!mounted) {
    return (
      <div 
        className={className}
        style={{
          width: size,
          height: size,
        }}
      />
    )
  }
  
  return (
    <div 
      className={`relative overflow-hidden ${className}`}
      style={{
        width: size,
        height: size,
      }}
    >
      <Image
        src={getIconSrc()}
        alt="Studio Icon"
        fill
        className="object-contain"
        sizes={`${size}px`}
      />
    </div>
  )
}