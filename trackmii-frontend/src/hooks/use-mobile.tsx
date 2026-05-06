"use client"
import { useEffect, useState } from "react"
const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => setIsMobile(mq.matches)
    mq.addEventListener("change", onChange)
    setIsMobile(mq.matches)
    return () => mq.removeEventListener("change", onChange)
  }, [])

  return isMobile
}


//detects if viewport is below 768px. Used in AppLayout to switch between sidebar and mobile drawer. Uses matchMedia with a listener so it reacts to window resize in real time.