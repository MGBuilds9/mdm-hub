import * as React from "react"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

interface LoadingProps {
  size?: "sm" | "md" | "lg"
  className?: string
  text?: string
}

export function Loading({ size = "md", className, text }: LoadingProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  }

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className="flex flex-col items-center gap-2">
        <Loader2 className={cn("animate-spin text-primary-500", sizeClasses[size])} />
        {text && (
          <p className="text-sm text-charcoal-600">{text}</p>
        )}
      </div>
    </div>
  )
}

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg"
  className?: string
}

export function LoadingSpinner({ size = "md", className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  }

  return (
    <Loader2 className={cn("animate-spin text-primary-500", sizeClasses[size], className)} />
  )
}

interface LoadingPageProps {
  text?: string
  className?: string
}

export function LoadingPage({ text = "Loading...", className }: LoadingPageProps) {
  return (
    <div className={cn("min-h-screen flex items-center justify-center", className)}>
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="h-12 w-12 border-4 border-charcoal-200 rounded-full"></div>
          <div className="absolute top-0 left-0 h-12 w-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="text-charcoal-600 font-medium">{text}</p>
      </div>
    </div>
  )
}

interface LoadingCardProps {
  text?: string
  className?: string
}

export function LoadingCard({ text = "Loading...", className }: LoadingCardProps) {
  return (
    <div className={cn("p-8 flex items-center justify-center", className)}>
      <div className="flex flex-col items-center gap-3">
        <div className="relative">
          <div className="h-8 w-8 border-3 border-charcoal-200 rounded-full"></div>
          <div className="absolute top-0 left-0 h-8 w-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="text-sm text-charcoal-600">{text}</p>
      </div>
    </div>
  )
}

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-charcoal-200",
        className
      )}
    />
  )
}

// Common skeleton patterns
export function SkeletonCard() {
  return (
    <div className="rounded-lg border border-charcoal-200 p-6">
      <div className="space-y-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-20 w-full" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-20" />
        </div>
      </div>
    </div>
  )
}

export function SkeletonTable() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-4 w-1/6" />
          <Skeleton className="h-4 w-1/5" />
        </div>
      ))}
    </div>
  )
}

export function SkeletonAvatar() {
  return <Skeleton className="h-10 w-10 rounded-full" />
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            "h-4",
            i === lines - 1 ? "w-3/4" : "w-full"
          )}
        />
      ))}
    </div>
  )
}
