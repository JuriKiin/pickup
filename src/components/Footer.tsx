import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { CHANGELOG } from '../constants';

interface FooterProps {
  totalAttendance: number;
  teamsCount: number;
}

export function Footer({ totalAttendance, teamsCount }: FooterProps) {
  const [showChangelog, setShowChangelog] = useState(false);

  return (
    <>
      <AnimatePresence>
        {showChangelog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 dark:bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-900 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl border border-gray-100 dark:border-gray-800 max-h-[80vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                 <h3 className="text-xl font-black uppercase tracking-tight text-gray-900 dark:text-white">Changelog</h3>
                 <button onClick={() => setShowChangelog(false)} className="text-gray-400 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-gray-800 rounded-full p-2 transition-colors">
                   <X size={20} />
                 </button>
              </div>
              <div className="space-y-6">
                {CHANGELOG.map(log => (
                  <div key={log.version}>
                    <div className="flex items-baseline gap-2 mb-2">
                       <span className="font-black text-emerald-500">{log.version}</span>
                       <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{log.date}</span>
                    </div>
                    <ul className="space-y-2">
                      {log.changes.map((c, i) => (
                        <li key={i} className="text-sm font-medium text-gray-600 dark:text-gray-300 flex items-start gap-2">
                          <span className="text-emerald-500 mt-0.5">•</span> 
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <button 
                onClick={() => setShowChangelog(false)} 
                className="w-full mt-8 py-3 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <footer className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-t border-gray-100 dark:border-gray-800 p-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between text-[10px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-widest">
          <span>{totalAttendance} Players • {teamsCount} Teams</span>
          <button onClick={() => setShowChangelog(true)} className="hover:text-gray-900 dark:hover:text-white transition-colors flex items-center gap-1 active:scale-95">
            {CHANGELOG[0].version} (Changelog)
          </button>
        </div>
      </footer>
    </>
  );
}
