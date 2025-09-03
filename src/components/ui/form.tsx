import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"
import { Label } from "./label"

interface FormFieldProps {
  children: React.ReactNode
  className?: string
}

export function FormField({ children, className }: FormFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {children}
    </div>
  )
}

interface FormLabelProps extends React.ComponentPropsWithoutRef<typeof Label> {
  required?: boolean
}

export function FormLabel({ children, required, className, ...props }: FormLabelProps) {
  return (
    <Label className={cn(className)} {...props}>
      {children}
      {required && <span className="text-error-500 ml-1">*</span>}
    </Label>
  )
}

interface FormDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

export function FormDescription({ className, ...props }: FormDescriptionProps) {
  return (
    <p
      className={cn("text-sm text-charcoal-500", className)}
      {...props}
    />
  )
}

interface FormMessageProps extends React.HTMLAttributes<HTMLParagraphElement> {
  type?: "error" | "warning" | "success" | "info"
}

export function FormMessage({ className, type = "error", children, ...props }: FormMessageProps) {
  if (!children) return null

  const typeClasses = {
    error: "text-error-600",
    warning: "text-warning-600",
    success: "text-success-600",
    info: "text-charcoal-600",
  }

  return (
    <p
      className={cn("text-sm font-medium", typeClasses[type], className)}
      {...props}
    >
      {children}
    </p>
  )
}

interface FormGroupProps {
  children: React.ReactNode
  className?: string
  asChild?: boolean
}

export function FormGroup({ children, className, asChild = false }: FormGroupProps) {
  const Comp = asChild ? Slot : "div"
  
  return (
    <Comp className={cn("space-y-4", className)}>
      {children}
    </Comp>
  )
}

interface FormRowProps {
  children: React.ReactNode
  className?: string
  asChild?: boolean
}

export function FormRow({ children, className, asChild = false }: FormRowProps) {
  const Comp = asChild ? Slot : "div"
  
  return (
    <Comp className={cn("grid grid-cols-1 md:grid-cols-2 gap-4", className)}>
      {children}
    </Comp>
  )
}

interface FormSectionProps {
  title?: string
  description?: string
  children: React.ReactNode
  className?: string
}

export function FormSection({ title, description, children, className }: FormSectionProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {(title || description) && (
        <div className="space-y-1">
          {title && (
            <h3 className="text-lg font-medium text-charcoal-900">{title}</h3>
          )}
          {description && (
            <p className="text-sm text-charcoal-600">{description}</p>
          )}
        </div>
      )}
      <div className="space-y-4">
        {children}
      </div>
    </div>
  )
}

interface FormActionsProps {
  children: React.ReactNode
  className?: string
  align?: "left" | "right" | "center" | "between"
}

export function FormActions({ children, className, align = "right" }: FormActionsProps) {
  const alignClasses = {
    left: "justify-start",
    right: "justify-end",
    center: "justify-center",
    between: "justify-between",
  }

  return (
    <div className={cn("flex gap-3", alignClasses[align], className)}>
      {children}
    </div>
  )
}
