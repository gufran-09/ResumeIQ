'use client';

import { motion } from 'framer-motion';
import { FileText } from 'lucide-react';
import { APP_NAME } from '@/constants';

export function LoadingScreen() {
  return (
    <div className="flex h-screen flex-col items-center justify-center bg-background">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center gap-4"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg"
        >
          <FileText className="h-7 w-7" />
        </motion.div>
        <div className="text-center">
          <p className="text-sm font-semibold">{APP_NAME}</p>
          <p className="text-xs text-muted-foreground">Loading...</p>
        </div>
      </motion.div>
    </div>
  );
}
