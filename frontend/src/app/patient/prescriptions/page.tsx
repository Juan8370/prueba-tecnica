'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HiOutlineClipboardList, 
  HiCheckCircle, 
  HiDownload, 
  HiFilter, 
  HiCalendar, 
  HiChevronRight,
  HiClock,
  HiLogout,
  HiChevronLeft
} from 'react-icons/hi';
import { RiDashboardLine } from 'react-icons/ri';
import { ThemeToggle } from '@/components/ThemeToggle';
import { toast } from 'sonner';
import api from '@/lib/api';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface PrescriptionItem {
  id: string;
  name: string;
  dosage: string;
  quantity: number;
  instructions: string;
}

interface Prescription {
  id: string;
  code: string;
  status: 'pending' | 'consumed';
  notes: string;
  createdAt: string;
  consumedAt: string | null;
  author: {
    user: {
      name: string;
    };
  };
  items: PrescriptionItem[];
}

export default function PatientPrescriptionsPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'consumed'>('all');
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);

  useEffect(() => {
    fetchPrescriptions();
  }, [filter]);

  const fetchPrescriptions = async () => {
    setLoading(true);
    try {
      const statusParam = filter !== 'all' ? `&status=${filter}` : '';
      const res = await api.get(`/me/prescriptions?limit=50${statusParam}`);
      setPrescriptions(res.data.data);
    } catch (error) {
      toast.error('Error al cargar tus prescripciones');
    } finally {
      setLoading(false);
    }
  };

  const handleConsume = async (id: string) => {
    try {
      await api.put(`/prescriptions/${id}/consume`);
      toast.success('Prescripción marcada como consumida');
      fetchPrescriptions();
      if (selectedPrescription?.id === id) {
        setSelectedPrescription(prev => prev ? { ...prev, status: 'consumed', consumedAt: new Date().toISOString() } : null);
      }
    } catch (error) {
      toast.error('Error al actualizar la prescripción');
    }
  };

  const handleDownloadPdf = async (id: string, code: string) => {
    toast.info(`Generando PDF para la receta ${code}...`);
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
      toast.success('PDF descargado con éxito');
    } catch (error) {
      toast.error('Error al generar el PDF');
    }
  };

  if (loading && prescriptions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/dashboard')}>
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-md">
              <RiDashboardLine size={24} />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white hidden sm:block">MediAdmin</span>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className="text-right hidden sm:block">
              <div className="flex items-center justify-end gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{user?.name || user?.email}</p>
              </div>
              <p className="text-xs text-gray-500 dark:text-slate-400 uppercase tracking-wider">{user?.role}</p>
            </div>
            <button
              onClick={logout}
              className="p-2 text-gray-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
            >
              <HiLogout size={24} />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-7xl mx-auto w-full p-4 md:p-8">
        <div className="mb-6">
          <button 
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold hover:underline transition-all"
          >
            <HiChevronLeft size={20} /> Volver al Dashboard
          </button>
        </div>

        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <HiOutlineClipboardList className="text-indigo-600" /> Mis Prescripciones
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Gestiona tus recetas médicas y haz seguimiento de tu tratamiento.
            </p>
          </div>

          <div className="flex bg-white dark:bg-slate-900 p-1 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
            {(['all', 'pending', 'consumed'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filter === f
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {f === 'all' ? 'Todas' : f === 'pending' ? 'Pendientes' : 'Consumidas'}
              </button>
            ))}
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* List Area */}
          <div className="lg:col-span-2 space-y-4">
            {prescriptions.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 p-12 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 text-center">
                <HiOutlineClipboardList size={48} className="mx-auto text-slate-300 mb-4" />
                <p className="text-slate-500">No tienes prescripciones en esta categoría.</p>
              </div>
            ) : (
              prescriptions.map((p) => (
                <motion.div
                  key={p.id}
                  layoutId={p.id}
                  onClick={() => setSelectedPrescription(p)}
                  className={`bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border cursor-pointer transition-all hover:shadow-md ${
                    selectedPrescription?.id === p.id 
                      ? 'border-indigo-600 ring-1 ring-indigo-600' 
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        p.status === 'pending' 
                          ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600' 
                          : 'bg-green-100 dark:bg-green-900/30 text-green-600'
                      }`}>
                        <HiClock size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white">Receta {p.code}</h3>
                        <p className="text-xs text-slate-500 uppercase tracking-wider">
                          {p.status === 'pending' ? 'Pendiente' : 'Consumida'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-slate-900 dark:text-white flex items-center gap-1">
                        <HiCalendar className="text-slate-400" /> 
                        {format(new Date(p.createdAt), 'dd MMM, yyyy', { locale: es })}
                      </p>
                      <p className="text-xs text-slate-500">Dr. {p.author.user.name}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {p.items.slice(0, 2).map((item, idx) => (
                      <span key={idx} className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs text-slate-600 dark:text-slate-400">
                        {item.name}
                      </span>
                    ))}
                    {p.items.length > 2 && (
                      <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs text-slate-600 dark:text-slate-400">
                        +{p.items.length - 2} más
                      </span>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </div>

          {/* Detail Area */}
          <div className="lg:col-span-1">
            <AnimatePresence mode="wait">
              {selectedPrescription ? (
                <motion.div
                  key="detail"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 sticky top-24"
                >
                  <div className="flex justify-between items-start mb-6">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Detalle de Receta</h2>
                    <button 
                      onClick={() => setSelectedPrescription(null)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <HiChevronRight size={24} />
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center gap-4 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl">
                      <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold">
                        {selectedPrescription.author.user.name[0]}
                      </div>
                      <div>
                        <p className="text-xs text-indigo-600 dark:text-indigo-400 font-bold uppercase">Médico</p>
                        <p className="text-slate-900 dark:text-white font-semibold">Dr. {selectedPrescription.author.user.name}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">Medicamentos</h4>
                      <div className="space-y-3">
                        {selectedPrescription.items.map((item) => (
                          <div key={item.id} className="p-4 border border-slate-100 dark:border-slate-800 rounded-2xl">
                            <div className="flex justify-between mb-1">
                              <p className="font-bold text-slate-900 dark:text-white">{item.name}</p>
                              <p className="text-indigo-600 dark:text-indigo-400 font-bold">x{item.quantity}</p>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400">{item.dosage}</p>
                            <p className="text-xs text-slate-400 mt-2 italic">"{item.instructions}"</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {selectedPrescription.notes && (
                      <div>
                        <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Notas del Doctor</h4>
                        <p className="text-slate-600 dark:text-slate-400 text-sm bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                          {selectedPrescription.notes}
                        </p>
                      </div>
                    )}

                    <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-3">
                      {selectedPrescription.status === 'pending' && (
                        <button
                          onClick={() => handleConsume(selectedPrescription.id)}
                          className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-green-100 dark:shadow-none flex items-center justify-center gap-2"
                        >
                          <HiCheckCircle size={20} /> Marcar como Consumida
                        </button>
                      )}
                      <button
                        onClick={() => handleDownloadPdf(selectedPrescription.id, selectedPrescription.code)}
                        className="w-full py-4 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2"
                      >
                        <HiDownload size={20} /> Descargar PDF
                      </button>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="bg-slate-100/50 dark:bg-slate-900/50 h-[500px] rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center p-8">
                  <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl shadow-sm flex items-center justify-center text-slate-300 mb-4">
                    <HiFilter size={32} />
                  </div>
                  <p className="text-slate-500">Selecciona una prescripción de la lista para ver el detalle completo.</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}
