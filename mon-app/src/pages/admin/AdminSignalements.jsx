import React, { useState } from 'react';
import { CheckCircle, XCircle, Clock, AlertTriangle, Brain, ChevronLeft, ChevronRight } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import toast from 'react-hot-toast';

const statusBadge = { en_attente: 'badge-gris', verifie: 'badge-jaune', en_cours: 'badge-bleu', resolu: 'badge-vert', rejete: 'badge-rouge' };
const priorityColor = { critical: '#f43f5e', high: '#f97316', medium: '#eab308', low: '#22c55e' };
const sentimentColor = { alarmant: '#f43f5e', negatif: '#f97316', neutre: '#94a3b8', positif: '#4ade80' };

export default function AdminSignalements() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [statut, setStatut] = useState('en_attente');
  const [selected, setSelected] = useState(null);
  const [note, setNote] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-signalements', page, statut],
    queryFn: () => api.get(`/signalements?page=${page}&limit=15${statut ? `&statut=${statut}` : ''}&sort=-createdAt`).then(r => r.data)
  });

  const moderMutation = useMutation({
    mutationFn: ({ id, statut, noteModeration }) => api.put(`/signalements/${id}/moderate`, { statut, noteModeration }),
    onSuccess: (_, vars) => {
      toast.success(`Signalement ${vars.statut === 'verifie' ? 'validé' : vars.statut === 'rejete' ? 'rejeté' : 'mis à jour'}`);
      qc.invalidateQueries(['admin-signalements']);
      setSelected(null);
      setNote('');
    },
    onError: () => toast.error('Erreur de modération')
  });

  const quickMod = (id, s) => moderMutation.mutate({ id, statut: s, noteModeration: note });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Modération des signalements</h1>
          <p className="text-slate-400 text-sm mt-0.5">{data?.totalDocs || '—'} signalements · Analyse IA intégrée</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {['', 'en_attente', 'verifie', 'en_cours', 'resolu', 'rejete'].map(s => (
            <button key={s} onClick={() => { setStatut(s); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${statut === s ? 'text-white' : 'text-slate-400 hover:text-white'}`}
              style={statut === s ? { background: 'var(--rdc-rouge)' } : { background: 'var(--dark-700)' }}>
              {s || 'Tous'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Liste */}
        <div className="lg:col-span-2 space-y-3">
          {isLoading ? Array(8).fill(0).map((_, i) => (
            <div key={i} className="card p-4 space-y-2">
              <div className="skeleton h-4 w-24" />
              <div className="skeleton h-5 w-3/4" />
            </div>
          )) : data?.docs?.map(s => (
            <div key={s._id}
              onClick={() => setSelected(s)}
              className={`card p-4 cursor-pointer transition-all hover:border-white/15 ${selected?._id === s._id ? 'border-red-500/40' : ''}`}
              style={selected?._id === s._id ? { borderColor: 'var(--rdc-rouge)' } : {}}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className={`badge ${statusBadge[s.statut]}`}>{s.statut?.replace('_', ' ')}</span>
                    <span className="badge badge-gris capitalize">{s.type}</span>
                    <span className="text-xs font-semibold" style={{ color: priorityColor[s.priorite] }}>
                      ● {s.priorite}
                    </span>
                    {s.ia?.scoreFaux > 0.5 && (
                      <span className="badge badge-rouge flex items-center gap-1">
                        <Brain size={9} /> Suspect ({Math.round(s.ia.scoreFaux * 100)}%)
                      </span>
                    )}
                    {s.ia?.estDoublon && <span className="badge badge-jaune">⚠ Doublon</span>}
                    {s.ia?.sentiment === 'alarmant' && <span className="badge badge-rouge">🚨 Alarmant</span>}
                  </div>
                  <h3 className="text-sm font-semibold text-white truncate">{s.titre}</h3>
                  <p className="text-xs text-slate-400 mt-0.5 truncate">{s.description}</p>
                  <div className="text-xs text-slate-600 mt-1.5">
                    {s.province} · {s.auteur?.nom} · {formatDistanceToNow(new Date(s.createdAt), { addSuffix: true, locale: fr })}
                  </div>
                </div>

                {/* Quick actions */}
                {s.statut === 'en_attente' && (
                  <div className="flex flex-col gap-1.5 flex-shrink-0">
                    <button onClick={(e) => { e.stopPropagation(); quickMod(s._id, 'verifie'); }}
                      title="Valider"
                      className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-green-500/20 text-green-400 transition-colors border border-green-500/20">
                      <CheckCircle size={15} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); quickMod(s._id, 'rejete'); }}
                      title="Rejeter"
                      className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-red-500/20 text-red-400 transition-colors border border-red-500/20">
                      <XCircle size={15} />
                    </button>
                  </div>
                )}
                {s.statut === 'verifie' && (
                  <button onClick={(e) => { e.stopPropagation(); quickMod(s._id, 'en_cours'); }}
                    className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-blue-500/20 text-blue-400 transition-colors border border-blue-500/20">
                    <Clock size={15} />
                  </button>
                )}
                {s.statut === 'en_cours' && (
                  <button onClick={(e) => { e.stopPropagation(); quickMod(s._id, 'resolu'); }}
                    className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-green-500/20 text-green-400 transition-colors border border-green-500/20">
                    <CheckCircle size={15} />
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Pagination */}
          {data && data.totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary disabled:opacity-40">
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm font-mono text-slate-400">{page} / {data.totalPages}</span>
              <button onClick={() => setPage(p => Math.min(data.totalPages, p + 1))} disabled={page === data.totalPages} className="btn-secondary disabled:opacity-40">
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Detail panel */}
        <div className="space-y-4">
          {selected ? (
            <>
              <div className="card p-5">
                <h3 className="font-bold text-white mb-3">Détail</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Titre</div>
                    <div className="text-white font-medium">{selected.titre}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Description</div>
                    <div className="text-slate-300 text-xs leading-relaxed">{selected.description}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div><span className="text-slate-500">Province:</span> <span className="text-white">{selected.province}</span></div>
                    <div><span className="text-slate-500">Type:</span> <span className="text-white capitalize">{selected.type}</span></div>
                    <div><span className="text-slate-500">Votes:</span> <span className="text-white font-mono">{selected.scoreVotes || 0}</span></div>
                    <div><span className="text-slate-500">Vues:</span> <span className="text-white font-mono">{selected.vues || 0}</span></div>
                  </div>
                </div>
              </div>

              {/* IA panel */}
              {selected.ia?.analyseEffectuee && (
                <div className="card p-5" style={{ border: '1px solid rgba(0,127,255,0.2)' }}>
                  <div className="flex items-center gap-2 mb-3">
                    <Brain size={15} style={{ color: 'var(--rdc-bleu)' }} />
                    <h3 className="font-bold text-white text-sm">Analyse IA</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-center text-xs">
                    <div className="p-2 rounded-lg" style={{ background: 'var(--dark-700)' }}>
                      <div className="font-bold text-sm" style={{ color: sentimentColor[selected.ia.sentiment] }}>
                        {selected.ia.sentiment}
                      </div>
                      <div className="text-slate-500 mt-0.5">Sentiment</div>
                    </div>
                    <div className="p-2 rounded-lg" style={{ background: 'var(--dark-700)' }}>
                      <div className="font-bold text-sm font-mono" style={{ color: selected.ia.scoreFaux > 0.5 ? '#f43f5e' : '#4ade80' }}>
                        {Math.round((selected.ia.scoreFaux || 0) * 100)}%
                      </div>
                      <div className="text-slate-500 mt-0.5">Risque faux</div>
                    </div>
                    <div className="p-2 rounded-lg col-span-2" style={{ background: 'var(--dark-700)' }}>
                      <div className="text-slate-300 text-xs leading-relaxed">
                        {selected.ia.resume || 'Pas de résumé'}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Modération */}
              <div className="card p-5">
                <h3 className="font-bold text-white text-sm mb-3">Modération</h3>
                <div className="space-y-2">
                  <input className="input text-xs" placeholder="Note de modération (optionnel)"
                    value={note} onChange={e => setNote(e.target.value)} />
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: '✅ Valider', statut: 'verifie', style: 'text-green-400 border-green-500/20 hover:bg-green-500/10' },
                      { label: '🔄 En cours', statut: 'en_cours', style: 'text-blue-400 border-blue-500/20 hover:bg-blue-500/10' },
                      { label: '✅ Résoudre', statut: 'resolu', style: 'text-green-400 border-green-500/20 hover:bg-green-500/10' },
                      { label: '❌ Rejeter', statut: 'rejete', style: 'text-red-400 border-red-500/20 hover:bg-red-500/10' },
                    ].map(a => (
                      <button key={a.statut}
                        onClick={() => moderMutation.mutate({ id: selected._id, statut: a.statut, noteModeration: note })}
                        disabled={moderMutation.isPending}
                        className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-colors disabled:opacity-50 ${a.style}`}>
                        {a.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="card p-8 flex flex-col items-center justify-center text-center h-64">
              <AlertTriangle size={32} className="text-slate-600 mb-3" />
              <div className="text-slate-500 text-sm">Sélectionnez un signalement pour le modérer</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
