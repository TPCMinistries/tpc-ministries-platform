"use client"

import * as React from "react"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { Check, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { shakeError, checkmarkSpring } from "@/components/motion/variants"

// ---- FormField wrapper ----

interface FormFieldProps {
  /** Unique ID linking label, input, and error message */
  id: string
  label: string
  /** Error message string. Presence triggers error state styling. */
  error?: string
  /** Show success indicator (green checkmark). */
  success?: boolean
  /** Mark field as required (adds aria-required and asterisk). */
  required?: boolean
  /** Additional description shown below the field (linked via aria-describedby). */
  description?: string
  className?: string
  children: React.ReactNode
}

export function FormField({
  id,
  label,
  error,
  success,
  required,
  description,
  className,
  children,
}: FormFieldProps) {
  const shouldReduceMotion = useReducedMotion()
  const errorId = `${id}-error`
  const descId = `${id}-desc`

  const hasError = Boolean(error)

  return (
    <div className={cn("space-y-2", className)}>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-foreground"
      >
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </label>

      <div className="relative">
        {/* Wrap children in shake animation on error */}
        {shouldReduceMotion ? (
          <div>{children}</div>
        ) : (
          <motion.div
            variants={shakeError}
            animate={hasError ? "shake" : undefined}
          >
            {children}
          </motion.div>
        )}

        {/* Success checkmark */}
        <AnimatePresence>
          {success && !hasError && (
            shouldReduceMotion ? (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Check className="h-4 w-4 text-success" />
              </div>
            ) : (
              <motion.div
                className="absolute right-3 top-1/2 -translate-y-1/2"
                variants={checkmarkSpring}
                initial="hidden"
                animate="visible"
                exit="hidden"
              >
                <Check className="h-4 w-4 text-success" />
              </motion.div>
            )
          )}
        </AnimatePresence>
      </div>

      {/* Description text */}
      {description && !hasError && (
        <p id={descId} className="text-xs text-muted-foreground">
          {description}
        </p>
      )}

      {/* Error message */}
      <AnimatePresence>
        {hasError && (
          shouldReduceMotion ? (
            <p id={errorId} className="text-xs text-destructive" role="alert">
              {error}
            </p>
          ) : (
            <motion.p
              id={errorId}
              className="text-xs text-destructive"
              role="alert"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
            >
              {error}
            </motion.p>
          )
        )}
      </AnimatePresence>
    </div>
  )
}

// ---- FormInput ----

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
  success?: boolean
}

export const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  ({ className, error, success, id, ...props }, ref) => {
    const errorId = id ? `${id}-error` : undefined
    const descId = id ? `${id}-desc` : undefined

    return (
      <input
        ref={ref}
        id={id}
        className={cn(
          "flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-base shadow-sm transition-all duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          error
            ? "border-destructive focus-visible:ring-destructive/40"
            : success
            ? "border-success focus-visible:ring-success/40"
            : "border-input focus-visible:border-gold-400",
          className
        )}
        aria-invalid={error || undefined}
        aria-describedby={error ? errorId : descId}
        aria-required={props.required || undefined}
        {...props}
      />
    )
  }
)
FormInput.displayName = "FormInput"

// ---- FormTextarea ----

interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean
  success?: boolean
}

export const FormTextarea = React.forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  ({ className, error, success, id, ...props }, ref) => {
    const errorId = id ? `${id}-error` : undefined
    const descId = id ? `${id}-desc` : undefined

    return (
      <textarea
        ref={ref}
        id={id}
        className={cn(
          "flex min-h-[80px] w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-sm transition-all duration-200 placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 md:text-sm resize-y",
          error
            ? "border-destructive focus-visible:ring-destructive/40"
            : success
            ? "border-success focus-visible:ring-success/40"
            : "border-input focus-visible:border-gold-400",
          className
        )}
        aria-invalid={error || undefined}
        aria-describedby={error ? errorId : descId}
        aria-required={props.required || undefined}
        {...props}
      />
    )
  }
)
FormTextarea.displayName = "FormTextarea"

// ---- FormSelect ----

interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean
  success?: boolean
}

export const FormSelect = React.forwardRef<HTMLSelectElement, FormSelectProps>(
  ({ className, error, success, id, children, ...props }, ref) => {
    const errorId = id ? `${id}-error` : undefined
    const descId = id ? `${id}-desc` : undefined

    return (
      <select
        ref={ref}
        id={id}
        className={cn(
          "flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-base shadow-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          error
            ? "border-destructive focus-visible:ring-destructive/40"
            : success
            ? "border-success focus-visible:ring-success/40"
            : "border-input focus-visible:border-gold-400",
          className
        )}
        aria-invalid={error || undefined}
        aria-describedby={error ? errorId : descId}
        aria-required={props.required || undefined}
        {...props}
      >
        {children}
      </select>
    )
  }
)
FormSelect.displayName = "FormSelect"

// ---- SubmitButton ----

type SubmitStatus = "idle" | "loading" | "success" | "error"

interface SubmitButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  status?: SubmitStatus
  loadingText?: string
  successText?: string
}

export function SubmitButton({
  children,
  status = "idle",
  loadingText = "Saving...",
  successText = "Saved!",
  className,
  disabled,
  ...props
}: SubmitButtonProps) {
  const shouldReduceMotion = useReducedMotion()

  const isDisabled = disabled || status === "loading" || status === "success"

  const content = (() => {
    switch (status) {
      case "loading":
        return (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>{loadingText}</span>
          </>
        )
      case "success":
        if (shouldReduceMotion) {
          return (
            <>
              <Check className="h-4 w-4 text-success" />
              <span>{successText}</span>
            </>
          )
        }
        return (
          <>
            <motion.span
              variants={checkmarkSpring}
              initial="hidden"
              animate="visible"
            >
              <Check className="h-4 w-4 text-success" />
            </motion.span>
            <span>{successText}</span>
          </>
        )
      default:
        return children
    }
  })()

  return (
    <button
      type="submit"
      disabled={isDisabled}
      className={cn(
        "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97]",
        "bg-navy text-white shadow hover:bg-navy-800 h-9 px-4 py-2",
        status === "success" && "bg-success hover:bg-success",
        className
      )}
      {...props}
    >
      {content}
    </button>
  )
}
