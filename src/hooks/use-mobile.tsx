
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

// For backwards compatibility, we'll provide useMediaQuery as an alias for useIsMobile
export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = React.useState<boolean>(false)

  React.useEffect(() => {
    // Default to mobile check if query is for max-width
    if (query === "(max-width: 768px)") {
      const checkMobile = () => {
        setMatches(window.innerWidth < MOBILE_BREAKPOINT)
      }
      
      checkMobile()
      window.addEventListener("resize", checkMobile)
      return () => window.removeEventListener("resize", checkMobile)
    } else {
      // Use actual media query for other cases
      const media = window.matchMedia(query)
      if (media.matches !== matches) {
        setMatches(media.matches)
      }
      
      const listener = () => setMatches(media.matches)
      media.addEventListener("change", listener)
      return () => media.removeEventListener("change", listener)
    }
  }, [matches, query])

  return matches
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
