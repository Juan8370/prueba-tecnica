'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { 
  HiLogout, 
  HiPlus, 
  HiOutlineClipboardList, 
  HiChevronLeft, 
  HiChevronRight,
  HiFilter,
  HiEye,
  HiDownload,
  HiClock,
  HiCheckCircle,
  HiSearch,
  HiSortAscending,
  HiSortDescending,
  HiX
} from 'react-icons/hi';
import { RiDashboardLine } from 'react-icons/ri';
import { ThemeToggle } from '@/components/ThemeToggle';
import Link from 'next/link';
import { toast } from 'sonner';

interface Prescription {
  id: string;
  code: string;
  status: 'pending' | 'consumed';
  createdAt: string;
  patient: {
    user: {
      name: string;
    };
  };
}

interface Meta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function DoctorPrescriptionsPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(true);
  
  // States for filters, sorting and search
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [page, setPage] = useState(1);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'doctor')) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const handleDownloadPdf = async (id: string, code: string) => {
    try {
      const response = await api.get(`/prescriptions/${id}/pdf`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `prescripcion-${code}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('PDF descargado correctamente');
    } catch (error) {
      console.error('Failed to download PDF', error);
      toast.error('Error al descargar el PDF');
    }
  };

  const fetchPrescriptions = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/prescriptions', {
        params: {
          mine: 'true',
          status: statusFilter || undefined,
          search: debouncedSearch || undefined,
          order: sortOrder,
          page,
          limit: 10,
        },
      });
      setPrescriptions(response.data.data);
      setMeta(response.data.meta);
    } catch (error) {
      console.error('Failed to fetch prescriptions', error);
      toast.error('Error al cargar las prescripciones');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, debouncedSearch, sortOrder, page]);

  useEffect(() => {
    if (user && user.role === 'doctor') {
      fetchPrescriptions();
    }
  }, [user, fetchPrescriptions]);

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
      <main className="flex-grow max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Breadcrumbs */}
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
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Mis Prescripciones</h2>
              <p className="text-gray-500 dark:text-slate-400">Gestiona y busca tus recetas emitidas.</p>
            </div>
            
            <button
              onClick={() => router.push('/doctor/prescriptions/new')}
              className="inline-flex items-center justify-center px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-100 dark:shadow-none hover:bg-indigo-700 transition-all gap-2"
            >
              <HiPlus size={20} /> Nueva Prescripción
            </button>
          </div>

          {/* Filters & Search Card */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 mb-6 space-y-6">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Search Bar */}
              <div className="flex-grow">
                <label className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-2 block">Buscar receta</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-600 transition-colors">
                    <HiSearch size={20} />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Código o nombre del paciente..."
                    className="block w-full pl-10 pr-10 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-gray-900 dark:text-white"
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <HiX size={18} />
                    </button>
                  )}
                </div>
              </div>

              {/* Status Filter */}
              <div className="lg:w-72">
                <label className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-2 block">Estado</label>
                <div className="flex gap-1 bg-gray-50 dark:bg-slate-800 p-1 rounded-xl border border-gray-200 dark:border-slate-700">
                  {[
                    { id: '', label: 'Todas' },
                    { id: 'pending', label: 'Pendientes' },
                    { id: 'consumed', label: 'Consumidas' }
                  ].map((filter) => (
                    <button
                      key={filter.id}
                      onClick={() => {
                        setStatusFilter(filter.id);
                        setPage(1);
                      }}
                      className={`flex-grow py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
                        statusFilter === filter.id 
                          ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm border border-gray-100 dark:border-slate-600' 
                          : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200'
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort Order */}
              <div className="lg:w-48">
                <label className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-2 block">Ordenación</label>
                <button
                  onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                  className="w-full flex items-center justify-between px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-all font-medium"
                >
                  <span className="text-sm">{sortOrder === 'desc' ? 'Más recientes' : 'Más antiguas'}</span>
                  {sortOrder === 'desc' ? <HiSortDescending size={20} className="text-indigo-600" /> : <HiSortAscending size={20} className="text-indigo-600" />}
                </button>
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden">
            {loading ? (
              <div className="p-20 flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
                <p className="text-gray-500 dark:text-slate-400 font-medium">Actualizando resultados...</p>
              </div>
            ) : prescriptions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-800">
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-slate-500">Código</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-slate-500">Paciente</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-slate-500">Fecha</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-slate-500">Estado</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-slate-500 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                    {prescriptions.map((prescription) => (
                      <tr key={prescription.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold tracking-tight">{prescription.code}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="text-sm font-bold text-gray-900 dark:text-white">{prescription.patient.user.name}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="text-sm text-gray-500 dark:text-slate-400">
                            {new Date(prescription.createdAt).toLocaleDateString()}
                          </p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {prescription.status === 'pending' ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30">
                              <HiClock size={14} /> Pendiente
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-100 dark:border-green-900/30">
                              <HiCheckCircle size={14} /> Consumida
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link 
                              href={`/doctor/prescriptions/${prescription.id}`}
                              className="p-2 text-gray-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-all"
                            >
                              <HiEye size={20} />
                            </Link>
                            <button
                              onClick={() => handleDownloadPdf(prescription.id, prescription.code)}
                              className="p-2 text-gray-400 dark:text-slate-500 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-all"
                              title="Descargar PDF"
                            >
                              <HiDownload size={20} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-20 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-slate-800 rounded-2xl text-gray-400 dark:text-slate-600 mb-4">
                  <HiOutlineClipboardList size={32} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Sin resultados</h3>
                <p className="text-gray-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                  No se encontraron prescripciones que coincidan con los criterios de búsqueda.
                </p>
                {(debouncedSearch || statusFilter) && (
                  <button 
                    onClick={() => {
                      setSearchQuery('');
                      setStatusFilter('');
                    }}
                    className="mt-4 text-indigo-600 dark:text-indigo-400 text-sm font-bold hover:underline"
                  >
                    Limpiar todos los filtros
                  </button>
                )}
              </div>
            )}

            {/* Pagination */}
            {meta && meta.totalPages > 1 && (
              <div className="px-6 py-4 bg-gray-50 dark:bg-slate-800/30 border-t border-gray-100 dark:divide-slate-800 flex items-center justify-between">
                <p className="text-sm text-gray-500 dark:text-slate-400">
                  Mostrando <span className="font-bold text-gray-900 dark:text-white">{prescriptions.length}</span> resultados de <span className="font-bold text-gray-900 dark:text-white">{meta.total}</span>
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-2 rounded-lg border border-gray-200 dark:border-slate-700 text-gray-500 dark:text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white dark:hover:bg-slate-700 transition-all"
                  >
                    <HiChevronLeft size={20} />
                  </button>
                  <span className="text-sm font-bold text-gray-700 dark:text-slate-300">
                    Página {page} de {meta.totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                    disabled={page === meta.totalPages}
                    className="p-2 rounded-lg border border-gray-200 dark:border-slate-700 text-gray-500 dark:text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white dark:hover:bg-slate-700 transition-all"
                  >
                    <HiChevronRight size={20} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
