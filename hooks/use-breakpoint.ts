import * as React from "react"

const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const

type Breakpoint = keyof typeof BREAKPOINTS

export function useBreakpoint(breakpoint: Breakpoint) {
  const [matches, setMatches] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(min-width: ${BREAKPOINTS[breakpoint]}px)`)
    const onChange = () => {
      setMatches(window.innerWidth >= BREAKPOINTS[breakpoint])
    }
    mql.addEventListener("change", onChange)
    setMatches(window.innerWidth >= BREAKPOINTS[breakpoint])
    return () => mql.removeEventListener("change", onChange)
  }, [breakpoint])

  return !!matches
}

export function useIsMobile() {
  return !useBreakpoint("md")
}

export function useIsMedium() {
  const isMd = useBreakpoint("md")
  const isLg = useBreakpoint("lg")
  return isMd && !isLg
}

export function useIsLarge() {
  return useBreakpoint("lg")
}
