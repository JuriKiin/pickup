import React, { useState } from 'react';
import { Trophy, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../utils';

interface HeaderProps {
  activeTheme: any;
  handleReset: () => void;
}

export function Header({ activeTheme, handleReset }: HeaderProps) {
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  return (
    <>
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-300", activeTheme.primary, activeTheme.text)}>
              <Trophy size={18} />
            </div>
            <h1 className="font-bold text-lg tracking-tight">Pickup Table</h1>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowResetConfirm(true)}
              className="p-2 text-gray-400 hover:text-red-600 transition-colors"
              title="Reset All"
            >
              <RotateCcw size={20} />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {showResetConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-900 rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-gray-100 dark:border-gray-800"
            >
              <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-center justify-center text-red-600 mb-6 mx-auto">
                <RotateCcw size={32} />
              </div>
              <h3 className="text-xl font-bold text-center mb-2">Reset Everything?</h3>
              <p className="text-gray-500 dark:text-gray-400 text-center text-sm mb-8">
                This will clear all teams, scores, and standings. This action cannot be undone.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setShowResetConfirm(false)}
                  className="py-3 px-4 rounded-xl font-bold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    handleReset();
                    setShowResetConfirm(false);
                  }}
                  className="py-3 px-4 rounded-xl font-bold bg-red-600 text-white hover:bg-red-700 transition-colors shadow-lg shadow-red-200 dark:shadow-none"
                >
                  Reset
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
