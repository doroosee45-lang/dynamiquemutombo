import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer } from 'recharts';
import { Shield, Users, AlertTriangle, CheckCircle, TrendingUp, Bell, Send } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '../../services/api';
import toast from 'react-hot-toast';

const COLORS = ['#CE1126', '#007FFF', '#009A44', '#F7D618', '#8b5cf6', '#f97316', '#ec4899'];

export default function AdminDashboard() {
  const [province, setProvince] = useState('');
  const [alertForm, setAlertForm] = useState({ titre: '', message: '', province: '' });
  const [showAlertModal, setShowAlertModal] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard', province],
    queryFn: () => api.get(`/admin/dashboard${province ? `/${province}` : ''}`).then(r => r.data)
  });

  const alertMutation = useMutation({
    mutationFn: (d) => api.post('/admin/alert', d),
    onSuccess: () => { toast.success('Alerte envoyée !'); setShowAlertModal(false); setAlertForm({ titre: '', message: '', province: '' }); },
    onError: () => toast.error('Erreur lors de l\'envoi')
  });

  const stats = data?.stats;

  const kpis = [
    { label: 'Utilisateurs', value: stats?.totalUsers || 0, icon: Users, color: 'var(--rdc-bleu)', bg: 'rgba(0,127,255,0.1)' },
    { label: 'Signalements', value: stats?.totalSignalements || 0, icon: AlertTriangle, color: 'var(--rdc-rouge)', bg: 'rgba(206,17,38,0.1)' },
    { label: 'En attente', value: stats?.enAttente || 0, icon: AlertTriangle, color: '#f97316', bg: 'rgba(249,115,22,0.1)' },
    { label: 'Résolus', value: stats?.resolus || 0, icon: CheckCircle, color: 'var(--rdc-vert)', bg: 'rgba(0,154,68,0.1)' },
    { label: 'Taux résolution', value: `${stats?.tauxResolution || 0}%`, icon: TrendingUp, color: 'var(--rdc-jaune)', bg: 'rgba(247,214,24,0.1)' },
    { label: 'Pétitions', value: stats?.totalPetitions || 0, icon: Shield, color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
  ];

  const PROVINCES_LIST = ['Kinshasa', 'Nord-Kivu', 'Sud-Kivu', 'Ituri', 'Haut-Katanga'];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Dashboard Administration</h1>
          <p className="text-slate-400 text-sm mt-0.5">Vue analytique nationale · Dynamique Israël Mutombo</p>
        </div>
        <div className="flex items-center gap-3">
          <select className="input text-sm w-40" value={province} onChange={e => setProvince(e.target.value)}>
            <option value="">🇨🇩 National</option>
            {PROVINCES_LIST.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <button onClick={() => setShowAlertModal(true)} className="btn-primary text-sm">
            <Bell size={15} /> Alerte
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpis.map((k, i) => (
          <div key={i} className="card p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: k.bg }}>
                <k.icon size={15} style={{ color: k.color }} />
              </div>
            </div>
            <div className="font-mono text-xl font-black text-white">{isLoading ? '...' : k.value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{k.label}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Par type */}
        <div className="card p-5">
          <h3 className="font-bold text-white mb-4">Signalements par type</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stats?.parType || []} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <XAxis dataKey="_id" tick={{ fill: '#64748b', fontSize: 10 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
              <Tooltip contentStyle={{ background: 'var(--dark-700)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: 'white' }} />
              <Bar dataKey="count" fill="var(--rdc-rouge)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Par statut */}
        <div className="card p-5">
          <h3 className="font-bold text-white mb-4">Répartition par statut</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={stats?.parStatut || []} dataKey="count" nameKey="_id" cx="50%" cy="50%" outerRadius={80} label={({ _id, percent }) => `${_id} ${(percent * 100).toFixed(0)}%`}>
                {(stats?.parStatut || []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: 'var(--dark-700)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: 'white' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top provinces + Signalements récents */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card p-5">
          <h3 className="font-bold text-white mb-4">Top provinces actives</h3>
          <div className="space-y-2">
            {(stats?.parProvince || []).map((p, i) => (
              <div key={p._id} className="flex items-center gap-3">
                <span className="font-mono text-xs w-5 text-slate-500">{i + 1}</span>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-white">{p._id}</span>
                    <span className="font-mono text-xs" style={{ color: 'var(--rdc-rouge)' }}>{p.count}</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--dark-600)' }}>
                    <div className="h-full rounded-full" style={{
                      width: `${Math.min((p.count / (stats.parProvince[0]?.count || 1)) * 100, 100)}%`,
                      background: 'var(--rdc-rouge)'
                    }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <h3 className="font-bold text-white mb-4">Signalements récents</h3>
          <div className="space-y-3">
            {(stats?.recents || []).map(s => (
              <div key={s._id} className="flex items-center gap-3 p-2 rounded-lg" style={{ background: 'var(--dark-700)' }}>
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: s.statut === 'resolu' ? 'var(--rdc-vert)' : s.statut === 'en_cours' ? 'var(--rdc-bleu)' : 'var(--rdc-rouge)' }} />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-white truncate">{s.titre}</div>
                  <div className="text-xs text-slate-500">{s.province} · {s.auteur?.nom}</div>
                </div>
                <span className="text-xs capitalize text-slate-500">{s.statut?.replace('_', ' ')}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Alert Modal */}
      {showAlertModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.8)' }}>
          <div className="w-full max-w-md card p-6">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Bell size={18} style={{ color: 'var(--rdc-rouge)' }} /> Envoyer une alerte
            </h2>
            <div className="space-y-3">
              <input className="input" placeholder="Titre de l'alerte" value={alertForm.titre}
                onChange={e => setAlertForm(f => ({ ...f, titre: e.target.value }))} />
              <textarea className="input resize-none" rows={3} placeholder="Message de l'alerte..."
                value={alertForm.message} onChange={e => setAlertForm(f => ({ ...f, message: e.target.value }))} />
              <select className="input" value={alertForm.province} onChange={e => setAlertForm(f => ({ ...f, province: e.target.value }))}>
                <option value="">🇨🇩 Nationale (tous)</option>
                {PROVINCES_LIST.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              <div className="flex gap-3">
                <button onClick={() => setShowAlertModal(false)} className="btn-secondary flex-1">Annuler</button>
                <button onClick={() => alertMutation.mutate(alertForm)} className="btn-primary flex-1"
                  disabled={!alertForm.titre || !alertForm.message || alertMutation.isPending}>
                  <Send size={14} /> {alertMutation.isPending ? 'Envoi...' : 'Envoyer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
