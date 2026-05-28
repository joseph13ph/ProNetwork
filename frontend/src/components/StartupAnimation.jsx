import { motion, AnimatePresence } from "framer-motion";

const StartupAnimation = ({ show }) => {
  return (
    <AnimatePresence>
      {show ? (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950"
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.98, opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex flex-col items-center gap-4"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
              className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 via-fuchsia-500 to-cyan-400 text-2xl font-black text-white shadow-2xl shadow-purple-500/30"
            >
              PC
            </motion.div>
            <div className="text-center">
              <p className="text-sm uppercase tracking-[0.3em] text-white/60">ProNetwork</p>
              <h1 className="mt-2 text-3xl font-bold text-white">Conectando profesionales</h1>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};

export default StartupAnimation;
