'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { 
  HiLogout, 
  HiChevronLeft, 
  HiCalendar, 
  HiUser, 
  HiMail,
  HiClipboardList,
  HiCheckCircle,
  HiClock,
  HiDownload
} from 'react-icons/hi';
import { RiDashboardLine } from 'react-icons/ri';
import { ThemeToggle } from '@/components/ThemeToggle';
import Link from 'next/link';

interface PrescriptionItem {
  id: string;
  name: string;
  dosage?: string;
  quantity?: number;
  instructions?: string;
}

interface Prescription {
  id: string;
  code: string;
  status: 'pending' | 'consumed';
  notes?: string;
  createdAt: string;
  consumedAt?: string;
  patient: {
    user: {
      name: string;
      email: string;
    };
  };
  items: PrescriptionItem[];
}

export default function PrescriptionDetailPage() {
  const { id } = useParams();
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'doctor')) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const response = await api.get(`/prescriptions/${id}`);
        setPrescription(response.data);
      } catch (error) {
        console.error('Failed to fetch prescription detail', error);
      } finally {
        setLoading(false);
      }
    };

    if (user && user.role === 'doctor' && id) {
      fetchDetail();
    }
  }, [id, user]);

  const handleDownloadPdf = async () => {
    if (!prescription) return;
    try {
      const response = await api.get(`/prescriptions/${prescription.id}/pdf`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `prescripcion-${prescription.code}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Failed to download PDF', error);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-indigo-200 dark:bg-indigo-900/40 rounded-full mb-4"></div>
          <div className="h-4 w-24 bg-indigo-100 dark:bg-indigo-900/20 rounded"></div>
        </div>
      </div>
    );
  }

  if (!prescription) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-white p-6 text-center">
        <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl flex items-center justify-center mb-4">
          <HiClipboardList size={32} />
        </div>
        <h2 className="text-2xl font-bold mb-2">Prescripción no encontrada</h2>
        <p className="text-gray-500 dark:text-slate-400 mb-6">El documento solicitado no existe o no tienes permiso para verlo.</p>
        <button 
          onClick={() => router.push('/doctor/prescriptions')}
          className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all flex items-center gap-2"
        >
          <HiChevronLeft /> Volver al listado
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex flex-col transition-colors duration-300">
      {/* Header (Matching Dashboard) */}
      <header className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-md">
              <RiDashboardLine size={24} />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white hidden sm:block">MediAdmin</span>
          </Link>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className="text-right hidden sm:block">
              <div className="flex items-center justify-end gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" title="Sesión Activa"></span>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{user.name || user.email}</p>
              </div>
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
      <main className="flex-grow max-w-5xl mx-auto w-full p-4 sm:p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Breadcrumbs */}
          <div className="mb-6">
            <button 
              onClick={() => router.push('/doctor/prescriptions')}
              className="inline-flex items-center text-sm font-medium text-gray-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              <HiChevronLeft className="w-5 h-5 mr-1" />
              Volver al historial
            </button>
          </div>

          {/* Title & Actions */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Receta {prescription.code}</h2>
                {prescription.status === 'pending' ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30">
                    <HiClock size={14} /> Pendiente
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-100 dark:border-green-900/30">
                    <HiCheckCircle size={14} /> Consumida
                  </span>
                )}
              </div>
              <p className="text-gray-500 dark:text-slate-400 text-sm flex items-center gap-2">
                <HiCalendar size={16} /> Emitida el {new Date(prescription.createdAt).toLocaleDateString('es-ES', { dateStyle: 'long' })}
              </p>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={handleDownloadPdf}
                className="px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-100 dark:shadow-none"
              >
                <HiDownload size={20} /> Descargar PDF
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left: Patient Info Card */}
            <div className="md:col-span-1 space-y-6">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800">
                <h3 className="text-gray-400 dark:text-slate-500 text-xs font-bold uppercase tracking-widest mb-6">Información del Paciente</h3>
                
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 flex-shrink-0">
                      <HiUser size={24} />
                    </div>
                    <div>
                      <p className="text-gray-400 dark:text-slate-500 text-xs font-bold uppercase tracking-tighter">Nombre</p>
                      <p className="text-gray-900 dark:text-white font-bold">{prescription.patient.user.name}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 flex-shrink-0">
                      <HiMail size={24} />
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-gray-400 dark:text-slate-500 text-xs font-bold uppercase tracking-tighter">Email</p>
                      <p className="text-gray-900 dark:text-white font-bold truncate text-sm">{prescription.patient.user.email}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Items Card */}
            <div className="md:col-span-2">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800">
                <div className="flex items-center gap-2 mb-8 pb-4 border-b border-gray-50 dark:border-slate-800">
                  <HiClipboardList className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Prescripción y Dosis</h3>
                </div>
                
                <div className="space-y-4">
                  {prescription.items.map((item, index) => (
                    <motion.div 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      key={item.id} 
                      className="p-5 bg-gray-50/50 dark:bg-slate-800/30 rounded-2xl border border-gray-100 dark:border-slate-700/50"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="text-indigo-600 dark:text-indigo-400 font-bold text-lg">{item.name}</h4>
                        {item.quantity && (
                          <span className="text-xs bg-white dark:bg-slate-900 text-gray-500 dark:text-slate-400 px-3 py-1 rounded-full border border-gray-200 dark:border-slate-700 font-bold">
                            Cant: {item.quantity}
                          </span>
                        )}
                      </div>
                      
                      {item.dosage && (
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400"></div>
                          <p className="text-gray-700 dark:text-slate-300 text-sm">
                            Dosis: <span className="font-bold">{item.dosage}</span>
                          </p>
                        </div>
                      )}

                      {item.instructions && (
                        <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-gray-50 dark:border-slate-800 mt-2">
                          <p className="text-gray-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Instrucciones de uso</p>
                          <p className="text-gray-600 dark:text-slate-400 text-sm leading-relaxed">{item.instructions}</p>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>

                {prescription.notes && (
                  <div className="mt-8 pt-8 border-t border-gray-50 dark:border-slate-800">
                    <h4 className="text-gray-400 dark:text-slate-500 text-xs font-bold uppercase tracking-widest mb-3">Observaciones del Médico</h4>
                    <div className="p-4 bg-amber-50/30 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 rounded-xl">
                      <p className="text-gray-700 dark:text-slate-400 text-sm italic">"{prescription.notes}"</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
