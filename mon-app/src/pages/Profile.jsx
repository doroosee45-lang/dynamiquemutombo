import React, { useState } from 'react';
import { User, Shield, Star, Bell, FileText, Edit2, Save, X } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { useAuthStore, useNotifStore } from '../store';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import toast from 'react-hot-toast';

const roleColors = { superadmin: 'badge-rouge', admin: 'badge-rouge', moderator: 'badge-jaune', editor: 'badge-bleu', citizen: 'badge-gris' };
const roleLabels = { superadmin: '👑 Super Admin', admin: '🛡️ Administrateur', moderator: '⚙️ Modérateur', editor: '✏️ Éditeur', citizen: '🏳️ Citoyen' };

export default function Profile() {
  const { user, updateUser } = useAuthStore();
  const { notifications, unreadCount } = useNotifStore();
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ nom: user?.nom || '', province: user?.province || '' });
  const [activeTab, setActiveTab] = useState('info');

  const { data: mesSignalements } = useQuery({
    queryKey: ['mes-signalements'],
    queryFn: () => api.get('/signalements/mine').then(r => r.data),
    enabled: activeTab === 'signalements'
  });

  const updateMutation = useMutation({
    mutationFn: (data) => api.put('/auth/me', data),
    onSuccess: (res) => {
      updateUser(res.data.user);
      setEditing(false);
      toast.success('Profil mis à jour');
    },
    onError: () => toast.error('Erreur lors de la mise à jour')
  });

  const PROVINCES = ['Kinshasa', 'Nord-Kivu', 'Sud-Kivu', 'Ituri', 'Haut-Katanga', 'Kasaï', 'Maniema'];

  const tabs = [
    { id: 'info', label: 'Profil', icon: User },
    { id: 'signalements', label: 'Mes signalements', icon: FileText },
    { id: 'notifs', label: `Notifications (${unreadCount})`, icon: Bell },
  ];

  const statusBadge = { en_attente: 'badge-gris', verifie: 'badge-jaune', en_cours: 'badge-bleu', resolu: 'badge-vert', rejete: 'badge-rouge' };

  // Reputation niveau
  const getLevel = (rep) => {
    if (rep >= 5000) return { label: 'Leader Citoyen', icon: '⭐', color: 'var(--rdc-jaune)' };
    if (rep >= 2000) return { label: 'Activiste', icon: '✊', color: 'var(--rdc-rouge)' };
    if (rep >= 500) return { label: 'Observateur', icon: '👁️', color: 'var(--rdc-bleu)' };
    return { label: 'Débutant', icon: '🏳️', color: '#94a3b8' };
  };

  const level = getLevel(user?.reputation || 0);
  const nextThreshold = user?.reputation >= 5000 ? 5000 : user?.reputation >= 2000 ? 5000 : user?.reputation >= 500 ? 2000 : 500;
  const progress = Math.min(((user?.reputation || 0) / nextThreshold) * 100, 100);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile header */}
      <div className="card p-6">
        <div className="flex items-start gap-5">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-black flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, var(--rdc-rouge), #8b0a1a)' }}>
            {user?.nom?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-black text-white">{user?.nom}</h1>
              <span className={`badge ${roleColors[user?.role] || 'badge-gris'}`}>
                {roleLabels[user?.role]}
              </span>
            </div>
            <div className="text-sm text-slate-400 mb-3">{user?.email} · {user?.province}</div>

            {/* Réputation */}
            <div className="flex items-center gap-3 mb-2">
              <span className="text-lg">{level.icon}</span>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold" style={{ color: level.color }}>{level.label}</span>
                  <span className="font-mono text-sm text-white">{user?.reputation || 0} pts</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--dark-600)' }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, background: level.color }} />
                </div>
                <div className="text-xs text-slate-600 mt-1">
                  {nextThreshold - (user?.reputation || 0)} pts pour le prochain niveau
                </div>
              </div>
            </div>

            {/* Badges */}
            {user?.badges?.length > 0 && (
              <div className="flex items-center gap-2 mt-2">
                {user.badges.map((b, i) => (
                  <span key={i} title={b.nom} className="text-lg cursor-help">{b.icone}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'var(--dark-800)' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === t.id ? 'text-white' : 'text-slate-400 hover:text-white'}`}
            style={activeTab === t.id ? { background: 'var(--rdc-rouge)' } : {}}>
            <t.icon size={14} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab: Info */}
      {activeTab === 'info' && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-white">Informations personnelles</h2>
            {!editing ? (
              <button onClick={() => setEditing(true)} className="btn-secondary text-xs">
                <Edit2 size={13} /> Modifier
              </button>
            ) : (
              <button onClick={() => setEditing(false)} className="btn-secondary text-xs text-slate-400">
                <X size={13} /> Annuler
              </button>
            )}
          </div>

          {editing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Nom complet</label>
                <input className="input" value={form.nom} onChange={e => setForm(f => ({ ...f, nom: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Province</label>
                <select className="input" value={form.province} onChange={e => setForm(f => ({ ...f, province: e.target.value }))}>
                  {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <button onClick={() => updateMutation.mutate(form)} className="btn-primary"
                disabled={updateMutation.isPending}>
                <Save size={14} /> {updateMutation.isPending ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { label: 'Nom', value: user?.nom },
                { label: 'Email', value: user?.email },
                { label: 'Province', value: user?.province },
                { label: 'Rôle', value: roleLabels[user?.role] },
                { label: 'Réputation', value: `${user?.reputation || 0} points` },
                { label: 'Badges', value: user?.badges?.length ? user.badges.map(b => b.nom).join(', ') : 'Aucun' },
              ].map(f => (
                <div key={f.label} className="p-3 rounded-lg" style={{ background: 'var(--dark-700)' }}>
                  <div className="text-xs text-slate-500 mb-1">{f.label}</div>
                  <div className="text-sm font-medium text-white">{f.value}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Signalements */}
      {activeTab === 'signalements' && (
        <div className="space-y-3">
          <h2 className="font-bold text-white">Mes signalements ({mesSignalements?.signalements?.length || 0})</h2>
          {mesSignalements?.signalements?.map(s => (
            <div key={s._id} className="card p-4">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`badge ${statusBadge[s.statut] || 'badge-gris'}`}>{s.statut?.replace('_', ' ')}</span>
                    <span className="badge badge-gris capitalize">{s.type}</span>
                  </div>
                  <div className="text-sm font-medium text-white">{s.titre}</div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {formatDistanceToNow(new Date(s.createdAt), { addSuffix: true, locale: fr })} · {s.province}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-500">Votes</div>
                  <div className="font-mono text-sm font-bold" style={{ color: 'var(--rdc-rouge)' }}>{s.scoreVotes || 0}</div>
                </div>
              </div>
            </div>
          ))}
          {(!mesSignalements?.signalements || mesSignalements.signalements.length === 0) && (
            <div className="text-center text-slate-500 py-12">Aucun signalement pour l'instant</div>
          )}
        </div>
      )}

      {/* Tab: Notifications */}
      {activeTab === 'notifs' && (
        <div className="space-y-2">
          <h2 className="font-bold text-white">Notifications ({notifications.length})</h2>
          {notifications.length === 0 ? (
            <div className="text-center text-slate-500 py-12">Aucune notification</div>
          ) : notifications.map(n => (
            <div key={n._id} className={`card p-4 ${!n.lue ? 'border-red-500/20' : ''}`}
              style={!n.lue ? { background: 'rgba(206,17,38,0.05)' } : {}}>
              <div className="flex items-start gap-3">
                {!n.lue && <span className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5" style={{ background: 'var(--rdc-rouge)' }} />}
                <div className="flex-1">
                  <div className="text-sm font-semibold text-white">{n.titre}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{n.message}</div>
                  <div className="text-xs text-slate-600 mt-1">
                    {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: fr })}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
