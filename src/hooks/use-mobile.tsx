
import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    // Initial check
    const checkMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    
    // Run once immediately
    checkMobile()
    
    // Set up event listener
    window.addEventListener("resize", checkMobile)
    
    // Clean up
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  return !!isMobile
}

// Bonus: Add a hook for detecting touch-based devices
export function useTouchDevice() {
  const [isTouch, setIsTouch] = React.useState(false)
  
  React.useEffect(() => {
    // Modern way to detect touch device
    const isTouchDevice = 'ontouchstart' in window || 
      navigator.maxTouchPoints > 0 ||
      (navigator as any).msMaxTouchPoints > 0
    
    setIsTouch(isTouchDevice)
  }, [])
  
  return isTouch
}
