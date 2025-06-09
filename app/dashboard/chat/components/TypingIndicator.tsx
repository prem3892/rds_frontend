import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TypingIndicatorProps {
  isTyping: boolean;
  customerName: string;
}

const TypingIndicator = ({ isTyping, customerName }: TypingIndicatorProps) => (
  <AnimatePresence>
    {isTyping && (
      <motion.div
        className="px-4 pt-1.5 pb-1.5 flex items-center"
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.2 }}
      >
        <div className="bg-muted dark:bg-slate-700 py-1.5 px-3.5 rounded-full flex items-center shadow-sm max-w-max">
          <div className="flex space-x-1 mr-2">
            <motion.span
              className="w-1.5 h-1.5 bg-muted-foreground/70 dark:bg-slate-400 rounded-full"
              animate={{ y: [0, -4, 0] }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0,
              }}
            />
            <motion.span
              className="w-1.5 h-1.5 bg-muted-foreground/70 dark:bg-slate-400 rounded-full"
              animate={{ y: [0, -4, 0] }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.2,
              }}
            />
            <motion.span
              className="w-1.5 h-1.5 bg-muted-foreground/70 dark:bg-slate-400 rounded-full"
              animate={{ y: [0, -4, 0] }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.4,
              }}
            />
          </div>
          <span className="text-xs text-muted-foreground">
            {customerName || "Customer"} is typing
          </span>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

export default TypingIndicator;
