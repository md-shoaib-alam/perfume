import * as React from "react";
import { cn } from "@/components/lib/utils";
import { 
  X, 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  Loader2 
} from "lucide-react";
import { cva } from "class-variance-authority";
import { motion, type HTMLMotionProps } from "framer-motion";

/* Toast Components */
const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  return <div className="toast-provider">{children}</div>;
};

export type ToastPosition =
  | "top-right"
  | "top-left"
  | "bottom-right"
  | "bottom-left"
  | "top-center"
  | "bottom-center";

const toastViewportVariants = cva(
  "fixed z-[9999] flex flex-col gap-2 p-2 sm:p-4 w-full sm:max-w-[420px] pointer-events-none transition-all duration-300",
  {
    variants: {
      position: {
        "top-right": "top-2 sm:top-5 right-0 sm:right-5 left-0 sm:left-auto flex-col items-center sm:items-end px-3 sm:px-0",
        "top-left": "top-2 sm:top-5 left-0 sm:left-5 right-0 sm:right-auto flex-col items-center sm:items-start px-3 sm:px-0",
        "bottom-right": "bottom-2 sm:bottom-5 right-0 sm:right-5 left-0 sm:left-auto flex-col-reverse items-center sm:items-end px-3 sm:px-0",
        "bottom-left": "bottom-2 sm:bottom-5 left-0 sm:left-5 right-0 sm:right-auto flex-col-reverse items-center sm:items-start px-3 sm:px-0",
        "top-center": "top-2 sm:top-5 left-1/2 -translate-x-1/2 flex-col items-center px-3 sm:px-0",
        "bottom-center": "bottom-2 sm:bottom-5 left-1/2 -translate-x-1/2 flex-col-reverse items-center px-3 sm:px-0",
      },
    },
    defaultVariants: {
      position: "top-right",
    },
  }
);

export interface ToastViewportProps
  extends React.HTMLAttributes<HTMLDivElement> {
  position?: ToastPosition;
}

