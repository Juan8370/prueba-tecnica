'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { HiUserCircle, HiLogout, HiIdentification, HiShieldCheck, HiPlus, HiOutlineClipboardList } from 'react-icons/hi';
import { RiDashboardLine } from 'react-icons/ri';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-indigo-200 dark:bg-indigo-900/40 rounded-full mb-4"></div>
          <div className="h-4 w-24 bg-indigo-100 dark:bg-indigo-900/20 rounded"></div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex flex-col transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-md">
              <RiDashboardLine size={24} />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white hidden sm:block">MediAdmin</span>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{user.name || user.email}</p>
              <p className="text-xs text-gray-500 dark:text-slate-400 uppercase tracking-wider">{user.role}</p>
            </div>
            <button
              onClick={logout}
              className="p-2 text-gray-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
              title="Cerrar Sesión"
            >
              <HiLogout size={24} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Bienvenido al Panel de Control</h2>
            <p className="text-gray-500 dark:text-slate-400">Aquí tienes un resumen de tu perfil y accesos.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* User Profile Card */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 flex flex-col items-center text-center"
            >
              <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4 shadow-inner">
                <HiUserCircle size={48} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">{user.name || 'Usuario'}</h3>
              <p className="text-gray-500 dark:text-slate-400 text-sm mb-4">{user.email}</p>
              <div className="w-full pt-4 border-t border-gray-50 dark:border-slate-800 flex justify-between items-center px-2">
                <div className="flex items-center gap-1 text-gray-400 dark:text-slate-500">
                  <HiIdentification />
                  <span className="text-xs">ID: {user.id.substring(0, 8)}...</span>
                </div>
                <div className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs font-bold rounded-full border border-green-100 dark:border-green-900/30">
                  <HiShieldCheck />
                  {user.role.toUpperCase()}
                </div>
              </div>
            </motion.div>

            {/* Quick Stats or Info */}
            <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 dark:from-indigo-700 dark:to-indigo-900 p-6 rounded-2xl text-white shadow-lg shadow-indigo-100 dark:shadow-none">
                <h4 className="text-indigo-100 text-sm font-semibold uppercase tracking-wider mb-2">Rol Asignado</h4>
                <p className="text-3xl font-bold mb-4">{user.role}</p>
                <p className="text-indigo-100 text-sm opacity-80">
                  Tienes permisos de {user.role === 'admin' ? 'administrador total' : user.role === 'doctor' ? 'gestión médica' : 'consulta de paciente'}.
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800">
                <h4 className="text-gray-400 dark:text-slate-500 text-sm font-semibold uppercase tracking-wider mb-2">Estado de Sesión</h4>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">Activa</p>
                </div>
                <p className="text-gray-500 dark:text-slate-400 text-sm">
                  Tu sesión se mantiene persistente gracias a las cookies de seguridad.
                </p>
              </div>

              {/* Doctor Specific Actions */}
              {user.role === 'doctor' && (
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-indigo-100 dark:border-indigo-900/30 flex flex-col justify-between"
                >
                  <div>
                    <h4 className="text-indigo-600 dark:text-indigo-400 text-sm font-semibold uppercase tracking-wider mb-2">Acciones Médicas</h4>
                    <p className="text-xl font-bold text-gray-900 dark:text-white mb-2">Nueva Prescripción</p>
                    <p className="text-gray-500 dark:text-slate-400 text-sm mb-6">
                      Crea una nueva receta médica para tus pacientes de forma rápida.
                    </p>
                  </div>
                  <button
                    onClick={() => router.push('/doctor/prescriptions/new')}
                    className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 dark:shadow-none"
                  >
                    <HiPlus size={20} /> Crear ahora
                  </button>
                </motion.div>
              )}
              {/* Patient Specific Actions */}
              {user.role === 'patient' && (
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-green-100 dark:border-green-900/30 flex flex-col justify-between"
                >
                  <div>
                    <h4 className="text-green-600 dark:text-green-400 text-sm font-semibold uppercase tracking-wider mb-2">Mis Salud</h4>
                    <p className="text-xl font-bold text-gray-900 dark:text-white mb-2">Mis Prescripciones</p>
                    <p className="text-gray-500 dark:text-slate-400 text-sm mb-6">
                      Revisa tus recetas médicas, márcalas como consumidas o descarga el PDF.
                    </p>
                  </div>
                  <button
                    onClick={() => router.push('/patient/prescriptions')}
                    className="w-full py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-100 dark:shadow-none"
                  >
                    <HiOutlineClipboardList size={20} /> Ver Bandeja
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
