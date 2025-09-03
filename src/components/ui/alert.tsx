import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { AlertTriangle, CheckCircle, Info, X } from "lucide-react"

const alertVariants = cva(
  "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",
  {
    variants: {
      variant: {
        default: "bg-white text-charcoal-950 border-charcoal-200",
        destructive: "border-error-500/50 text-error-600 bg-error-50 [&>svg]:text-error-600",
        success: "border-success-500/50 text-success-600 bg-success-50 [&>svg]:text-success-600",
        warning: "border-warning-500/50 text-warning-600 bg-warning-50 [&>svg]:text-warning-600",
        info: "border-primary-500/50 text-primary-600 bg-primary-50 [&>svg]:text-primary-600",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props}
  />
))
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-medium leading-none tracking-tight", className)}
    {...props}
  />
))
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props}
  />
))
AlertDescription.displayName = "AlertDescription"

// Pre-configured alert components
interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  description?: string
  dismissible?: boolean
  onDismiss?: () => void
}

export function SuccessAlert({ title, description, dismissible, onDismiss, className, ...props }: AlertProps) {
  return (
    <Alert variant="success" className={className} {...props}>
      <CheckCircle className="h-4 w-4" />
      <div className="flex-1">
        {title && <AlertTitle>{title}</AlertTitle>}
        {description && <AlertDescription>{description}</AlertDescription>}
      </div>
      {dismissible && (
        <button
          onClick={onDismiss}
          className="ml-auto text-success-600 hover:text-success-800"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </Alert>
  )
}

export function ErrorAlert({ title, description, dismissible, onDismiss, className, ...props }: AlertProps) {
  return (
    <Alert variant="destructive" className={className} {...props}>
      <AlertTriangle className="h-4 w-4" />
      <div className="flex-1">
        {title && <AlertTitle>{title}</AlertTitle>}
        {description && <AlertDescription>{description}</AlertDescription>}
      </div>
      {dismissible && (
        <button
          onClick={onDismiss}
          className="ml-auto text-error-600 hover:text-error-800"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </Alert>
  )
}

export function WarningAlert({ title, description, dismissible, onDismiss, className, ...props }: AlertProps) {
  return (
    <Alert variant="warning" className={className} {...props}>
      <AlertTriangle className="h-4 w-4" />
      <div className="flex-1">
        {title && <AlertTitle>{title}</AlertTitle>}
        {description && <AlertDescription>{description}</AlertDescription>}
      </div>
      {dismissible && (
        <button
          onClick={onDismiss}
          className="ml-auto text-warning-600 hover:text-warning-800"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </Alert>
  )
}

export function InfoAlert({ title, description, dismissible, onDismiss, className, ...props }: AlertProps) {
  return (
    <Alert variant="info" className={className} {...props}>
      <Info className="h-4 w-4" />
      <div className="flex-1">
        {title && <AlertTitle>{title}</AlertTitle>}
        {description && <AlertDescription>{description}</AlertDescription>}
      </div>
      {dismissible && (
        <button
          onClick={onDismiss}
          className="ml-auto text-primary-600 hover:text-primary-800"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </Alert>
  )
}

export { Alert, AlertTitle, AlertDescription }
