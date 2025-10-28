/**
 * Simple animation wrapper
 */

interface AnimateElementInProps {
  children: React.ReactNode
  transition?: "fadeIn" | "slideUp"
  className?: string
}

export default function AnimateElementIn({
  children,
  transition = "fadeIn",
  className = "",
}: AnimateElementInProps) {
  const animations = {
    fadeIn: "animate-fade-in",
    slideUp: "animate-slide-up",
  }

  return <div className={`${animations[transition]} ${className}`}>{children}</div>
}
