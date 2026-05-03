import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Filter, Search, AlertTriangle, MapPin, ThumbsUp, Eye, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { useAuthStore } from '../store';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import toast from 'react-hot-toast';

const TYPES = ['insecurite', 'banditisme', 'transport', 'corruption', 'tribalisme', 'infrastructure', 'sante', 'education', 'environnement', 'autre'];
const STATUTS = ['en_attente', 'verifie', 'en_cours', 'resolu'];
const PROVINCES = ['Kinshasa', 'Nord-Kivu', 'Sud-Kivu', 'Ituri', 'Haut-Uélé', 'Haut-Katanga', 'Kasaï', 'Maniema', 'Équateur'];

export default function Signalements() {
  const { isAuthenticated } = useAuthStore();
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ type: '', statut: '', province: '', search: '' });
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ titre: '', description: '', type: 'insecurite', province: 'Kinshasa', localisation: { adresse: '' } });

  const queryParams = new URLSearchParams({ page, limit: 10, ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)) }).toString();

  const { data, isLoading } = useQuery({
    queryKey: ['signalements', page, filters],
    queryFn: () => api.get(`/signalements?${queryParams}`).then(r => r.data)
  });

  const createMutation = useMutation({
    mutationFn: (data) => api.post('/signalements', data),
    onSuccess: () => {
      toast.success('Signalement soumis avec succès !');
      setShowCreate(false);
      setForm({ titre: '', description: '', type: 'insecurite', province: 'Kinshasa', localisation: { adresse: '' } });
      qc.invalidateQueries(['signalements']);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Erreur lors de la création')
  });

  const handleCreate = (e) => {
    e.preventDefault();
    if (!form.titre || !form.description) return toast.error('Titre et description requis');
    createMutation.mutate({ ...form, localisation: JSON.stringify(form.localisation) });
  };

  const priorityStyle = { critical: 'text-rose-400', high: 'text-orange-400', medium: 'text-yellow-400', low: 'text-green-400' };
  const statusBadge = { en_attente: 'badge-gris', verifie: 'badge-jaune', en_cours: 'badge-bleu', resolu: 'badge-vert', rejete: 'badge-rouge' };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Signalements citoyens</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            {data?.totalDocs || '—'} signalements · Plateforme 26 provinces RDC
          </p>
        </div>
        {isAuthenticated && (
          <button onClick={() => setShowCreate(true)} className="btn-primary">
            <Plus size={16} /> Signaler
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input className="input pl-8" placeholder="Rechercher..." value={filters.search}
              onChange={e => setFilters(f => ({ ...f, search: e.target.value }))} />
          </div>
          <select className="input" value={filters.type} onChange={e => setFilters(f => ({ ...f, type: e.target.value }))}>
            <option value="">Tous les types</option>
            {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select className="input" value={filters.statut} onChange={e => setFilters(f => ({ ...f, statut: e.target.value }))}>
            <option value="">Tous les statuts</option>
            {STATUTS.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
          </select>
          <select className="input" value={filters.province} onChange={e => setFilters(f => ({ ...f, province: e.target.value }))}>
            <option value="">Toutes provinces</option>
            {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {isLoading ? Array(5).fill(0).map((_, i) => (
          <div key={i} className="card p-5">
            <div className="skeleton h-4 w-32 mb-3" />
            <div className="skeleton h-5 w-3/4 mb-2" />
            <div className="skeleton h-3 w-full" />
          </div>
        )) : data?.docs?.map(s => (
          <Link key={s._id} to={`/signalements/${s._id}`}
            className="card p-5 block hover:border-white/15 transition-all">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(206,17,38,0.1)' }}>
                <AlertTriangle size={18} style={{ color: 'var(--rdc-rouge)' }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className={`badge ${statusBadge[s.statut] || 'badge-gris'}`}>{s.statut?.replace('_', ' ')}</span>
                  <span className="badge badge-gris capitalize">{s.type}</span>
                  <span className={`text-xs font-semibold ${priorityStyle[s.priorite]}`}>● {s.priorite}</span>
                  {s.ia?.estDoublon && <span className="badge badge-jaune">⚠ Doublon détecté</span>}
                </div>
                <h3 className="font-semibold text-white mb-1">{s.titre}</h3>
                <p className="text-sm text-slate-400 line-clamp-1">{s.description}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                  <span className="flex items-center gap-1"><MapPin size={11} />{s.province}</span>
                  <span className="flex items-center gap-1"><ThumbsUp size={11} />{s.scoreVotes || 0}</span>
                  <span className="flex items-center gap-1"><Eye size={11} />{s.vues || 0}</span>
                  <span>{formatDistanceToNow(new Date(s.createdAt), { addSuffix: true, locale: fr })}</span>
                  {s.auteur && <span>par {s.auteur.nom}</span>}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="btn-secondary disabled:opacity-40">
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm text-slate-400 font-mono">{page} / {data.totalPages}</span>
          <button onClick={() => setPage(p => Math.min(data.totalPages, p + 1))} disabled={page === data.totalPages}
            className="btn-secondary disabled:opacity-40">
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Modal Créer */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="w-full max-w-lg rounded-2xl shadow-2xl" style={{ background: 'var(--dark-700)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              <h2 className="text-lg font-bold text-white">Nouveau signalement</h2>
              <button onClick={() => setShowCreate(false)} className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Titre *</label>
                <input className="input" placeholder="Décrivez brièvement l'incident..."
                  value={form.titre} onChange={e => setForm(f => ({ ...f, titre: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Type *</label>
                  <select className="input" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                    {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Province *</label>
                  <select className="input" value={form.province} onChange={e => setForm(f => ({ ...f, province: e.target.value }))}>
                    {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Description *</label>
                <textarea className="input resize-none" rows={4}
                  placeholder="Décrivez l'incident en détail : où, quand, comment..."
                  value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Adresse / Lieu</label>
                <input className="input" placeholder="Ex: Avenue Kasa-Vubu, Commune de Gombe..."
                  value={form.localisation.adresse}
                  onChange={e => setForm(f => ({ ...f, localisation: { ...f.localisation, adresse: e.target.value } }))} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary flex-1">Annuler</button>
                <button type="submit" className="btn-primary flex-1" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Envoi...' : 'Soumettre'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
