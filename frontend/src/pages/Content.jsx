// ── PUBLICATIONS ──────────────────────────────────────────────
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Zap, Eye, MessageSquare, Filter } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

const typeColors = { article: 'badge-bleu', enquete: 'badge-jaune', alerte: 'badge-rouge', officiel: 'badge-vert' };

export function Publications() {
  const [type, setType] = useState('');
  const { data, isLoading } = useQuery({
    queryKey: ['publications', type],
    queryFn: () => api.get(`/publications?limit=12${type ? `&type=${type}` : ''}`).then(r => r.data)
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Publications officielles</h1>
          <p className="text-slate-400 text-sm mt-0.5">Articles, enquêtes et alertes urgentes</p>
        </div>
        <div className="flex gap-2">
          {['', 'article', 'enquete', 'alerte', 'officiel'].map(t => (
            <button key={t} onClick={() => setType(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${type === t ? 'text-white' : 'text-slate-400 hover:text-white'}`}
              style={type === t ? { background: 'var(--rdc-rouge)' } : { background: 'var(--dark-700)' }}>
              {t || 'Tout'}
            </button>
          ))}
        </div>
      </div>

      {/* Urgent banner */}
      {data?.docs?.filter(p => p.urgent).length > 0 && (
        <div className="urgent-banner">
          <div className="flex items-center gap-2 mb-2">
            <Zap size={16} style={{ color: 'var(--rdc-rouge)' }} />
            <span className="text-sm font-bold text-white">ALERTE URGENTE</span>
          </div>
          {data.docs.filter(p => p.urgent).map(p => (
            <div key={p._id} className="text-sm text-slate-200">{p.titre}</div>
          ))}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {isLoading ? Array(6).fill(0).map((_, i) => (
          <div key={i} className="card p-5 space-y-2">
            <div className="skeleton h-4 w-20" />
            <div className="skeleton h-5 w-full" />
            <div className="skeleton h-3 w-3/4" />
          </div>
        )) : data?.docs?.map(p => (
          <div key={p._id} className={`card p-5 ${p.urgent ? 'border-red-500/30' : ''}`}>
            <div className="flex items-start gap-3">
              {p.image && (
                <img src={p.image} alt="" className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`badge ${typeColors[p.type] || 'badge-gris'}`}>{p.type}</span>
                  {p.urgent && <span className="badge badge-rouge animate-pulse">● URGENT</span>}
                </div>
                <h3 className="font-bold text-white text-sm mb-1 line-clamp-2">{p.titre}</h3>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1"><Eye size={10} />{p.vues}</span>
                  <span>par {p.auteur?.nom}</span>
                  <span>{formatDistanceToNow(new Date(p.createdAt), { addSuffix: true, locale: fr })}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── PÉTITIONS ─────────────────────────────────────────────────
export function Petitions() {
  const { data, isLoading } = useQuery({
    queryKey: ['petitions'],
    queryFn: () => api.get('/petitions?limit=10').then(r => r.data)
  });

  const [signing, setSigning] = useState({});

  const signer = async (id) => {
    try {
      setSigning(s => ({ ...s, [id]: true }));
      await api.post(`/petitions/${id}/signer`);
      window.location.reload();
    } catch (e) {
      alert(e.response?.data?.message || 'Erreur');
    } finally {
      setSigning(s => ({ ...s, [id]: false }));
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Pétitions citoyennes</h1>
        <p className="text-slate-400 text-sm mt-0.5">Signez et lancez des pétitions pour changer les choses</p>
      </div>
      <div className="space-y-4">
        {isLoading ? Array(4).fill(0).map((_, i) => (
          <div key={i} className="card p-6 space-y-3"><div className="skeleton h-5 w-3/4" /><div className="skeleton h-3 w-full" /><div className="skeleton h-2 w-full" /></div>
        )) : data?.docs?.map(p => {
          const pct = Math.min(Math.round((p.nbSignatures / p.objectif) * 100), 100);
          return (
            <div key={p._id} className="card p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`badge ${p.statut === 'atteinte' ? 'badge-vert' : 'badge-bleu'}`}>{p.statut}</span>
                    {p.province && <span className="badge badge-gris">{p.province}</span>}
                  </div>
                  <h3 className="font-bold text-white mb-2">{p.titre}</h3>
                  <p className="text-sm text-slate-400 line-clamp-2 mb-4">{p.description}</p>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400"><strong className="text-white font-mono">{p.nbSignatures}</strong> signatures</span>
                      <span className="text-slate-500">Objectif: {p.objectif}</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--dark-600)' }}>
                      <div className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, background: pct >= 100 ? 'var(--rdc-vert)' : 'var(--rdc-bleu)' }} />
                    </div>
                    <div className="text-xs text-right font-mono" style={{ color: pct >= 100 ? 'var(--rdc-vert)' : 'var(--rdc-bleu)' }}>
                      {pct}%
                    </div>
                  </div>
                </div>
                <button onClick={() => signer(p._id)} disabled={signing[p._id] || p.statut !== 'active'}
                  className="btn-primary flex-shrink-0 disabled:opacity-50">
                  {signing[p._id] ? '...' : '✍️ Signer'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── CAMPAGNES ─────────────────────────────────────────────────
export function Campaigns() {
  const { data, isLoading } = useQuery({
    queryKey: ['campaigns'],
    queryFn: () => api.get('/campaigns?limit=10').then(r => r.data)
  });

  const typeColors = { materiel: 'badge-jaune', humain: 'badge-vert', financier: 'badge-bleu', sensibilisation: 'badge-rouge' };

  const rejoindre = async (id) => {
    try {
      await api.post(`/campaigns/${id}/rejoindre`);
      window.location.reload();
    } catch (e) { alert(e.response?.data?.message || 'Erreur'); }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Campagnes de mobilisation</h1>
        <p className="text-slate-400 text-sm mt-0.5">Rejoignez et soutenez les campagnes citoyennes</p>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {isLoading ? Array(4).fill(0).map((_, i) => (
          <div key={i} className="card p-5 space-y-3"><div className="skeleton h-5 w-3/4" /><div className="skeleton h-3 w-full" /></div>
        )) : data?.docs?.map(c => (
          <div key={c._id} className="card p-5">
            {c.image && <img src={c.image} alt="" className="w-full h-32 object-cover rounded-lg mb-4" />}
            <div className="flex items-center gap-2 mb-2">
              <span className={`badge ${typeColors[c.type] || 'badge-gris'}`}>{c.type}</span>
              <span className={`badge ${c.statut === 'active' ? 'badge-vert' : 'badge-gris'}`}>{c.statut}</span>
            </div>
            <h3 className="font-bold text-white mb-2">{c.titre}</h3>
            <p className="text-sm text-slate-400 line-clamp-2 mb-4">{c.description}</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">
                <strong className="text-white font-mono">{c.nbParticipants}</strong> participants
              </span>
              <button onClick={() => rejoindre(c._id)} disabled={c.statut !== 'active'} className="btn-primary text-xs disabled:opacity-50">
                Rejoindre
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── INNOVATIONS ───────────────────────────────────────────────
export function Innovations() {
  const { data, isLoading } = useQuery({
    queryKey: ['innovations'],
    queryFn: () => api.get('/innovations?limit=12').then(r => r.data)
  });

  const voter = async (id) => {
    try { await api.post(`/innovations/${id}/vote`); window.location.reload(); }
    catch (e) { alert(e.response?.data?.message || 'Erreur'); }
  };

  const catColors = { technologie: 'badge-bleu', social: 'badge-vert', economique: 'badge-jaune', environnemental: 'badge-vert', autre: 'badge-gris' };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Innovations jeunes 💡</h1>
        <p className="text-slate-400 text-sm mt-0.5">Projets citoyens soumis par la communauté</p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? Array(6).fill(0).map((_, i) => (
          <div key={i} className="card p-5 space-y-3"><div className="skeleton h-5 w-3/4" /><div className="skeleton h-3 w-full" /></div>
        )) : data?.docs?.map(inn => (
          <div key={inn._id} className="card p-5 flex flex-col">
            {inn.image && <img src={inn.image} alt="" className="w-full h-24 object-cover rounded-lg mb-3" />}
            <div className="flex items-center gap-2 mb-2">
              <span className={`badge ${catColors[inn.categorie] || 'badge-gris'}`}>{inn.categorie}</span>
              <span className={`badge ${inn.statut === 'valide' ? 'badge-vert' : inn.statut === 'en_cours' ? 'badge-bleu' : 'badge-gris'}`}>
                {inn.statut}
              </span>
            </div>
            <h3 className="font-bold text-white mb-1.5 flex-1">{inn.titre}</h3>
            <p className="text-xs text-slate-400 line-clamp-2 mb-3">{inn.description}</p>
            <div className="flex items-center justify-between mt-auto">
              <span className="text-xs text-slate-500">par {inn.auteur?.nom}</span>
              <button onClick={() => voter(inn._id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-yellow-500/10 text-slate-400 hover:text-yellow-400 transition-colors">
                👍 {inn.scoreVotes}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── LEADERBOARD ───────────────────────────────────────────────
export function Leaderboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: () => api.get('/admin/leaderboard').then(r => r.data)
  });

  const roleIcon = { superadmin: '👑', admin: '🛡️', moderator: '⚙️', editor: '✏️', citizen: '🏳️' };
  const podiumColors = ['#F7D618', '#94a3b8', '#CD7F32'];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Classement citoyens 🏆</h1>
        <p className="text-slate-400 text-sm mt-0.5">Les citoyens les plus actifs de la Dynamique</p>
      </div>

      {/* Podium top 3 */}
      {data?.users?.length >= 3 && (
        <div className="flex items-end justify-center gap-4 py-6">
          {[1, 0, 2].map((idx) => {
            const u = data.users[idx];
            const rank = idx + 1;
            const heights = { 0: 'h-28', 1: 'h-20', 2: 'h-16' };
            return (
              <div key={u._id} className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-black mb-2"
                  style={{ background: podiumColors[idx], color: '#000' }}>
                  {u.nom?.charAt(0)}
                </div>
                <div className="text-xs font-bold text-white mb-1">{u.nom}</div>
                <div className="font-mono text-xs mb-2" style={{ color: podiumColors[idx] }}>
                  {u.reputation} pts
                </div>
                <div className={`w-20 rounded-t-lg flex items-center justify-center text-2xl font-black ${heights[idx]}`}
                  style={{ background: podiumColors[idx] + '33', border: `2px solid ${podiumColors[idx]}40` }}>
                  {rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉'}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full ranking */}
      <div className="card overflow-hidden">
        {isLoading ? Array(10).fill(0).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
            <div className="skeleton h-4 w-6" />
            <div className="skeleton w-8 h-8 rounded-full" />
            <div className="flex-1 skeleton h-4" />
          </div>
        )) : data?.users?.map((u, i) => (
          <div key={u._id} className="flex items-center gap-4 p-4 border-b hover:bg-white/3 transition-colors"
            style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
            <span className={`font-mono text-sm w-6 text-center font-bold ${i < 3 ? 'text-yellow-400' : 'text-slate-500'}`}>
              {i + 1}
            </span>
            <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
              style={{ background: i === 0 ? 'var(--rdc-jaune)' : i === 1 ? '#94a3b8' : i === 2 ? '#CD7F32' : 'var(--dark-500)', color: i < 3 ? '#000' : 'white' }}>
              {u.nom?.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-white">{u.nom}</span>
                <span>{roleIcon[u.role] || '🏳️'}</span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-slate-500">{u.province}</span>
                {u.badges?.map((b, bi) => (
                  <span key={bi} className="text-xs">{b.icone}</span>
                ))}
              </div>
            </div>
            <div className="font-mono text-sm font-bold" style={{ color: 'var(--rdc-jaune)' }}>
              {u.reputation} pts
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