const ToastViewport = React.forwardRef<HTMLDivElement, ToastViewportProps>(
  ({ className, position = "top-right", ...props }, ref) => (
    <div
      ref={ref}
      className={cn(toastViewportVariants({ position }), className)}
      {...props}
    />
  )
);
ToastViewport.displayName = "ToastViewport";

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full max-w-[calc(100vw-24px)] sm:max-w-[390px] items-center justify-between gap-2.5 sm:gap-3 overflow-hidden rounded-xl sm:rounded-2xl border p-3.5 sm:p-4 pr-9 sm:pr-10 shadow-xl sm:shadow-2xl backdrop-blur-2xl transition-all duration-200",
  {
    variants: {
      variant: {
        default: 
          "border-slate-200/80 bg-white/70 text-slate-900 shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.9),0_14px_36px_-6px_rgba(0,0,0,0.12)] shadow-slate-950/5",
        destructive: 
          "border-rose-500/25 bg-rose-50/60 text-rose-950 shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.8),0_14px_36px_-6px_rgba(244,63,94,0.15)]",
        success: 
          "border-emerald-500/25 bg-emerald-50/60 text-emerald-950 shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.8),0_14px_36px_-6px_rgba(16,185,129,0.15)]",
        warning: 
          "border-amber-500/25 bg-amber-50/60 text-amber-950 shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.8),0_14px_36px_-6px_rgba(245,158,11,0.15)]",
        info: 
          "border-sky-500/25 bg-sky-50/60 text-sky-950 shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.8),0_14px_36px_-6px_rgba(14,165,233,0.15)]",
        loading: 
          "border-amber-500/25 bg-amber-50/60 text-amber-950 shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.8),0_14px_36px_-6px_rgba(245,158,11,0.15)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface ToastProps extends Omit<HTMLMotionProps<"div">, "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart" | "onAnimationEnd"> {
  variant?: "default" | "destructive" | "success" | "warning" | "info" | "loading";
  duration?: number;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onClose?: () => void;
  icon?: React.ReactNode;
  avatar?: string;
  showProgress?: boolean;
}

const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  (
    {
      className,
      variant = "default",
      duration = 2200,
      open = true,
      onOpenChange,
      onClose,
      children,
      icon,
      avatar,
      showProgress = true,
      style,
      ...props
    },
    ref
  ) => {
    const [paused, setPaused] = React.useState(false);
    const durationMs = duration !== undefined ? duration : 2200;

    // Auto dismiss after duration, paused when hovered
    React.useEffect(() => {
      if (!open || durationMs === Infinity || durationMs <= 0 || paused) return;

      const timer = setTimeout(() => {
        onOpenChange?.(false);
        onClose?.();
      }, durationMs);

      return () => clearTimeout(timer);
    }, [open, durationMs, paused, onOpenChange, onClose]);

    const defaultIcons = {
      default: null,
      success: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
      destructive: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />,
      warning: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />,
      info: <Info className="w-5 h-5 text-sky-600 shrink-0" />,
      loading: <Loader2 className="w-5 h-5 text-[#caa04c] animate-spin shrink-0" />,
    };

    const activeIcon = icon !== undefined ? icon : defaultIcons[variant];

    return (
      <motion.div
        ref={ref}
        layout
        drag
        dragDirectionLock
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        dragElastic={{ top: 0.7, bottom: 0.15, left: 0.7, right: 0.7 }}
        onDragStart={() => setPaused(true)}
        onDragEnd={(_event, info) => {
          setPaused(false);
          const isDismiss =
            Math.abs(info.offset.x) > 45 ||
            Math.abs(info.velocity.x) > 250 ||
            Math.abs(info.offset.y) > 30 ||
            Math.abs(info.velocity.y) > 200;
          if (isDismiss) {
            onOpenChange?.(false);
            onClose?.();
          }
        }}
        initial={{ opacity: 0, y: -12, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -14, scale: 0.92, transition: { duration: 0.15 } }}
        transition={{
          type: "spring",
          damping: 24,
          stiffness: 350,
        }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        style={{
          backdropFilter: "blur(24px) saturate(190%)",
          WebkitBackdropFilter: "blur(24px) saturate(190%)",
          touchAction: "none",
          ...style,
        }}
        className={cn(
          toastVariants({ variant }),
          "relative z-50 overflow-hidden font-sans select-none cursor-grab active:cursor-grabbing",
          className
        )}
        {...props}
      >
        <div className="flex items-start gap-3 w-full">
          {avatar ? (
            <img
              src={avatar}
              alt="Avatar"
              className="w-8 h-8 rounded-full object-cover shrink-0 border border-slate-200 shadow-xs"
            />
          ) : (
            activeIcon && <div className="mt-0.5 shrink-0">{activeIcon}</div>
          )}

          <div className="flex-1 min-w-0 pr-2">{children as React.ReactNode}</div>
        </div>

        {/* Progress Bar with pause on hover */}
        {showProgress && durationMs !== Infinity && durationMs > 0 && variant !== "loading" && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/5 overflow-hidden">
            <div
              style={{
                animation: `toastProgressShrink ${durationMs}ms linear forwards`,
                animationPlayState: paused ? "paused" : "running",
                transformOrigin: "left center",
              }}
              className={cn(
                "h-full w-full",
                variant === "destructive" ? "bg-rose-500" :
                variant === "success" ? "bg-emerald-500" :
                variant === "warning" ? "bg-amber-500" :
                variant === "info" ? "bg-sky-500" :
                "bg-[#d8a753]"
              )}
            />
            <style>{`
              @keyframes toastProgressShrink {
                from { transform: scaleX(1); }
                to { transform: scaleX(0); }
              }
            `}</style>
          </div>
        )}

        {/* Single clean close button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenChange?.(false);
            onClose?.();
          }}
          className="absolute right-2.5 top-3 p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-all cursor-pointer z-20"
          aria-label="Close toast"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </motion.div>
    );
  }
);
Toast.displayName = "Toast";

const ToastClose = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "p-1 text-slate-400 opacity-70 transition-opacity hover:text-slate-800 hover:opacity-100 cursor-pointer",
      className
    )}
    aria-label="Close toast"
    {...props}
  >
    <X className="h-3.5 w-3.5" />
  </button>
));
ToastClose.displayName = "ToastClose";

const ToastTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn("text-[13px] sm:text-sm font-semibold text-slate-900 tracking-tight leading-snug", className)}
    {...props}
  />
));
ToastTitle.displayName = "ToastTitle";

const ToastDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-[11.5px] sm:text-xs text-slate-600 mt-0.5 leading-relaxed", className)}
    {...props}
  />
));
ToastDescription.displayName = "ToastDescription";

export interface ToastActionElementProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  altText?: string;
}

const ToastAction = React.forwardRef<
  HTMLButtonElement,
  ToastActionElementProps
>(({ className, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "inline-flex h-7 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-800 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-1 focus:ring-[#d8a753] disabled:pointer-events-none disabled:opacity-50 cursor-pointer mt-1.5 shadow-2xs",
      className
    )}
    {...props}
  />
));
ToastAction.displayName = "ToastAction";

export {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
};
