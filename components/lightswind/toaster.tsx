"use client";

import * as React from "react";
import { AnimatePresence } from "framer-motion";
import { useToast } from "./use-toast";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastTitle,
  ToastViewport,
  type ToastPosition,
} from "./toast";

export interface ToasterProps {
  position?: ToastPosition;
}

export function Toaster({ position = "top-right" }: ToasterProps) {
  const { toasts } = useToast();

  return (
    <ToastViewport position={position}>
      <AnimatePresence mode="popLayout">
        {toasts.map(function ({ id, title, description, action, open, ...props }) {
          if (open === false) return null;

          return (
            <Toast key={id} open={open} {...props}>
              <div className="grid gap-1">
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && (
                  <ToastDescription>{description}</ToastDescription>
                )}
              </div>
              {action}
            </Toast>
          );
        })}
      </AnimatePresence>
    </ToastViewport>
  );
}
