'use client'

import { ReactLenis, useLenis } from 'lenis/react'
import { ReactNode, useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export function SmoothScroll({ children }: { children: ReactNode }) {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
  }, [])

  useLenis(() => {
    ScrollTrigger.update()
  })

  return (
    <ReactLenis
      root
      options={{
        lerp: 0.05, // Lower lerp for more buttery, smooth "catch-up"
        duration: 1.5, // Slightly longer duration for elegant smoothing
        smoothWheel: true,
        syncTouch: true, // Enable syncTouch for that premium, synchronized feel on phones
        touchMultiplier: 2.0, // Increase sensitivity slightly for effortless gliding
        wheelMultiplier: 1.0,
        infinite: false,
        orientation: 'vertical',
        gestureOrientation: 'vertical',
      }}
    >
      {children}
    </ReactLenis>
  )
}
