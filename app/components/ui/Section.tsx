/**
 * Section wrapper component
 */

interface SectionProps {
  children: React.ReactNode
  className?: string
}

export default function Section({ children, className = "" }: SectionProps) {
  return <section className={`min-h-screen bg-base-200 ${className}`}>{children}</section>
}
