"use client"

import React, { useEffect, useRef, useState } from "react"
import dynamic from "next/dynamic"
import { useTheme } from "next-themes"

// Dynamically import Globe to avoid SSR hydration mismatches with Three.js
const Globe = dynamic(() => import("react-globe.gl"), { 
  ssr: false,
  loading: () => <div className="fixed inset-0 bg-[#030305] z-0" /> // Fallback background while loading
})

export function GlobeBackground() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const globeRef = useRef<any>(null)
  const [isMounted, setIsMounted] = useState(false)
  const [dimensions, setDimensions] = useState({ width: 1000, height: 1000 })
  const { resolvedTheme } = useTheme()
  const isLight = resolvedTheme === "light"

  useEffect(() => {
    setIsMounted(true)
    const updateDimensions = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight })
    }
    updateDimensions()
    window.addEventListener("resize", updateDimensions)
    return () => window.removeEventListener("resize", updateDimensions)
  }, [])

  useEffect(() => {
    // Enable auto-rotation and zoom in after the globe is mounted
    const initControls = () => {
      if (globeRef.current) {
        // Access Three.js OrbitControls
        const controls = globeRef.current.controls()
        if (controls) {
          controls.autoRotate = true
          controls.autoRotateSpeed = 0.7 // Slightly faster rotation
          controls.enableZoom = false // Prevent scrolling from zooming the globe
        }
        
        // Zoom in to make the globe appear much bigger (default altitude is ~2.5)
        globeRef.current.pointOfView({ altitude: 1.6 }, 1000)
      } else {
        setTimeout(initControls, 100)
      }
    }
    
    initControls()
  }, [])

  if (!isMounted) return <div className="fixed inset-0 bg-[#030305] z-0" />

  return (
    <div className={`fixed inset-0 z-0 overflow-hidden ${isLight ? "bg-zinc-50" : "bg-[#030305]"}`}>
      {/* Globe Container */}
      <div className={`absolute inset-0 flex items-center justify-center pointer-events-auto ${isLight ? "mix-blend-multiply opacity-60" : "mix-blend-lighten opacity-80"}`}>
        <Globe
          ref={globeRef}
          width={dimensions.width}
          height={dimensions.height}
          globeImageUrl={isLight ? "//unpkg.com/three-globe/example/img/earth-water.png" : "//unpkg.com/three-globe/example/img/earth-night.jpg"}
          bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
          backgroundColor="rgba(0,0,0,0)"
          atmosphereColor={isLight ? "#3b82f6" : "#2a45a3"}
          atmosphereAltitude={0.15}
        />
      </div>
      
      {/* Dimming overlay so document text stays readable */}
      <div className={`absolute inset-0 z-10 pointer-events-none ${isLight ? "bg-zinc-50/30" : "bg-black/40"}`} />
    </div>
  )
}
