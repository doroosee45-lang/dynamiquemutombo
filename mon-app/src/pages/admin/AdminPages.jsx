// ── ADMIN USERS ───────────────────────────────────────────────
import React, { useState } from 'react';
import { Search, UserX, Shield, Edit2, Check, X } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import toast from 'react-hot-toast';

const ROLES = ['citizen', 'moderator', 'editor', 'admin', 'superadmin'];
const roleColors = { superadmin: 'badge-rouge', admin: 'badge-rouge', moderator: 'badge-jaune', editor: 'badge-bleu', citizen: 'badge-gris' };
const PROVINCES = ['Kinshasa', 'Nord-Kivu', 'Sud-Kivu', 'Ituri', 'Haut-Katanga', 'Maniema'];

export function AdminUsers() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', search, roleFilter],
    queryFn: () => api.get(`/admin/users?limit=20${search ? `&search=${search}` : ''}${roleFilter ? `&role=${roleFilter}` : ''}`).then(r => r.data)
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...body }) => api.put(`/admin/users/${id}`, body),
    onSuccess: () => { toast.success('Utilisateur mis à jour'); setEditingId(null); qc.invalidateQueries(['admin-users']); },
    onError: () => toast.error('Erreur')
  });

  const banMutation = useMutation({
    mutationFn: (id) => api.put(`/admin/users/${id}/ban`),
    onSuccess: () => { toast.success('Utilisateur banni'); qc.invalidateQueries(['admin-users']); },
    onError: () => toast.error('Erreur')
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Gestion des utilisateurs</h1>
        <p className="text-slate-400 text-sm mt-0.5">{data?.total || '—'} membres · Gestion des rôles & statuts</p>
      </div>

      <div className="card p-4 flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input className="input pl-8" placeholder="Rechercher par nom ou email..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input w-40" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
          <option value="">Tous les rôles</option>
          {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'var(--dark-700)' }}>
              {['Membre', 'Rôle', 'Province', 'Réputation', 'Statut', 'Inscrit', 'Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? Array(8).fill(0).map((_, i) => (
              <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                {Array(7).fill(0).map((_, j) => (
                  <td key={j} className="px-4 py-3"><div className="skeleton h-4 w-full" /></td>
                ))}
              </tr>
            )) : data?.users?.map(u => (
              <tr key={u._id} className="hover:bg-white/3 transition-colors" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{ background: 'var(--dark-500)' }}>
                      {u.nom?.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium text-white">{u.nom}</div>
                      <div className="text-xs text-slate-500">{u.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  {editingId === u._id ? (
                    <select className="input text-xs py-1 w-32" value={editForm.role}
                      onChange={e => setEditForm(f => ({ ...f, role: e.target.value }))}>
                      {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  ) : (
                    <span className={`badge ${roleColors[u.role] || 'badge-gris'}`}>{u.role}</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {editingId === u._id ? (
                    <select className="input text-xs py-1 w-32" value={editForm.province}
                      onChange={e => setEditForm(f => ({ ...f, province: e.target.value }))}>
                      {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  ) : (
                    <span className="text-slate-300 text-xs">{u.province}</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className="font-mono text-xs" style={{ color: 'var(--rdc-jaune)' }}>{u.reputation || 0}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`badge ${u.statut === 'actif' ? 'badge-vert' : u.statut === 'banni' ? 'badge-rouge' : 'badge-gris'}`}>
                    {u.statut}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs text-slate-500">
                    {formatDistanceToNow(new Date(u.createdAt), { addSuffix: true, locale: fr })}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    {editingId === u._id ? (
                      <>
                        <button onClick={() => updateMutation.mutate({ id: u._id, ...editForm })}
                          className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-green-500/20 text-green-400 transition-colors">
                          <Check size={13} />
                        </button>
                        <button onClick={() => setEditingId(null)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-red-500/20 text-red-400 transition-colors">
                          <X size={13} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => { setEditingId(u._id); setEditForm({ role: u.role, province: u.province }); }}
                          className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-blue-500/20 text-blue-400 transition-colors">
                          <Edit2 size={13} />
                        </button>
                        {u.statut !== 'banni' && (
                          <button onClick={() => window.confirm(`Bannir ${u.nom} ?`) && banMutation.mutate(u._id)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-red-500/20 text-red-400 transition-colors">
                            <UserX size={13} />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── ADMIN PROVINCES ───────────────────────────────────────────
export function AdminProvinces() {
  const { data: statsData } = useQuery({
    queryKey: ['province-stats-admin'],
    queryFn: () => api.get('/signalements/province-stats').then(r => r.data)
  });

  const risqueColors = {
    critique: { bg: 'rgba(244,63,94,0.1)', border: 'rgba(244,63,94,0.3)', text: '#f43f5e', label: '🔴 Critique' },
    eleve: { bg: 'rgba(249,115,22,0.1)', border: 'rgba(249,115,22,0.3)', text: '#f97316', label: '🟠 Élevé' },
    moyen: { bg: 'rgba(0,127,255,0.1)', border: 'rgba(0,127,255,0.3)', text: '#60a5fa', label: '🔵 Moyen' },
    faible: { bg: 'rgba(100,116,139,0.1)', border: 'rgba(100,116,139,0.2)', text: '#94a3b8', label: '⚪ Faible' },
  };

  const PROVINCES_DATA = [
    { nom: 'Nord-Kivu', risque: 'critique', districts: [], capital: 'Goma' },
    { nom: 'Sud-Kivu', risque: 'critique', capital: 'Bukavu' },
    { nom: 'Ituri', risque: 'critique', capital: 'Bunia' },
    { nom: 'Kinshasa', risque: 'eleve', capital: 'Kinshasa', districts: ['Lukunga', 'Funa', 'Mont-Amba', 'Tshangu'] },
    { nom: 'Haut-Uélé', risque: 'eleve', capital: 'Isiro' },
    { nom: 'Nord-Ubangi', risque: 'eleve', capital: 'Gbadolite' },
    { nom: 'Lualaba', risque: 'eleve', capital: 'Kolwezi' },
    { nom: 'Haut-Katanga', risque: 'moyen', capital: 'Lubumbashi' },
    { nom: 'Maniema', risque: 'moyen', capital: 'Kindu' },
    { nom: 'Tanganyika', risque: 'moyen', capital: 'Kalemie' },
    { nom: 'Kasaï', risque: 'moyen', capital: 'Tshikapa' },
    { nom: 'Kasaï-Central', risque: 'moyen', capital: 'Kananga' },
    { nom: 'Kasaï-Oriental', risque: 'moyen', capital: 'Mbuji-Mayi' },
    { nom: 'Kongo Central', risque: 'moyen', capital: 'Matadi' },
    { nom: 'Kwango', risque: 'moyen', capital: 'Kenge' },
    { nom: 'Kwilu', risque: 'moyen', capital: 'Bandundu' },
    { nom: 'Lomami', risque: 'faible', capital: 'Kabinda' },
    { nom: 'Mai-Ndombe', risque: 'moyen', capital: 'Inongo' },
    { nom: 'Mongala', risque: 'moyen', capital: 'Lisala' },
    { nom: 'Sankuru', risque: 'moyen', capital: 'Lodja' },
    { nom: 'Sud-Ubangi', risque: 'moyen', capital: 'Gemena' },
    { nom: 'Tshopo', risque: 'moyen', capital: 'Kisangani' },
    { nom: 'Tshuapa', risque: 'moyen', capital: 'Boende' },
    { nom: 'Bas-Uélé', risque: 'moyen', capital: 'Buta' },
    { nom: 'Haut-Lomami', risque: 'moyen', capital: 'Kamina' },
    { nom: 'Équateur', risque: 'moyen', capital: 'Mbandaka' },
  ];

  const statsMap = {};
  statsData?.stats?.forEach(s => { statsMap[s._id] = s; });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Couverture provinciale</h1>
        <p className="text-slate-400 text-sm mt-0.5">26 provinces RDC + 4 districts de Kinshasa</p>
      </div>

      {/* Résumé risques */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Object.entries(risqueColors).map(([r, c]) => {
          const count = PROVINCES_DATA.filter(p => p.risque === r).length;
          return (
            <div key={r} className="card p-4" style={{ background: c.bg, border: `1px solid ${c.border}` }}>
              <div className="text-lg font-black" style={{ color: c.text }}>{count}</div>
              <div className="text-xs text-slate-400 mt-0.5">{c.label}</div>
            </div>
          );
        })}
      </div>

      {/* Grid provinces */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
        {PROVINCES_DATA.map(p => {
          const st = statsMap[p.nom];
          const rc = risqueColors[p.risque];
          return (
            <div key={p.nom} className="card p-4" style={{ borderColor: rc.border }}>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="font-bold text-white text-sm">{p.nom}</div>
                  <div className="text-xs text-slate-500">{p.capital}</div>
                </div>
                <span className="text-xs font-semibold" style={{ color: rc.text }}>{rc.label.split(' ')[0]}</span>
              </div>
              {p.districts?.length > 0 && (
                <div className="text-xs text-slate-600 mb-2">Districts: {p.districts.join(' · ')}</div>
              )}
              <div className="flex items-center justify-between text-xs pt-2 border-t" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                <span className="text-slate-500">Signalements</span>
                <span className="font-mono font-bold" style={{ color: rc.text }}>{st?.total || 0}</span>
              </div>
              {st && (
                <div className="mt-1.5 h-1 rounded-full overflow-hidden" style={{ background: 'var(--dark-600)' }}>
                  <div className="h-full rounded-full"
                    style={{ width: `${Math.min((st.total / 50) * 100, 100)}%`, background: rc.text }} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
