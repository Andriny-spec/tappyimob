'use client';

import React from 'react';
import { signOut } from 'next-auth/react';
import { LogOut } from 'lucide-react';

export default function AdminDashboard() {
  const handleLogout = async () => {
    // Fazer logout usando next-auth
    await signOut({ callbackUrl: '/login' });
  };

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      {/* Botão de logout no canto superior direito */}
      <div className="absolute top-4 right-4">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md shadow-md transition-colors"
        >
          <LogOut size={18} />
          <span>Sair</span>
        </button>
      </div>

      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Dashboard Admin</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Cards do dashboard */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Visão Geral</h2>
            <p className="text-gray-700">Bem-vindo ao painel de administração.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
