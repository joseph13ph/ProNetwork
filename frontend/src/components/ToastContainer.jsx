import { motion, AnimatePresence } from "framer-motion";

const ToastItem = ({ toast }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 10 }}
    transition={{ duration: 0.2 }}
    className={`max-w-sm rounded-xl2 p-3 shadow-md ${toast.type === "error" ? "bg-red-600 text-white" : "bg-white/90 text-black"}`}
  >
    {toast.message}
  </motion.div>
);

const ToastContainer = ({ toasts = [] }) => (
  <div className="fixed right-4 top-20 z-50 flex flex-col gap-3">
    <AnimatePresence initial={false}>
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} />
      ))}
    </AnimatePresence>
  </div>
);

export default ToastContainer;
