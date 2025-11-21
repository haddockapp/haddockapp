import { FC } from "react";
import { AnimatePresence, motion } from "framer-motion";

const HaddockSpinner: FC = () => (
  <div className="w-36 mx-auto">
    <AnimatePresence>
      <motion.img
        animate={{
          opacity: [0, 1, 1, 1, 1, 0],
          scale: [1, 2.2, 1.8, 2, 1.8, 0],
          rotate: [0, 360, 360, 360, 360, 360],
        }}
        transition={{
          duration: 2,
          ease: "easeInOut",
          times: [0, 0.2, 0.5, 1, 0.8, 0.2, 0.1],
          repeat: Infinity,
          repeatDelay: 0.1,
        }}
        className="origin-center rounded-full"
        src="/haddock.png"
      />
    </AnimatePresence>
  </div>
);

const HaddockLoader: FC = () => (
  <div className="h-screen items-center justify-center flex flex-col">
    <HaddockSpinner />
  </div>
);

export default HaddockSpinner;
export { HaddockLoader };
