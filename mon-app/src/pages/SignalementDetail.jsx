import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ThumbsUp, ThumbsDown, MapPin, Eye, MessageSquare, Shield, AlertTriangle, Brain, Send } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { useAuthStore } from '../store';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import toast from 'react-hot-toast';

const statusBadge = { en_attente: 'badge-gris', verifie: 'badge-jaune', en_cours: 'badge-bleu', resolu: 'badge-vert', rejete: 'badge-rouge' };
const statusLabel = { en_attente: 'En attente', verifie: 'Vérifié', en_cours: 'En cours', resolu: 'Résolu', rejete: 'Rejeté' };

export default function SignalementDetail() {
  const { id } = useParams();
  const { isAuthenticated, user, hasRole } = useAuthStore();
  const qc = useQueryClient();
  const [comment, setComment] = useState('');
  const [modStatut, setModStatut] = useState('');
  const [modNote, setModNote] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['signalement', id],
    queryFn: () => api.get(`/signalements/${id}`).then(r => r.data)
  });

  const voteMutation = useMutation({
    mutationFn: (valeur) => api.post(`/signalements/${id}/vote`, { valeur }),
    onSuccess: () => qc.invalidateQueries(['signalement', id]),
    onError: (err) => toast.error(err.response?.data?.message || 'Erreur vote')
  });

  const commentMutation = useMutation({
    mutationFn: () => api.post('/comments', { cibleId: id, cibleType: 'signalement', contenu: comment }),
    onSuccess: () => { setComment(''); qc.invalidateQueries(['signalement', id]); toast.success('Commentaire ajouté'); },
    onError: (err) => toast.error(err.response?.data?.message || 'Erreur commentaire')
  });

  const moderMutation = useMutation({
    mutationFn: () => api.put(`/signalements/${id}/moderate`, { statut: modStatut, noteModeration: modNote }),
    onSuccess: () => { qc.invalidateQueries(['signalement', id]); toast.success('Signalement modéré'); },
    onError: (err) => toast.error(err.response?.data?.message || 'Erreur modération')
  });

  if (isLoading) return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="skeleton h-8 w-48" />
      <div className="card p-6 space-y-3">
        <div className="skeleton h-6 w-3/4" />
        <div className="skeleton h-4 w-full" />
        <div className="skeleton h-4 w-2/3" />
      </div>
    </div>
  );

  const { signalement: s, commentaires } = data || {};
  if (!s) return <div className="text-center text-slate-400 mt-20">Signalement introuvable</div>;

  const sentimentColor = { positif: '#4ade80', neutre: '#94a3b8', negatif: '#f97316', alarmant: '#f43f5e' };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link to="/signalements" className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors">
        <ArrowLeft size={16} /> Retour aux signalements
      </Link>

      {/* Main card */}
      <div className="card p-6">
        {/* Status bar */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <span className={`badge ${statusBadge[s.statut]}`}>{statusLabel[s.statut]}</span>
          <span className="badge badge-gris capitalize">{s.type}</span>
          <span className={`badge ${s.priorite === 'critical' ? 'badge-rouge' : s.priorite === 'high' ? 'badge-rouge' : 'badge-gris'}`}>
            {s.priorite}
          </span>
          {s.ia?.estDoublon && <span className="badge badge-jaune">⚠ Doublon potentiel</span>}
        </div>

        <h1 className="text-2xl font-black text-white mb-3">{s.titre}</h1>

        {/* Metadata */}
        <div className="flex items-center gap-4 text-xs text-slate-500 mb-5 flex-wrap">
          <span className="flex items-center gap-1"><MapPin size={12} />{s.province}{s.localisation?.adresse ? ` — ${s.localisation.adresse}` : ''}</span>
          <span className="flex items-center gap-1"><Eye size={12} />{s.vues} vues</span>
          <span className="flex items-center gap-1"><MessageSquare size={12} />{s.nbCommentaires || 0} commentaires</span>
          <span>par <strong className="text-slate-300">{s.auteur?.nom}</strong></span>
          <span>{s.createdAt ? format(new Date(s.createdAt), 'dd MMM yyyy HH:mm', { locale: fr }) : ''}</span>
        </div>

        <p className="text-slate-300 leading-relaxed text-sm">{s.description}</p>

        {/* Médias */}
        {s.medias?.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mt-4">
            {s.medias.map((m, i) => (
              <img key={i} src={m.url} alt={`Media ${i}`} className="rounded-lg w-full h-32 object-cover" />
            ))}
          </div>
        )}

        {/* Votes */}
        <div className="flex items-center gap-4 mt-6 pt-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-2">
            <button onClick={() => isAuthenticated ? voteMutation.mutate(1) : toast.error('Connectez-vous pour voter')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-green-500/10 text-slate-400 hover:text-green-400 transition-colors border border-transparent hover:border-green-500/20">
              <ThumbsUp size={15} />
              <span>{s.votes?.filter(v => v.valeur === 1).length || 0}</span>
            </button>
            <button onClick={() => isAuthenticated ? voteMutation.mutate(-1) : toast.error('Connectez-vous pour voter')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors border border-transparent hover:border-red-500/20">
              <ThumbsDown size={15} />
              <span>{s.votes?.filter(v => v.valeur === -1).length || 0}</span>
            </button>
            <span className="text-sm text-slate-500">Score: <strong className={s.scoreVotes >= 0 ? 'text-green-400' : 'text-red-400'}>{s.scoreVotes || 0}</strong></span>
          </div>
        </div>
      </div>

      {/* IA Analysis */}
      {s.ia?.analyseEffectuee && (
        <div className="card p-5" style={{ border: '1px solid rgba(0,127,255,0.2)' }}>
          <div className="flex items-center gap-2 mb-4">
            <Brain size={18} style={{ color: 'var(--rdc-bleu)' }} />
            <h3 className="font-bold text-white">Analyse IA automatique</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="font-mono text-xl font-bold" style={{ color: sentimentColor[s.ia.sentiment] }}>
                {s.ia.sentiment}
              </div>
              <div className="text-xs text-slate-500 mt-1">Sentiment</div>
            </div>
            <div className="text-center">
              <div className="font-mono text-xl font-bold" style={{ color: s.ia.scoreFaux > 0.5 ? '#f43f5e' : '#4ade80' }}>
                {Math.round((s.ia.scoreFaux || 0) * 100)}%
              </div>
              <div className="text-xs text-slate-500 mt-1">Risque faux</div>
            </div>
            <div className="text-center">
              <div className="font-mono text-xl font-bold" style={{ color: s.ia.estDoublon ? '#fbbf24' : '#4ade80' }}>
                {s.ia.estDoublon ? 'OUI' : 'NON'}
              </div>
              <div className="text-xs text-slate-500 mt-1">Doublon</div>
            </div>
            <div className="text-center">
              <div className="font-mono text-xl font-bold text-white capitalize">{s.priorite}</div>
              <div className="text-xs text-slate-500 mt-1">Priorité auto</div>
            </div>
          </div>
          {s.ia.resume && (
            <div className="mt-4 p-3 rounded-lg text-sm text-slate-300" style={{ background: 'rgba(0,127,255,0.05)', border: '1px solid rgba(0,127,255,0.1)' }}>
              <strong className="text-blue-400">Résumé IA :</strong> {s.ia.resume}
            </div>
          )}
        </div>
      )}

      {/* Modération (mods+) */}
      {hasRole('moderator', 'admin', 'superadmin') && (
        <div className="card p-5" style={{ border: '1px solid rgba(247,214,24,0.2)' }}>
          <div className="flex items-center gap-2 mb-4">
            <Shield size={18} style={{ color: 'var(--rdc-jaune)' }} />
            <h3 className="font-bold text-white">Panel de modération</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <select className="input" value={modStatut} onChange={e => setModStatut(e.target.value)}>
              <option value="">Changer le statut...</option>
              <option value="verifie">✅ Vérifier</option>
              <option value="en_cours">🔄 En cours</option>
              <option value="resolu">✅ Résoudre</option>
              <option value="rejete">❌ Rejeter</option>
            </select>
            <input className="input" placeholder="Note de modération..." value={modNote} onChange={e => setModNote(e.target.value)} />
            <button onClick={() => modStatut && moderMutation.mutate()} className="btn-primary"
              disabled={!modStatut || moderMutation.isPending}>
              {moderMutation.isPending ? 'En cours...' : 'Appliquer'}
            </button>
          </div>
        </div>
      )}

      {/* Commentaires */}
      <div className="card p-5">
        <h3 className="font-bold text-white mb-4 flex items-center gap-2">
          <MessageSquare size={16} /> Commentaires ({commentaires?.length || 0})
        </h3>

        {isAuthenticated && (
          <div className="flex gap-3 mb-5">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
              style={{ background: 'var(--rdc-rouge)' }}>
              {user?.nom?.charAt(0)}
            </div>
            <div className="flex-1 flex gap-2">
              <input className="input flex-1" placeholder="Ajouter un commentaire..."
                value={comment} onChange={e => setComment(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && comment.trim() && commentMutation.mutate()} />
              <button onClick={() => comment.trim() && commentMutation.mutate()} className="btn-primary px-3"
                disabled={!comment.trim() || commentMutation.isPending}>
                <Send size={15} />
              </button>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {commentaires?.map(c => (
            <div key={c._id} className="flex gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                style={{ background: 'var(--dark-500)' }}>
                {c.auteur?.nom?.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-white">{c.auteur?.nom}</span>
                  <span className="text-xs text-slate-500">
                    {format(new Date(c.createdAt), 'dd MMM HH:mm', { locale: fr })}
                  </span>
                </div>
                <p className="text-sm text-slate-300">{c.contenu}</p>
              </div>
            </div>
          ))}
          {commentaires?.length === 0 && (
            <div className="text-center text-slate-500 text-sm py-4">
              Soyez le premier à commenter
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
