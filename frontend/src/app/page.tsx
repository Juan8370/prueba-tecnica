'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import { HiClipboardList } from 'react-icons/hi';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) return null;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-white to-indigo-50 dark:from-slate-950 dark:to-slate-900 p-6 text-center transition-colors duration-300">
      <div className="absolute top-8 right-8">
        <ThemeToggle />
      </div>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl"
      >
        <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-600 rounded-2xl text-white shadow-2xl shadow-indigo-200 dark:shadow-indigo-900/20 mb-8">
          <HiClipboardList size={40} />
        </div>
        <h1 className="text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-4">
          Gestión de <span className="text-indigo-600 dark:text-indigo-400">Prescripciones</span>
        </h1>
        <p className="text-xl text-gray-600 dark:text-slate-400 mb-10 leading-relaxed">
          Una plataforma segura y eficiente para médicos y pacientes. Administra recetas médicas con facilidad y seguridad.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => router.push('/login')}
            className="px-8 py-4 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-100 dark:shadow-none hover:bg-indigo-700 hover:shadow-indigo-200 transition-all"
          >
            Comenzar ahora
          </button>
        </div>
      </motion.div>
    </main>
  );
}
