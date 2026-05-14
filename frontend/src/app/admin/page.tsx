'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { 
  HiLogout, 
  HiUserGroup, 
  HiOutlineUserAdd,
  HiOutlineClipboardList,
  HiUsers,
  HiChartBar,
  HiCheckCircle,
  HiClock,
  HiX,
  HiChevronLeft
} from 'react-icons/hi';
import { RiDashboardLine } from 'react-icons/ri';
import { ThemeToggle } from '@/components/ThemeToggle';
import Link from 'next/link';
import { toast } from 'sonner';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';

interface Metrics {
  totals: {
    doctors: number;
    patients: number;
    prescriptions: number;
  };
  byStatus: {
    pending: number;
    consumed: number;
  };
  byDay: {
    date: string;
    count: number;
  }[];
  topDoctors: {
    doctorId: string;
    name: string;
    count: number;
  }[];
}

export default function AdminDashboardPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loadingMetrics, setLoadingMetrics] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {

      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchMetrics();
    }
  }, [user]);

  const fetchMetrics = async () => {
    try {
      setLoadingMetrics(true);
      const response = await api.get('/admin/metrics');
      setMetrics(response.data);
    } catch (error) {
      console.error('Error fetching metrics', error);
      toast.error('Error al cargar las métricas');
    } finally {
      setLoadingMetrics(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-indigo-200 dark:bg-indigo-900/40 rounded-full mb-4"></div>
          <div className="h-4 w-24 bg-indigo-100 dark:bg-indigo-900/20 rounded"></div>
        </div>
      </div>
    );
  }

  const COLORS = ['#10B981', '#F59E0B']; // Emerald for consumed, Amber for pending

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex flex-col transition-colors duration-300">
      {/* Header */}
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
          <div className="mb-6">
            <button 
              onClick={() => router.push('/dashboard')}
              className="inline-flex items-center text-sm font-medium text-gray-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              <HiChevronLeft className="w-5 h-5 mr-1" />
              Volver al Dashboard
            </button>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <HiChartBar className="text-indigo-600 dark:text-indigo-400" /> Métricas del Sistema
              </h2>
              <p className="text-gray-500 dark:text-slate-400 mt-1">Supervisa las estadísticas globales de prescripciones y actividad en tiempo real.</p>
            </div>
          </div>

          {loadingMetrics || !metrics ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Totals Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 flex items-center gap-4">
                  <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <HiUserGroup size={28} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">Pacientes</p>
                    <p className="text-3xl font-black text-gray-900 dark:text-white">{metrics.totals.patients}</p>
                  </div>
                </div>
                
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 flex items-center gap-4">
                  <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <HiUsers size={28} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">Doctores</p>
                    <p className="text-3xl font-black text-gray-900 dark:text-white">{metrics.totals.doctors}</p>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 flex items-center gap-4">
                  <div className="w-14 h-14 bg-purple-50 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center text-purple-600 dark:text-purple-400">
                    <HiOutlineClipboardList size={28} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">Prescripciones</p>
                    <p className="text-3xl font-black text-gray-900 dark:text-white">{metrics.totals.prescriptions}</p>
                  </div>
                </div>
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Status Chart */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 lg:col-span-1">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Estado de Prescripciones</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Consumidas', value: metrics.byStatus.consumed },
                            { name: 'Pendientes', value: metrics.byStatus.pending }
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {metrics.byStatus.consumed > 0 || metrics.byStatus.pending > 0 ? (
                            [
                              { name: 'Consumidas', value: metrics.byStatus.consumed },
                              { name: 'Pendientes', value: metrics.byStatus.pending }
                            ].map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))
                          ) : (
                            <Cell fill="#CBD5E1" />
                          )}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Legend verticalAlign="bottom" height={36}/>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 flex justify-between px-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{metrics.byStatus.consumed}</p>
                      <p className="text-xs text-gray-500 uppercase flex items-center justify-center gap-1"><HiCheckCircle /> Consumidas</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-amber-500 dark:text-amber-400">{metrics.byStatus.pending}</p>
                      <p className="text-xs text-gray-500 uppercase flex items-center justify-center gap-1"><HiClock /> Pendientes</p>
                    </div>
                  </div>
                </div>

                {/* Day Chart */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 lg:col-span-2">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Prescripciones por Día</h3>
                  <div className="h-72">
                    {metrics.byDay.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={metrics.byDay}>
                          <XAxis 
                            dataKey="date" 
                            tickFormatter={(tick) => new Date(tick).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                            stroke="#94a3b8" 
                            fontSize={12}
                          />
                          <YAxis stroke="#94a3b8" fontSize={12} allowDecimals={false} />
                          <Tooltip 
                            cursor={{ fill: 'rgba(99, 102, 241, 0.1)' }}
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            labelFormatter={(label) => new Date(label).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                          />
                          <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} name="Prescripciones" />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-gray-400 dark:text-slate-600">
                        <p>No hay datos de prescripciones para mostrar.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Top Doctors (Optional) */}
              {metrics.topDoctors && metrics.topDoctors.length > 0 && (
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Doctores con más actividad</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {metrics.topDoctors.map((doc, idx) => (
                      <div key={doc.doctorId} className="p-4 rounded-xl bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800">
                        <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center font-bold text-lg mb-3">
                          {idx + 1}
                        </div>
                        <p className="font-bold text-gray-900 dark:text-white text-sm truncate" title={doc.name}>Dr. {doc.name}</p>
                        <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">{doc.count} prescripciones</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
