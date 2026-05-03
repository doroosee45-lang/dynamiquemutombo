import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LogIn, UserPlus } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import api from '../services/api';
import { useAuthStore, useSocketStore } from '../store';
import toast from 'react-hot-toast';

const PROVINCES = ['Kinshasa', 'Nord-Kivu', 'Sud-Kivu', 'Ituri', 'Haut-Katanga', 'Kasaï-Central', 'Maniema', 'Équateur', 'Tanganyika'];

// ── LOGIN ─────────────────────────────────────────────────────
export function Login() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const { connect } = useSocketStore();
  const [form, setForm] = useState({ email: '', motDePasse: '' });
  const [showPwd, setShowPwd] = useState(false);

  const mutation = useMutation({
    mutationFn: (data) => api.post('/auth/login', data),
    onSuccess: (res) => {
      login(res.data.user, res.data.accessToken, res.data.refreshToken);
      connect(res.data.user._id || res.data.user.id, res.data.user.nom);
      toast.success(`Bienvenue, ${res.data.user.nom} !`);
      const role = res.data.user.role;
      navigate(['admin', 'superadmin', 'moderator'].includes(role) ? '/admin/dashboard' : '/');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Identifiants incorrects')
  });

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--dark-900)' }}>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🇨🇩</div>
          <h1 className="text-2xl font-black text-white">Dynamique Israël Mutombo</h1>
          <p className="text-slate-400 text-sm mt-1">Unité · Résistance · Discipline · Loyauté · Engagement</p>
        </div>

        <div className="card p-8">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <LogIn size={20} style={{ color: 'var(--rdc-rouge)' }} /> Connexion
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Adresse email</label>
              <input className="input" type="email" placeholder="vous@example.com"
                value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Mot de passe</label>
              <div className="relative">
                <input className="input pr-10" type={showPwd ? 'text' : 'password'} placeholder="••••••••"
                  value={form.motDePasse} onChange={e => setForm(f => ({ ...f, motDePasse: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && mutation.mutate(form)} />
                <button type="button" onClick={() => setShowPwd(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <button onClick={() => mutation.mutate(form)} className="btn-primary w-full justify-center py-3"
              disabled={mutation.isPending || !form.email || !form.motDePasse}>
              {mutation.isPending ? 'Connexion...' : 'Se connecter'}
            </button>
          </div>

          <div className="mt-4 pt-4 border-t text-center text-sm text-slate-500" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            Pas encore membre ?{' '}
            <Link to="/register" className="font-semibold hover:underline" style={{ color: 'var(--rdc-rouge)' }}>
              Rejoindre la Dynamique
            </Link>
          </div>
        </div>

        <div className="text-center mt-4 text-xs text-slate-600">
          Plateforme citoyenne · RDC · {new Date().getFullYear()}
        </div>
      </div>
    </div>
  );
}

// ── REGISTER ──────────────────────────────────────────────────
export function Register() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [form, setForm] = useState({ nom: '', email: '', motDePasse: '', confirm: '', province: 'Kinshasa' });
  const [showPwd, setShowPwd] = useState(false);

  const mutation = useMutation({
    mutationFn: (data) => api.post('/auth/register', data),
    onSuccess: (res) => {
      login(res.data.user, res.data.accessToken, res.data.refreshToken);
      toast.success('Bienvenue dans la Dynamique !');
      navigate('/');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Erreur lors de l\'inscription')
  });

  const handleSubmit = () => {
    if (!form.nom || !form.email || !form.motDePasse) return toast.error('Tous les champs sont requis');
    if (form.motDePasse !== form.confirm) return toast.error('Les mots de passe ne correspondent pas');
    if (form.motDePasse.length < 6) return toast.error('Mot de passe trop court (6 caractères min)');
    mutation.mutate({ nom: form.nom, email: form.email, motDePasse: form.motDePasse, province: form.province });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--dark-900)' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🇨🇩</div>
          <h1 className="text-2xl font-black text-white">Rejoindre la Dynamique</h1>
          <p className="text-slate-400 text-sm mt-1">Créez votre compte citoyen</p>
        </div>

        <div className="card p-8">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <UserPlus size={20} style={{ color: 'var(--rdc-rouge)' }} /> Inscription
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Nom complet</label>
              <input className="input" placeholder="Votre nom et prénom"
                value={form.nom} onChange={e => setForm(f => ({ ...f, nom: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Email</label>
              <input className="input" type="email" placeholder="vous@example.com"
                value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Province</label>
              <select className="input" value={form.province} onChange={e => setForm(f => ({ ...f, province: e.target.value }))}>
                {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Mot de passe</label>
              <div className="relative">
                <input className="input pr-10" type={showPwd ? 'text' : 'password'} placeholder="Minimum 6 caractères"
                  value={form.motDePasse} onChange={e => setForm(f => ({ ...f, motDePasse: e.target.value }))} />
                <button type="button" onClick={() => setShowPwd(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Confirmer le mot de passe</label>
              <input className="input" type="password" placeholder="Répétez votre mot de passe"
                value={form.confirm} onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
            </div>
            {form.motDePasse && form.confirm && (
              <div className={`text-xs flex items-center gap-1 ${form.motDePasse === form.confirm ? 'text-green-400' : 'text-red-400'}`}>
                {form.motDePasse === form.confirm ? '✓ Mots de passe identiques' : '✗ Mots de passe différents'}
              </div>
            )}
            <button onClick={handleSubmit} className="btn-primary w-full justify-center py-3"
              disabled={mutation.isPending}>
              {mutation.isPending ? 'Inscription...' : "S'inscrire"}
            </button>
          </div>

          <div className="mt-4 pt-4 border-t text-center text-sm text-slate-500" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            Déjà membre ?{' '}
            <Link to="/login" className="font-semibold hover:underline" style={{ color: 'var(--rdc-rouge)' }}>
              Se connecter
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
