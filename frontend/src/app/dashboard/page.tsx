'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { 
  HiUserCircle, 
  HiLogout, 
  HiIdentification, 
  HiShieldCheck, 
  HiPlus, 
  HiOutlineClipboardList,
  HiPencilAlt,
  HiCheckCircle,
  HiChartBar,
  HiUsers
} from 'react-icons/hi';
import { RiDashboardLine } from 'react-icons/ri';
import { ThemeToggle } from '@/components/ThemeToggle';
import api from '@/lib/api';
import { toast } from 'sonner';

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleSignatureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecciona una imagen para tu firma');
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      try {
        // We'll use a generic update endpoint or a specific doctor one
        await api.patch('/doctors/me/signature', { signature: base64String });
        toast.success('Firma actualizada correctamente');
      } catch (error) {
        console.error('Error uploading signature', error);
        toast.error('No se pudo actualizar la firma. Intenta más tarde.');
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

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
              <div className="flex items-center justify-end gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" title="Sesión Activa"></span>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{user?.name || user?.email}</p>
              </div>
              <p className="text-xs text-gray-500 dark:text-slate-400 uppercase tracking-wider">{user?.role}</p>
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Merged Profile & Role Card */}
            <div className="lg:col-span-1">
              <motion.div
                whileHover={{ y: -5 }}
                className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden"
              >
                <div className="h-24 bg-gradient-to-r from-indigo-600 to-indigo-700"></div>
                <div className="px-6 pb-8">
                  <div className="relative -mt-12 mb-4 flex justify-center">
                    <div className="w-24 h-24 bg-white dark:bg-slate-900 rounded-2xl p-1.5 shadow-lg">
                      <div className="w-full h-full bg-indigo-50 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                        <HiUserCircle size={56} />
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{user?.name || 'Usuario'}</h3>
                    <p className="text-gray-500 dark:text-slate-400 text-sm">{user?.email}</p>
                  </div>

                  <div className="space-y-4">
                    {/* Common Info */}
                    <div className="p-4 bg-gray-50 dark:bg-slate-800/50 rounded-2xl border border-gray-100 dark:border-slate-800">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-slate-500">Rol de Usuario</span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold rounded-full border border-indigo-200 dark:border-indigo-800 uppercase">
                          <HiShieldCheck size={12} /> {user?.role}
                        </span>
                      </div>
                      
                      {/* Role Specific Details */}
                      <div className="space-y-3 mt-4">
                        {user?.role === 'doctor' && user?.doctor && (
                          <>
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-900 flex items-center justify-center text-indigo-500 shadow-sm">
                                <HiOutlineClipboardList size={16} />
                              </div>
                              <div>
                                <p className="text-[10px] text-gray-400 dark:text-slate-500 uppercase font-bold">Especialidad</p>
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">{user?.doctor.specialty || 'Medicina General'}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-900 flex items-center justify-center text-indigo-500 shadow-sm">
                                <HiIdentification size={16} />
                              </div>
                              <div>
                                <p className="text-[10px] text-gray-400 dark:text-slate-500 uppercase font-bold">Cédula Profesional</p>
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">{user?.doctor.medicalLicense || 'No registrada'}</p>
                              </div>
                            </div>
                          </>
                        )}

                        {user?.role === 'patient' && user?.patient && (
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-900 flex items-center justify-center text-green-500 shadow-sm">
                              <HiPencilAlt size={16} />
                            </div>
                            <div>
                              <p className="text-[10px] text-gray-400 dark:text-slate-500 uppercase font-bold">Fecha de Nacimiento</p>
                              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                {user?.patient.birthDate ? new Date(user?.patient.birthDate).toLocaleDateString() : 'No registrada'}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] px-2 font-bold uppercase tracking-wider">
                      <div className="flex items-center gap-1 text-gray-400 dark:text-slate-500">
                        <HiIdentification />
                        <span>ID: {user?.id.substring(0, 12)}</span>
                      </div>
                      <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                        <HiCheckCircle />
                        <span>Verificado</span>
                      </div>
                    </div>

                    {/* Doctor Signature Action */}
                    {user?.role === 'doctor' && (
                      <div className="pt-4 mt-4 border-t border-gray-100 dark:border-slate-800">
                        <input 
                          type="file" 
                          ref={fileInputRef} 
                          onChange={handleSignatureUpload} 
                          className="hidden" 
                          accept="image/*"
                        />
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploading}
                          className="w-full py-3 bg-white dark:bg-slate-800 border-2 border-dashed border-gray-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 text-gray-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-bold rounded-2xl transition-all flex items-center justify-center gap-2 text-sm"
                        >
                          {isUploading ? (
                            <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <HiPencilAlt size={18} />
                          )}
                          Subir Firma Médica
                        </button>
                        <p className="text-[10px] text-gray-400 dark:text-slate-500 text-center mt-2 px-4">
                          La firma se incluirá automáticamente en tus prescripciones PDF.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Quick Actions / Role Specific Section */}
            <div className="lg:col-span-2 space-y-6">
              {/* Doctor Specific Actions */}
              {user?.role === 'doctor' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-indigo-100 dark:border-indigo-900/30 flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-6">
                        <HiOutlineClipboardList size={24} />
                      </div>
                      <h4 className="text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-widest mb-2">Gestión Médica</h4>
                      <p className="text-xl font-bold text-gray-900 dark:text-white mb-2">Mis Prescripciones</p>
                      <p className="text-gray-500 dark:text-slate-400 text-sm mb-8 leading-relaxed">
                        Accede al historial completo de recetas emitidas y gestiona sus estados.
                      </p>
                    </div>
                    <button
                      onClick={() => router.push('/doctor/prescriptions')}
                      className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 dark:shadow-none"
                    >
                      Ver Historial completo
                    </button>
                  </motion.div>

                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-400 mb-6">
                        <HiPlus size={24} />
                      </div>
                      <h4 className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Acciones Rápidas</h4>
                      <p className="text-xl font-bold text-gray-900 dark:text-white mb-2">Nueva Prescripción</p>
                      <p className="text-gray-500 dark:text-slate-400 text-sm mb-8 leading-relaxed">
                        Crea una nueva receta médica digital de forma inmediata para tus pacientes.
                      </p>
                    </div>
                    <button
                      onClick={() => router.push('/doctor/prescriptions/new')}
                      className="w-full py-4 border-2 border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold rounded-2xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all flex items-center justify-center gap-2"
                    >
                      Generar Receta ahora
                    </button>
                  </motion.div>
                </div>
              )}

              {/* Patient Specific Actions */}
              {user?.role === 'patient' && (
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-green-100 dark:border-green-900/30 flex flex-col justify-between"
                >
                  <div>
                    <div className="w-12 h-12 bg-green-50 dark:bg-green-900/30 rounded-xl flex items-center justify-center text-green-600 dark:text-green-400 mb-6">
                      <HiOutlineClipboardList size={24} />
                    </div>
                    <h4 className="text-green-600 dark:text-green-400 text-xs font-bold uppercase tracking-widest mb-2">Mi Salud Digital</h4>
                    <p className="text-xl font-bold text-gray-900 dark:text-white mb-2">Mis Prescripciones</p>
                    <p className="text-gray-500 dark:text-slate-400 text-sm mb-8 leading-relaxed">
                      Revisa tus recetas médicas vigentes, descarga el PDF oficial o márcalas como ya adquiridas.
                    </p>
                  </div>
                  <button
                    onClick={() => router.push('/patient/prescriptions')}
                    className="w-full py-4 bg-green-600 text-white font-bold rounded-2xl hover:bg-green-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-100 dark:shadow-none"
                  >
                    Acceder a mis recetas
                  </button>
                </motion.div>
              )}

              {/* Admin Specific Actions */}
              {user?.role === 'admin' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-indigo-100 dark:border-indigo-900/30 flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-6">
                        <HiChartBar size={24} />
                      </div>
                      <h4 className="text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-widest mb-2">Análisis Global</h4>
                      <p className="text-xl font-bold text-gray-900 dark:text-white mb-2">Métricas del Sistema</p>
                      <p className="text-gray-500 dark:text-slate-400 text-sm mb-8 leading-relaxed">
                        Visualiza estadísticas de prescripciones, pacientes y actividad de médicos en tiempo real.
                      </p>
                    </div>
                    <button
                      onClick={() => router.push('/admin')}
                      className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 dark:shadow-none"
                    >
                      Ver Estadísticas
                    </button>
                  </motion.div>

                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-emerald-100 dark:border-emerald-900/30 flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-6">
                        <HiUsers size={24} />
                      </div>
                      <h4 className="text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-widest mb-2">Control de Acceso</h4>
                      <p className="text-xl font-bold text-gray-900 dark:text-white mb-2">Gestión de Usuarios</p>
                      <p className="text-gray-500 dark:text-slate-400 text-sm mb-8 leading-relaxed">
                        Administra el personal médico y pacientes. Crea nuevas cuentas y asigna roles.
                      </p>
                    </div>
                    <button
                      onClick={() => router.push('/admin/users')}
                      className="w-full py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-100 dark:shadow-none"
                    >
                      Gestionar Cuentas
                    </button>
                  </motion.div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
