'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { 
  HiLogout, 
  HiChevronLeft,
  HiOutlineUserAdd,
  HiUsers,
  HiX,
  HiSearch,
  HiChevronRight,
  HiShieldCheck
} from 'react-icons/hi';
import { RiDashboardLine } from 'react-icons/ri';
import { ThemeToggle } from '@/components/ThemeToggle';
import Link from 'next/link';
import { toast } from 'sonner';

interface UserItem {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
}

interface Meta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function AdminUsersPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  
  const [usersList, setUsersList] = useState<UserItem[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  
  // User Creation State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'patient'
  });
  const [creatingUser, setCreatingUser] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const fetchUsers = useCallback(async () => {
    if (!user || user.role !== 'admin') return;
    
    setLoading(true);
    try {
      const response = await api.get('/users', {
        params: {
          search: debouncedSearch || undefined,
          role: roleFilter || undefined,
          page,
          limit: 10
        }
      });
      setUsersList(response.data.data);
      setMeta(response.data.meta);
    } catch (error) {
      console.error('Error fetching users', error);
      toast.error('Error al cargar la lista de usuarios');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, roleFilter, page, user]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email || !newUser.password || !newUser.role) {
      toast.error('Todos los campos son obligatorios');
      return;
    }
    
    setCreatingUser(true);
    try {
      await api.post('/users', newUser);
      toast.success(`Usuario ${newUser.role} creado exitosamente`);
      setShowCreateModal(false);
      setNewUser({ name: '', email: '', password: '', role: 'patient' });
      fetchUsers(); // Refresh list
    } catch (error: any) {
      console.error('Error creating user', error);
      toast.error(error.response?.data?.message || 'Error al crear el usuario');
    } finally {
      setCreatingUser(false);
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
                <HiUsers className="text-indigo-600 dark:text-indigo-400" /> Gestión de Usuarios
              </h2>
              <p className="text-gray-500 dark:text-slate-400 mt-1">Busca, filtra y registra nuevos miembros en el sistema.</p>
            </div>
            
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center justify-center px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-100 dark:shadow-none hover:bg-indigo-700 transition-all gap-2"
            >
              <HiOutlineUserAdd size={20} /> Crear Usuario
            </button>
          </div>

          {/* Filters & Search Card */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 mb-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Search Bar */}
              <div className="flex-grow">
                <label className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-2 block">Buscar usuario</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-600 transition-colors">
                    <HiSearch size={20} />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Nombre o correo electrónico..."
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

              {/* Role Filter */}
              <div className="md:w-72">
                <label className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-2 block">Rol</label>
                <div className="flex gap-1 bg-gray-50 dark:bg-slate-800 p-1 rounded-xl border border-gray-200 dark:border-slate-700">
                  {[
                    { id: '', label: 'Todos' },
                    { id: 'patient', label: 'Pacientes' },
                    { id: 'doctor', label: 'Doctores' },
                    { id: 'admin', label: 'Admins' }
                  ].map((filter) => (
                    <button
                      key={filter.id}
                      onClick={() => {
                        setRoleFilter(filter.id);
                        setPage(1);
                      }}
                      className={`flex-grow py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
                        roleFilter === filter.id 
                          ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm border border-gray-100 dark:border-slate-600' 
                          : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200'
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden">
            {loading ? (
              <div className="p-20 flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
                <p className="text-gray-500 dark:text-slate-400 font-medium">Cargando usuarios...</p>
              </div>
            ) : usersList.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-800">
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-slate-500">Nombre</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-slate-500">Email</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-slate-500">Rol</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-slate-500">Fecha Registro</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                    {usersList.map((usr) => (
                      <tr key={usr.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="text-sm font-bold text-gray-900 dark:text-white">{usr.name}</p>
                          <p className="text-xs text-gray-500 dark:text-slate-400">ID: {usr.id.substring(0, 8)}...</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="text-sm text-gray-600 dark:text-slate-300">{usr.email}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${
                            usr.role === 'admin' 
                              ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-100 dark:border-red-900/30'
                              : usr.role === 'doctor'
                              ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/30'
                              : 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-100 dark:border-green-900/30'
                          }`}>
                            <HiShieldCheck size={14} />
                            {usr.role.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="text-sm text-gray-500 dark:text-slate-400">
                            {new Date(usr.createdAt).toLocaleDateString()}
                          </p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-20 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-slate-800 rounded-2xl text-gray-400 dark:text-slate-600 mb-4">
                  <HiUsers size={32} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Sin resultados</h3>
                <p className="text-gray-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                  No se encontraron usuarios que coincidan con tu búsqueda.
                </p>
                {(debouncedSearch || roleFilter) && (
                  <button 
                    onClick={() => {
                      setSearchQuery('');
                      setRoleFilter('');
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
              <div className="px-6 py-4 bg-gray-50 dark:bg-slate-800/30 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
                <p className="text-sm text-gray-500 dark:text-slate-400">
                  Mostrando página <span className="font-bold text-gray-900 dark:text-white">{page}</span> de <span className="font-bold text-gray-900 dark:text-white">{meta.totalPages}</span>
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-2 rounded-lg border border-gray-200 dark:border-slate-700 text-gray-500 dark:text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white dark:hover:bg-slate-700 transition-all"
                  >
                    <HiChevronLeft size={20} />
                  </button>
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

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm transition-all">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-slate-800 w-full max-w-md overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50/50 dark:bg-slate-800/30">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Crear Nuevo Usuario</h3>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-red-500 transition-colors p-1"
              >
                <HiX size={20} />
              </button>
            </div>
            
            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-1">Nombre Completo</label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-gray-900 dark:text-white"
                  placeholder="Ej. Juan Pérez"
                  required
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-gray-900 dark:text-white"
                  placeholder="ejemplo@correo.com"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-1">Contraseña</label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-gray-900 dark:text-white"
                  placeholder="Min. 6 caracteres"
                  required
                  minLength={6}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-2">Rol de Usuario</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setNewUser({...newUser, role: 'patient'})}
                    className={`py-2 px-4 rounded-xl border font-bold text-sm transition-all ${
                      newUser.role === 'patient' 
                        ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-500 text-indigo-700 dark:text-indigo-400' 
                        : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-400'
                    }`}
                  >
                    Paciente
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewUser({...newUser, role: 'doctor'})}
                    className={`py-2 px-4 rounded-xl border font-bold text-sm transition-all ${
                      newUser.role === 'doctor' 
                        ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-500 text-indigo-700 dark:text-indigo-400' 
                        : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-400'
                    }`}
                  >
                    Doctor
                  </button>
                </div>
              </div>

              <div className="pt-4 mt-2 border-t border-gray-100 dark:border-slate-800">
                <button
                  type="submit"
                  disabled={creatingUser}
                  className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-indigo-100 dark:shadow-none"
                >
                  {creatingUser ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    'Registrar Usuario'
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
