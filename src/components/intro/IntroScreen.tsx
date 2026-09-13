import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { audioManager } from "../../lib/audioManager";
import { APP_IDENTITY, MASCOT, TIMINGS } from "../../config";
import styles from "./IntroScreen.module.css";

interface IntroScreenProps {
  onEnter: () => void;
}

export default function IntroScreen({ onEnter }: IntroScreenProps) {
  const [leaving, setLeaving] = useState(false);

  function handleTap() {
    if (leaving) return;
    // First user gesture in the app — unlock mobile audio right here so the
    // global click SFX (and every later in-app sound) is actually audible.
    audioManager.unlock();
    setLeaving(true);
    // Let the exit animation play before mounting the home screen.
    window.setTimeout(onEnter, TIMINGS.introEnterDelayMs);
  }

  return (
    <AnimatePresence>
      {!leaving && (
        <motion.button
          type="button"
          onClick={handleTap}
          aria-label="Touch to start"
          className={styles.screen}
          exit={{ opacity: 0, scale: 1.08 }}
          transition={{ duration: TIMINGS.introExitAnimationMs / 1000, ease: "easeInOut" }}
        >
          <motion.img
            src={MASCOT.src}
            alt={MASCOT.alt}
            className={styles.mascot}
            initial={{ y: 10, opacity: 0, scale: 0.85 }}
            animate={{ y: [0, -10, 0], opacity: 1, scale: 1 }}
            transition={{
              opacity: { duration: 0.6 },
              scale: { duration: 0.6, ease: "backOut" },
              y: { duration: 2.4, repeat: Infinity, ease: "easeInOut", delay: 0.6 },
            }}
          />

          <motion.div
            className={styles.titleBlock}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.5 }}
          >
            <h1 className={styles.title}>{APP_IDENTITY.name.toUpperCase()}</h1>
            <p className={styles.tagline}>{APP_IDENTITY.tagline}</p>
          </motion.div>

          <motion.p
            className={styles.prompt}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.4 }}
          >
            <motion.span
              animate={{ opacity: [1, 0.35, 1] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            >
              TOUCH TO START
            </motion.span>
          </motion.p>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
