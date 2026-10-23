'use client';

import { CheckCircle2, CircleDashed } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

import { cn } from "@/lib/utils";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

interface StatusButtonProps {
  label: string;
  onAdd: () => void;
  className?: string;
}

export default function StatusButton({ label, onAdd, className }: StatusButtonProps) {
  const [status, setStatus] = useState<"loading" | "added" | null>(null);
  const isEnabled = status === null;

  const changeStatus = async () => {
    if (!isEnabled) {
      return;
    }

    setStatus("loading");
    await wait(700);
    onAdd();
    setStatus("added");
    await wait(1400);
    setStatus(null);
  };

  return (
    <button
      type="button"
      onClick={changeStatus}
      disabled={!isEnabled}
      className={cn(
        "group/status w-full py-2 sm:py-3 px-3 font-sans font-bold text-[10.5px] leading-4 sm:text-xs uppercase tracking-wider shadow-2xs rounded-md bg-[#caa04c] text-white hover:bg-[#b88f3e] active:scale-98 disabled:hover:bg-[#caa04c] transition-all duration-300 cursor-pointer disabled:cursor-default",
        className
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          // Remount so the enter/exit animation restarts for every status
          key={status ?? "idle"}
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 15 }}
          transition={{ duration: 0.075 }}
          className="flex items-center justify-center gap-1"
          aria-live="polite"
        >
          {status === "added" && (
            <motion.span
              className="h-fit w-fit"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.075, type: "spring" }}
            >
              <CheckCircle2 className="h-4 w-4 fill-white stroke-[#caa04c] group-hover/status:stroke-[#b88f3e]" />
            </motion.span>
          )}

          {status === "loading" ? (
            <CircleDashed className="h-4 w-4 animate-spin" />
          ) : status === "added" ? (
            "Added to Cart"
          ) : (
            label
          )}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
