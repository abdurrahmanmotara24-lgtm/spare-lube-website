import { AnimatePresence, motion } from "framer-motion";
import { useId } from "react";

interface ThemeToggleIconProps {
  isDarkMode: boolean;
  reducedMotion: boolean;
  className?: string;
}

const iconTransition = {
  duration: 0.68,
  ease: [0.19, 0.95, 0.22, 1] as const,
};

export const ThemeToggleIcon = ({ isDarkMode, reducedMotion, className }: ThemeToggleIconProps) => {
  const isNight = isDarkMode;
  const clipId = useId().replace(/:/g, "");

  if (reducedMotion) {
    return (
      <span className={className}>
        <AnimatePresence mode="wait" initial={false}>
          {isNight ? (
            <motion.span
              key="moon"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.16, ease: "easeOut" }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
                <circle cx="12" cy="12" r="5.7" fill="currentColor" opacity="0.95" />
                <circle cx="15.2" cy="9.9" r="5.1" fill="hsl(var(--background))" />
              </svg>
            </motion.span>
          ) : (
            <motion.span
              key="sun"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.16, ease: "easeOut" }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
                <circle cx="12" cy="12" r="5" className="fill-current" />
              </svg>
            </motion.span>
          )}
        </AnimatePresence>
      </span>
    );
  }

  return (
    <motion.span
      className={className}
      initial={false}
      animate={{ scale: 1 }}
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4 overflow-visible" aria-hidden="true">
        <defs>
          <clipPath id={clipId}>
            <rect x="0" y="0" width="24" height="15.5" />
          </clipPath>
        </defs>

        <motion.circle
          cx="12"
          cy="12.3"
          r="5"
          clipPath={`url(#${clipId})`}
          initial={false}
          animate={isNight ? { y: 7.2, opacity: 0.16 } : { y: -2.3, opacity: 1 }}
          transition={isNight ? { ...iconTransition, delay: 0.04 } : { ...iconTransition, delay: 0.18 }}
          fill="#f59e0b"
          stroke="#f97316"
          strokeWidth="1"
        />

        <motion.g
          clipPath={`url(#${clipId})`}
          initial={false}
          animate={isNight ? { y: -2.2, opacity: 1 } : { y: 7, opacity: 0.08 }}
          transition={isNight ? { ...iconTransition, delay: 0.36 } : { ...iconTransition, delay: 0.04 }}
        >
          <circle cx="12" cy="12.3" r="5.75" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="0.85" />
          <circle cx="15.3" cy="10.2" r="5.15" fill="hsl(var(--background))" />
        </motion.g>

        <motion.circle
          cx="12"
          cy="12.3"
          r="7"
          clipPath={`url(#${clipId})`}
          fill="#f59e0b"
          initial={false}
          animate={isNight ? { y: 7.2, opacity: 0 } : { y: -2.3, opacity: 0.09 }}
          transition={isNight ? { ...iconTransition, delay: 0.04 } : { ...iconTransition, delay: 0.18 }}
        />
        <motion.circle
          cx="16.5"
          cy="8.8"
          r="5.2"
          clipPath={`url(#${clipId})`}
          fill="#e2e8f0"
          initial={false}
          animate={isNight ? { y: -2.2, opacity: 0.06 } : { y: 7, opacity: 0 }}
          transition={isNight ? { ...iconTransition, delay: 0.36 } : { ...iconTransition, delay: 0.04 }}
        />

        <motion.path
          d="M3.5 15.5h17"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          initial={false}
          animate={isNight ? { opacity: 0.92 } : { opacity: 0.78 }}
          transition={{ duration: 0.48, ease: [0.2, 0.9, 0.25, 1] }}
        />
      </svg>
    </motion.span>
  );
};
