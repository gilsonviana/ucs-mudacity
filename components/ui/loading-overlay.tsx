"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

export interface LoadingOverlayProps {
  open: boolean;
  /** Main status message */
  message?: string;
  /** Optional sub text / description */
  description?: string;
  /** data-test-id override */
  testId?: string;
  /** Tailwind size for spinner (height/width) */
  spinnerSize?: number;
  /** Apply backdrop blur */
  blur?: boolean;
  /** Custom className for outer container */
  className?: string;
  /** Optional allow clicking background to close */
  onBackgroundClick?: () => void;
  children?: React.ReactNode;
}

/**
 * Generic full-screen loading overlay with centered spinner + message.
 * Designed for auth flows, data fetching gates, etc.
 */
export function LoadingOverlay({
  open,
  message = "Carregando...",
  description,
  testId = "loading-overlay",
  spinnerSize = 40,
  blur = true,
  className,
  onBackgroundClick,
  children,
}: LoadingOverlayProps) {
  if (!open) return null;
  const sizeClass = `h-[${spinnerSize}px] w-[${spinnerSize}px]`;
  return (
    <div
      data-test-id={testId}
      className={cn(
        "fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/70",
        blur && "backdrop-blur-sm",
        className
      )}
      onClick={onBackgroundClick}
    >
      <div className="flex flex-col items-center gap-4" onClick={(e) => e.stopPropagation()}>
        <div className={cn(sizeClass, "rounded-full border-4 border-blue-600 border-t-transparent animate-spin" )} />
        {message && <p className="text-sm font-medium text-gray-700 text-center px-4">{message}</p>}
        {description && (
          <p className="text-xs text-gray-500 max-w-sm text-center px-4">{description}</p>
        )}
        {children}
      </div>
    </div>
  );
}

export default LoadingOverlay;
