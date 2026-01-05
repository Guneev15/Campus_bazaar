"use client";

import { motion } from "framer-motion";

interface SlideUpProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  offset?: number;
  className?: string;
}

export function SlideUp({ children, delay = 0, duration = 0.5, offset = 20, className = "" }: SlideUpProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: offset }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
