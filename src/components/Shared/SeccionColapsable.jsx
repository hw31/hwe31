import React, { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const SeccionColapsable = ({ titulo, children, inicialAbierto = true }) => {
  const [abierto, setAbierto] = useState(inicialAbierto);

  return (
    <div className="mb-6 border rounded-lg shadow-sm overflow-hidden">
      <button
        className="flex justify-between items-center w-full px-4 py-2 font-semibold text-left bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
        onClick={() => setAbierto(!abierto)}
      >
        <span>{titulo}</span>
        {abierto ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
      </button>

      <AnimatePresence initial={false}>
        {abierto && (
          <motion.div
            key="contenido"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden bg-white dark:bg-gray-900 px-4 py-4"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SeccionColapsable;
