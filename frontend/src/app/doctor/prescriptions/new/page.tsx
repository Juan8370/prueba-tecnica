'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { HiSearch, HiUserAdd, HiPlus, HiTrash, HiArrowLeft, HiCheckCircle } from 'react-icons/hi';
import { toast } from 'sonner';
import api from '@/lib/api';

interface Patient {
  id: string;
  user: {
    name: string;
    email: string;
  };
}

interface PrescriptionItem {
  name: string;
  dosage: string;
  quantity: number;
  instructions: string;
}

export default function NewPrescriptionPage() {
  const { user } = useAuth();
  const router = useRouter();

  // Search and Patient List State
  const [searchQuery, setSearchQuery] = useState('');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Prescription Form State
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<PrescriptionItem[]>([
    { name: '', dosage: '', quantity: 1, instructions: '' },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user && user.role !== 'doctor') {
      router.push('/dashboard');
    }
  }, [user, router]);

  useEffect(() => {
    fetchPatients();
  }, [searchQuery, page]);

  const fetchPatients = async () => {
    setLoadingPatients(true);
    try {
      const res = await api.get(`/patients?query=${searchQuery}&page=${page}&limit=5`);
      setPatients(res.data.data);
      setTotalPages(res.data.meta.totalPages);
    } catch (error) {
      toast.error('Error al cargar pacientes');
    } finally {
      setLoadingPatients(false);
    }
  };

  const addItem = () => {
    setItems([...items, { name: '', dosage: '', quantity: 1, instructions: '' }]);
  };

  const removeItem = (index: number) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof PrescriptionItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) {
      toast.error('Por favor selecciona un paciente');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/prescriptions', {
        patientId: selectedPatient.id,
        notes,
        items,
      });

      toast.success('Prescripción creada con éxito');
      router.push('/dashboard');
    } catch (error) {
      toast.error('Error al crear la prescripción');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user || user.role !== 'doctor') return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => router.back()}
          className="flex items-center text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors mb-6"
        >
          <HiArrowLeft className="mr-2" /> Volver
        </button>

        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">
          Nueva Prescripción Médica
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Patient Selector */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center">
                <HiSearch className="mr-2 text-indigo-500" /> Buscar Paciente
              </h2>
              
              <div className="relative mb-6">
                <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Nombre o email..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                />
              </div>

              <div className="space-y-3">
                {loadingPatients ? (
                  <div className="py-8 text-center text-slate-500">Cargando...</div>
                ) : patients.length === 0 ? (
                  <div className="py-8 text-center text-slate-500">No se encontraron pacientes</div>
                ) : (
                  patients.map((patient) => (
                    <button
                      key={patient.id}
                      onClick={() => setSelectedPatient(patient)}
                      className={`w-full text-left p-4 rounded-xl border transition-all ${
                        selectedPatient?.id === patient.id
                          ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20'
                          : 'border-slate-100 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700'
                      }`}
                    >
                      <div className="font-medium text-slate-900 dark:text-white">
                        {patient.user.name}
                      </div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">
                        {patient.user.email}
                      </div>
                    </button>
                  ))
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-between items-center mt-6">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                    className="p-2 disabled:opacity-30 text-indigo-600"
                  >
                    Anterior
                  </button>
                  <span className="text-sm text-slate-500">
                    Página {page} de {totalPages}
                  </span>
                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage(page + 1)}
                    className="p-2 disabled:opacity-30 text-indigo-600"
                  >
                    Siguiente
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Prescription Form */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {selectedPatient ? (
                <motion.form
                  key="form"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  onSubmit={handleSubmit}
                  className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800"
                >
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                        Receta para {selectedPatient.user.name}
                      </h2>
                      <p className="text-slate-500 dark:text-slate-400">
                        Completa los campos para generar la prescripción
                      </p>
                    </div>
                    <div className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-4 py-2 rounded-full text-sm font-medium">
                      Paciente Seleccionado
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Notas Adicionales
                      </label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Indicaciones generales, precauciones..."
                        className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white h-24 resize-none"
                      />
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          Medicamentos e Ítems
                        </label>
                        <button
                          type="button"
                          onClick={addItem}
                          className="flex items-center text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors"
                        >
                          <HiPlus className="mr-1" /> Añadir ítem
                        </button>
                      </div>

                      {items.map((item, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 relative group"
                        >
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <HiTrash size={20} />
                          </button>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">
                                Nombre del Medicamento
                              </label>
                              <input
                                required
                                type="text"
                                value={item.name}
                                onChange={(e) => updateItem(index, 'name', e.target.value)}
                                className="w-full bg-transparent border-b border-slate-200 dark:border-slate-700 py-1 focus:border-indigo-500 outline-none transition-all dark:text-white"
                              />
                            </div>
                            <div>
                              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">
                                Dosis
                              </label>
                              <input
                                required
                                type="text"
                                value={item.dosage}
                                onChange={(e) => updateItem(index, 'dosage', e.target.value)}
                                placeholder="Ej: 500mg"
                                className="w-full bg-transparent border-b border-slate-200 dark:border-slate-700 py-1 focus:border-indigo-500 outline-none transition-all dark:text-white"
                              />
                            </div>
                            <div>
                              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">
                                Cantidad
                              </label>
                              <input
                                required
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value))}
                                className="w-full bg-transparent border-b border-slate-200 dark:border-slate-700 py-1 focus:border-indigo-500 outline-none transition-all dark:text-white"
                              />
                            </div>
                            <div className="md:col-span-2">
                              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">
                                Instrucciones
                              </label>
                              <input
                                type="text"
                                value={item.instructions}
                                onChange={(e) => updateItem(index, 'instructions', e.target.value)}
                                placeholder="Ej: Cada 8 horas después de comer"
                                className="w-full bg-transparent border-b border-slate-200 dark:border-slate-700 py-1 focus:border-indigo-500 outline-none transition-all dark:text-white"
                              />
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center justify-center"
                    >
                      {isSubmitting ? (
                        'Creando...'
                      ) : (
                        <>
                          <HiCheckCircle className="mr-2" size={20} /> Finalizar Prescripción
                        </>
                      )}
                    </button>
                  </div>
                </motion.form>
              ) : (
                <motion.div
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white dark:bg-slate-900 h-full min-h-[400px] flex flex-col items-center justify-center p-8 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 text-center"
                >
                  <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 mb-4">
                    <HiUserAdd size={32} />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                    Ningún paciente seleccionado
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 max-w-xs">
                    Busca y selecciona un paciente de la lista de la izquierda para comenzar a redactar la prescripción.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
