// // import React, { useEffect, useState } from 'react';
// // import { Link } from 'react-router-dom';
// // import { AlertTriangle, Shield, Users, FileText, TrendingUp, ArrowRight, Plus, MapPin, Clock } from 'lucide-react';
// // import { useQuery } from '@tanstack/react-query';
// // import api from '../services/api';
// // import { useAuthStore } from '../store';
// // import { formatDistanceToNow } from 'date-fns';
// // import { fr } from 'date-fns/locale';

// // const typeColors = {
// //   insecurite: 'badge-rouge', banditisme: 'badge-rouge', transport: 'badge-jaune',
// //   corruption: 'badge-rouge', tribalisme: 'badge-gris', infrastructure: 'badge-bleu',
// //   sante: 'badge-vert', education: 'badge-bleu', environnement: 'badge-vert', autre: 'badge-gris'
// // };

// // const typeLabels = {
// //   insecurite: '🔴 Insécurité', banditisme: '🔴 Banditisme', transport: '🚌 Transport',
// //   corruption: '💰 Corruption', tribalisme: '⚠️ Tribalisme', infrastructure: '🏗️ Infrastructure',
// //   sante: '🏥 Santé', education: '📚 Éducation', environnement: '🌿 Environnement', autre: '📍 Autre'
// // };

// // export default function Home() {
// //   const { isAuthenticated } = useAuthStore();

// //   const { data: signalements } = useQuery({
// //     queryKey: ['signalements-recent'],
// //     queryFn: () => api.get('/signalements?limit=6').then(r => r.data)
// //   });

// //   const { data: stats } = useQuery({
// //     queryKey: ['province-stats'],
// //     queryFn: () => api.get('/signalements/province-stats').then(r => r.data)
// //   });

// //   const kpis = [
// //     { label: 'Signalements', value: signalements?.totalDocs || '—', icon: AlertTriangle, color: 'var(--rdc-rouge)', bg: 'rgba(206,17,38,0.1)' },
// //     { label: 'Résolus', value: '—', icon: Shield, color: 'var(--rdc-vert)', bg: 'rgba(0,154,68,0.1)' },
// //     { label: 'Citoyens', value: '—', icon: Users, color: 'var(--rdc-bleu)', bg: 'rgba(0,127,255,0.1)' },
// //     { label: 'Pétitions', value: '—', icon: FileText, color: 'var(--rdc-jaune)', bg: 'rgba(247,214,24,0.1)' },
// //   ];

// //   return (
// //     <div className="space-y-8 max-w-7xl mx-auto">
// //       {/* Hero */}
// //       <div className="relative rounded-2xl overflow-hidden p-8"
// //         style={{ background: 'linear-gradient(135deg, rgba(206,17,38,0.2) 0%, rgba(0,10,30,0.8) 50%, rgba(0,127,255,0.1) 100%)', border: '1px solid rgba(206,17,38,0.2)' }}>
// //         <div className="absolute inset-0 opacity-5"
// //           style={{ backgroundImage: 'repeating-linear-gradient(45deg, #CE1126 0, #CE1126 1px, transparent 0, transparent 50%)', backgroundSize: '12px 12px' }} />
// //         <div className="relative z-10">
// //           <div className="flex items-center gap-2 mb-3">
// //             <span className="text-2xl">🇨🇩</span>
// //             <span className="badge badge-rouge animate-pulse">● EN DIRECT</span>
// //           </div>
// //           <h1 className="text-3xl md:text-4xl font-black text-white mb-2 leading-tight">
// //             Dynamique Israël Mutombo
// //           </h1>
// //           <p className="text-slate-300 text-lg mb-1 font-light italic">
// //             Informer · Dénoncer · Mobiliser · Protéger
// //           </p>
// //           <p className="text-xs font-semibold tracking-widest mb-6" style={{ color: 'var(--rdc-jaune)' }}>
// //             UNITÉ · RÉSISTANCE · DISCIPLINE · LOYAUTÉ · ENGAGEMENT
// //           </p>
// //           <div className="flex flex-wrap gap-3">
// //             {isAuthenticated ? (
// //               <Link to="/signalements" className="btn-primary">
// //                 <Plus size={16} /> Nouveau signalement
// //               </Link>
// //             ) : (
// //               <Link to="/register" className="btn-primary">
// //                 <Plus size={16} /> Rejoindre la Dynamique
// //               </Link>
// //             )}
// //             <Link to="/carte" className="btn-secondary">
// //               <MapPin size={16} /> Voir la carte
// //             </Link>
// //           </div>
// //         </div>
// //       </div>

// //       {/* KPIs */}
// //       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
// //         {kpis.map((kpi, i) => (
// //           <div key={i} className="card p-4">
// //             <div className="flex items-center justify-between mb-3">
// //               <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: kpi.bg }}>
// //                 <kpi.icon size={18} style={{ color: kpi.color }} />
// //               </div>
// //               <TrendingUp size={14} className="text-slate-600" />
// //             </div>
// //             <div className="font-mono text-2xl font-bold text-white">{kpi.value}</div>
// //             <div className="text-xs text-slate-400 mt-0.5">{kpi.label}</div>
// //           </div>
// //         ))}
// //       </div>

// //       {/* Signalements récents + Stats provinces */}
// //       <div className="grid md:grid-cols-3 gap-6">
// //         {/* Signalements récents */}
// //         <div className="md:col-span-2">
// //           <div className="flex items-center justify-between mb-4">
// //             <h2 className="text-lg font-bold text-white">Signalements récents</h2>
// //             <Link to="/signalements" className="text-xs text-slate-400 hover:text-white flex items-center gap-1">
// //               Voir tout <ArrowRight size={12} />
// //             </Link>
// //           </div>
// //           <div className="space-y-3">
// //             {signalements?.docs?.map(s => (
// //               <Link key={s._id} to={`/signalements/${s._id}`}
// //                 className="card p-4 block hover:border-red-500/30 transition-colors">
// //                 <div className="flex items-start justify-between gap-3">
// //                   <div className="flex-1 min-w-0">
// //                     <div className="flex items-center gap-2 mb-1">
// //                       <span className={`badge ${typeColors[s.type] || 'badge-gris'} text-[10px]`}>
// //                         {typeLabels[s.type] || s.type}
// //                       </span>
// //                       <span className={`badge text-[10px] ${s.statut === 'resolu' ? 'badge-vert' : s.statut === 'en_cours' ? 'badge-bleu' : s.statut === 'verifie' ? 'badge-jaune' : 'badge-gris'}`}>
// //                         {s.statut?.replace('_', ' ')}
// //                       </span>
// //                     </div>
// //                     <h3 className="text-sm font-semibold text-white truncate">{s.titre}</h3>
// //                     <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{s.description}</p>
// //                   </div>
// //                   <div className="flex flex-col items-end gap-1 flex-shrink-0">
// //                     <div className="text-xs text-slate-500 flex items-center gap-1">
// //                       <MapPin size={10} />{s.province}
// //                     </div>
// //                     <div className="text-xs text-slate-600 flex items-center gap-1">
// //                       <Clock size={10} />
// //                       {formatDistanceToNow(new Date(s.createdAt), { addSuffix: true, locale: fr })}
// //                     </div>
// //                   </div>
// //                 </div>
// //               </Link>
// //             )) || Array(4).fill(0).map((_, i) => (
// //               <div key={i} className="card p-4">
// //                 <div className="skeleton h-4 w-24 mb-2" />
// //                 <div className="skeleton h-3 w-full mb-1" />
// //                 <div className="skeleton h-3 w-2/3" />
// //               </div>
// //             ))}
// //           </div>
// //         </div>

// //         {/* Top provinces */}
// //         <div>
// //           <div className="flex items-center justify-between mb-4">
// //             <h2 className="text-lg font-bold text-white">Zones actives</h2>
// //             <Link to="/carte" className="text-xs text-slate-400 hover:text-white flex items-center gap-1">
// //               Carte <ArrowRight size={12} />
// //             </Link>
// //           </div>
// //           <div className="card p-4 space-y-3">
// //             {stats?.stats?.slice(0, 8).map((s, i) => (
// //               <div key={s._id} className="flex items-center gap-3">
// //                 <span className="font-mono text-xs w-5 text-slate-500">{i + 1}</span>
// //                 <div className="flex-1">
// //                   <div className="flex items-center justify-between mb-1">
// //                     <span className="text-xs font-medium text-white">{s._id}</span>
// //                     <span className="font-mono text-xs" style={{ color: 'var(--rdc-rouge)' }}>{s.total}</span>
// //                   </div>
// //                   <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--dark-600)' }}>
// //                     <div className="h-full rounded-full transition-all"
// //                       style={{ width: `${Math.min((s.total / (stats.stats[0]?.total || 1)) * 100, 100)}%`, background: 'var(--rdc-rouge)' }} />
// //                   </div>
// //                 </div>
// //               </div>
// //             )) || Array(6).fill(0).map((_, i) => (
// //               <div key={i} className="flex items-center gap-3">
// //                 <div className="skeleton h-3 w-5" />
// //                 <div className="flex-1 skeleton h-3" />
// //               </div>
// //             ))}
// //           </div>

// //           {/* Actions rapides */}
// //           <div className="mt-4 space-y-2">
// //             {[
// //               { to: '/petitions', label: '📝 Signer une pétition', color: 'var(--rdc-bleu)' },
// //               { to: '/campagnes', label: '📣 Rejoindre une campagne', color: 'var(--rdc-vert)' },
// //               { to: '/innovations', label: '💡 Proposer une innovation', color: 'var(--rdc-jaune)' },
// //             ].map(a => (
// //               <Link key={a.to} to={a.to}
// //                 className="flex items-center justify-between p-3 rounded-lg text-sm font-medium text-white hover:opacity-80 transition-opacity"
// //                 style={{ background: 'var(--dark-700)', border: `1px solid ${a.color}20` }}>
// //                 <span>{a.label}</span>
// //                 <ArrowRight size={14} style={{ color: a.color }} />
// //               </Link>
// //             ))}
// //           </div>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }





// import React from 'react';
// import { Link } from 'react-router-dom';
// import { AlertTriangle, Shield, Users, FileText, TrendingUp, ArrowRight, Plus, MapPin, Clock } from 'lucide-react';
// import { useQuery } from '@tanstack/react-query';
// import api from '../services/api';
// import { useAuthStore } from '../store';
// import { formatDistanceToNow } from 'date-fns';
// import { fr } from 'date-fns/locale';
// import logo from '../Assets/logo.jpeg';

// const typeColors = {
//   insecurite: 'badge-rouge', banditisme: 'badge-rouge', transport: 'badge-jaune',
//   corruption: 'badge-rouge', tribalisme: 'badge-gris', infrastructure: 'badge-bleu',
//   sante: 'badge-vert', education: 'badge-bleu', environnement: 'badge-vert', autre: 'badge-gris'
// };

// const typeLabels = {
//   insecurite: '🔴 Insécurité', banditisme: '🔴 Banditisme', transport: '🚌 Transport',
//   corruption: '💰 Corruption', tribalisme: '⚠️ Tribalisme', infrastructure: '🏗️ Infrastructure',
//   sante: '🏥 Santé', education: '📚 Éducation', environnement: '🌿 Environnement', autre: '📍 Autre'
// };

// export default function Home() {
//   const { isAuthenticated } = useAuthStore();

//   const { data: signalements } = useQuery({
//     queryKey: ['signalements-recent'],
//     queryFn: () => api.get('/signalements?limit=6').then(r => r.data)
//   });

//   const { data: stats } = useQuery({
//     queryKey: ['province-stats'],
//     queryFn: () => api.get('/signalements/province-stats').then(r => r.data)
//   });

//   const kpis = [
//     { label: 'Signalements', value: signalements?.totalDocs || '—', icon: AlertTriangle, color: 'var(--rdc-rouge)', bg: 'rgba(206,17,38,0.1)' },
//     { label: 'Résolus', value: '—', icon: Shield, color: 'var(--rdc-vert)', bg: 'rgba(0,154,68,0.1)' },
//     { label: 'Citoyens', value: '—', icon: Users, color: 'var(--rdc-bleu)', bg: 'rgba(0,127,255,0.1)' },
//     { label: 'Pétitions', value: '—', icon: FileText, color: 'var(--rdc-jaune)', bg: 'rgba(247,214,24,0.1)' },
//   ];

//   return (
//     <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6">
//       {/* Hero section avec image de fond */}
// <div className="relative rounded-2xl overflow-hidden p-6 md:p-8">
//   {/* Image de fond (remplacez l'URL par votre propre image) */}
//   <div 
//     className="absolute inset-0 bg-cover bg-center bg-no-repeat"
//     style={{ backgroundImage: "url('https://i.ytimg.com/vi/Fn590tdmucI/hq720.jpg?sqp=-oaymwE7CK4FEIIDSFryq4qpAy0IARUAAAAAGAElAADIQj0AgKJD8AEB-AH-CYAC0AWKAgwIABABGGUgZShlMA8=&rs=AOn4CLC_ndvfs3V8NQOx5Al7wvK81giGYw')" }}
//   />
  
//   {/* Overlay sombre pour la lisibilité */}
//   <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/60 to-black/50" />
  
//   {/* Motif décoratif existant (optionnel) */}
//   <div className="absolute inset-0 opacity-10"
//     style={{ backgroundImage: 'repeating-linear-gradient(45deg, #CE1126 0, #CE1126 1px, transparent 0, transparent 50%)', backgroundSize: '12px 12px' }} />
  
//   <div className="relative z-10 flex flex-col md:flex-row md:flex-nowrap justify-between items-center gap-6 md:gap-8">
//     {/* Texte à gauche - inchangé */}
//     <div className="flex-1 text-center md:text-left">
//       <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
//         <span className="text-2xl">🇨🇩</span>
//         <span className="badge badge-rouge animate-pulse">● EN DIRECT</span>
//       </div>
//       <h1 className="text-3xl md:text-4xl font-black text-white mb-2 leading-tight">
//         Dynamique Israël Mutombo
//       </h1>
//       <p className="text-slate-300 text-lg mb-1 font-light italic">
//         Informer · Dénoncer · Mobiliser · Protéger
//       </p>
//       <p className="text-xs font-semibold tracking-widest mb-6" style={{ color: 'var(--rdc-jaune)' }}>
//         UNITÉ · RÉSISTANCE · DISCIPLINE · LOYAUTÉ · ENGAGEMENT
//       </p>
//       <div className="flex flex-wrap gap-3 justify-center md:justify-start">
//         {isAuthenticated ? (
//           <Link to="/signalements" className="btn-primary">
//             <Plus size={16} /> Nouveau signalement
//           </Link>
//         ) : (
//           <Link to="/register" className="btn-primary">
//             <Plus size={16} /> Rejoindre la Dynamique
//           </Link>
//         )}
//         <Link to="/carte" className="btn-secondary">
//           <MapPin size={16} /> Voir la carte
//         </Link>
//       </div>
//     </div>

//     {/* Logo - inchangé */}
//     <div className="flex-shrink-0 group">
//       <div className="relative">
//         <div className="absolute -inset-2 bg-gradient-to-r from-red-500/20 to-yellow-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition duration-700 pointer-events-none"></div>
//         <div className="relative backdrop-blur-sm bg-white/5 p-2 rounded-2xl shadow-2xl border border-white/20 transition-transform duration-300 group-hover:scale-105">
//           <img
//             src={logo}
//             alt="Logo Dynamique Israël Mutombo"
//             className="h-20 w-auto md:h-28 lg:h-32 object-contain rounded-xl"
//             onError={(e) => { e.target.style.display = 'none'; }}
//           />
//         </div>
//       </div>
//     </div>
//   </div>
// </div>


//       {/* KPIs (inchangés) */}
//       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//         {kpis.map((kpi, i) => (
//           <div key={i} className="card p-4">
//             <div className="flex items-center justify-between mb-3">
//               <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: kpi.bg }}>
//                 <kpi.icon size={18} style={{ color: kpi.color }} />
//               </div>
//               <TrendingUp size={14} className="text-slate-600" />
//             </div>
//             <div className="font-mono text-2xl font-bold text-white">{kpi.value}</div>
//             <div className="text-xs text-slate-400 mt-0.5">{kpi.label}</div>
//           </div>
//         ))}
//       </div>

//       {/* Signalements récents + Stats provinces */}
//       <div className="grid md:grid-cols-3 gap-6">
//         {/* Signalements récents */}
//         <div className="md:col-span-2">
//           <div className="flex items-center justify-between mb-4">
//             <h2 className="text-lg font-bold text-white">Signalements récents</h2>
//             <Link to="/signalements" className="text-xs text-slate-400 hover:text-white flex items-center gap-1">
//               Voir tout <ArrowRight size={12} />
//             </Link>
//           </div>
//           <div className="space-y-3">
//             {signalements?.docs?.map(s => (
//               <Link key={s._id} to={`/signalements/${s._id}`}
//                 className="card p-4 block hover:border-red-500/30 transition-colors">
//                 <div className="flex items-start justify-between gap-3">
//                   <div className="flex-1 min-w-0">
//                     <div className="flex items-center gap-2 mb-1 flex-wrap">
//                       <span className={`badge ${typeColors[s.type] || 'badge-gris'} text-[10px]`}>
//                         {typeLabels[s.type] || s.type}
//                       </span>
//                       <span className={`badge text-[10px] ${s.statut === 'resolu' ? 'badge-vert' : s.statut === 'en_cours' ? 'badge-bleu' : s.statut === 'verifie' ? 'badge-jaune' : 'badge-gris'}`}>
//                         {s.statut?.replace('_', ' ')}
//                       </span>
//                     </div>
//                     <h3 className="text-sm font-semibold text-white truncate">{s.titre}</h3>
//                     <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{s.description}</p>
//                   </div>
//                   <div className="flex flex-col items-end gap-1 flex-shrink-0">
//                     <div className="text-xs text-slate-500 flex items-center gap-1">
//                       <MapPin size={10} />{s.province}
//                     </div>
//                     <div className="text-xs text-slate-600 flex items-center gap-1">
//                       <Clock size={10} />
//                       {formatDistanceToNow(new Date(s.createdAt), { addSuffix: true, locale: fr })}
//                     </div>
//                   </div>
//                 </div>
//               </Link>
//             )) || Array(4).fill(0).map((_, i) => (
//               <div key={i} className="card p-4">
//                 <div className="skeleton h-4 w-24 mb-2" />
//                 <div className="skeleton h-3 w-full mb-1" />
//                 <div className="skeleton h-3 w-2/3" />
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Top provinces */}
//         <div>
//           <div className="flex items-center justify-between mb-4">
//             <h2 className="text-lg font-bold text-white">Zones actives</h2>
//             <Link to="/carte" className="text-xs text-slate-400 hover:text-white flex items-center gap-1">
//               Carte <ArrowRight size={12} />
//             </Link>
//           </div>
//           <div className="card p-4 space-y-3">
//             {stats?.stats?.slice(0, 8).map((s, i) => (
//               <div key={s._id} className="flex items-center gap-3">
//                 <span className="font-mono text-xs w-5 text-slate-500">{i + 1}</span>
//                 <div className="flex-1">
//                   <div className="flex items-center justify-between mb-1">
//                     <span className="text-xs font-medium text-white">{s._id}</span>
//                     <span className="font-mono text-xs" style={{ color: 'var(--rdc-rouge)' }}>{s.total}</span>
//                   </div>
//                   <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--dark-600)' }}>
//                     <div className="h-full rounded-full transition-all"
//                       style={{ width: `${Math.min((s.total / (stats.stats[0]?.total || 1)) * 100, 100)}%`, background: 'var(--rdc-rouge)' }} />
//                   </div>
//                 </div>
//               </div>
//             )) || Array(6).fill(0).map((_, i) => (
//               <div key={i} className="flex items-center gap-3">
//                 <div className="skeleton h-3 w-5" />
//                 <div className="flex-1 skeleton h-3" />
//               </div>
//             ))}
//           </div>

//           {/* Actions rapides */}
//           <div className="mt-4 space-y-2">
//             {[
//               { to: '/petitions', label: '📝 Signer une pétition', color: 'var(--rdc-bleu)' },
//               { to: '/campagnes', label: '📣 Rejoindre une campagne', color: 'var(--rdc-vert)' },
//               { to: '/innovations', label: '💡 Proposer une innovation', color: 'var(--rdc-jaune)' },
//             ].map(a => (
//               <Link key={a.to} to={a.to}
//                 className="flex items-center justify-between p-3 rounded-lg text-sm font-medium text-white hover:opacity-80 transition-opacity"
//                 style={{ background: 'var(--dark-700)', border: `1px solid ${a.color}20` }}>
//                 <span>{a.label}</span>
//                 <ArrowRight size={14} style={{ color: a.color }} />
//               </Link>
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }






import React, { useState, useEffect } from 'react'; // ← ajoute useState, useEffect
import { Link } from 'react-router-dom';
import { AlertTriangle, Shield, Users, FileText, TrendingUp, ArrowRight, Plus, MapPin, Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { useAuthStore } from '../store';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import logo from '../Assets/logo.jpeg';

const typeColors = {
  insecurite: 'badge-rouge', banditisme: 'badge-rouge', transport: 'badge-jaune',
  corruption: 'badge-rouge', tribalisme: 'badge-gris', infrastructure: 'badge-bleu',
  sante: 'badge-vert', education: 'badge-bleu', environnement: 'badge-vert', autre: 'badge-gris'
};

const typeLabels = {
  insecurite: '🔴 Insécurité', banditisme: '🔴 Banditisme', transport: '🚌 Transport',
  corruption: '💰 Corruption', tribalisme: '⚠️ Tribalisme', infrastructure: '🏗️ Infrastructure',
  sante: '🏥 Santé', education: '📚 Éducation', environnement: '🌿 Environnement', autre: '📍 Autre'
};

// ✅ Composant séparé pour la date — évite le mismatch serveur/client
function TimeAgo({ date }) {
  const [label, setLabel] = useState('...');

  useEffect(() => {
    // S'exécute UNIQUEMENT côté client, après le montage
    setLabel(formatDistanceToNow(new Date(date), { addSuffix: true, locale: fr }));
  }, [date]);

  return (
    <div className="text-xs text-slate-600 flex items-center gap-1">
      <Clock size={10} />
      {label}
    </div>
  );
}

export default function Home() {
  const { isAuthenticated } = useAuthStore();

  const { data: signalements } = useQuery({
    queryKey: ['signalements-recent'],
    queryFn: () => api.get('/signalements?limit=6').then(r => r.data)
  });

  const { data: stats } = useQuery({
    queryKey: ['province-stats'],
    queryFn: () => api.get('/signalements/province-stats').then(r => r.data)
  });

  const kpis = [
    { label: 'Signalements', value: signalements?.totalDocs || '—', icon: AlertTriangle, color: 'var(--rdc-rouge)', bg: 'rgba(206,17,38,0.1)' },
    { label: 'Résolus', value: '—', icon: Shield, color: 'var(--rdc-vert)', bg: 'rgba(0,154,68,0.1)' },
    { label: 'Citoyens', value: '—', icon: Users, color: 'var(--rdc-bleu)', bg: 'rgba(0,127,255,0.1)' },
    { label: 'Pétitions', value: '—', icon: FileText, color: 'var(--rdc-jaune)', bg: 'rgba(247,214,24,0.1)' },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6">

      {/* Hero */}
      <div className="relative rounded-2xl overflow-hidden p-6 md:p-8">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('https://i.ytimg.com/vi/Fn590tdmucI/hq720.jpg?sqp=-oaymwE7CK4FEIIDSFryq4qpAy0IARUAAAAAGAElAADIQj0AgKJD8AEB-AH-CYAC0AWKAgwIABABGGUgZShlMA8=&rs=AOn4CLC_ndvfs3V8NQOx5Al7wvK81giGYw')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/60 to-black/50" />
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'repeating-linear-gradient(45deg, #CE1126 0, #CE1126 1px, transparent 0, transparent 50%)', backgroundSize: '12px 12px' }} />

        <div className="relative z-10 flex flex-col md:flex-row md:flex-nowrap justify-between items-center gap-6 md:gap-8">
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
              <span className="text-2xl">🇨🇩</span>
              <span className="badge badge-rouge animate-pulse">● EN DIRECT</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white mb-2 leading-tight">
              Dynamique Israël Mutombo
            </h1>
            <p className="text-slate-300 text-lg mb-1 font-light italic">
              Informer · Dénoncer · Mobiliser · Protéger
            </p>
            <p className="text-xs font-semibold tracking-widest mb-6" style={{ color: 'var(--rdc-jaune)' }}>
              UNITÉ · RÉSISTANCE · DISCIPLINE · LOYAUTÉ · ENGAGEMENT
            </p>
            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              {isAuthenticated ? (
                <Link to="/signalements" className="btn-primary">
                  <Plus size={16} /> Nouveau signalement
                </Link>
              ) : (
                <Link to="/register" className="btn-primary">
                  <Plus size={16} /> Rejoindre la Dynamique
                </Link>
              )}
              <Link to="/carte" className="btn-secondary">
                <MapPin size={16} /> Voir la carte
              </Link>
            </div>
          </div>

          <div className="flex-shrink-0 group">
            <div className="relative">
              <div className="absolute -inset-2 bg-gradient-to-r from-red-500/20 to-yellow-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition duration-700 pointer-events-none" />
              <div className="relative backdrop-blur-sm bg-white/5 p-2 rounded-2xl shadow-2xl border border-white/20 transition-transform duration-300 group-hover:scale-105">
                <img
                  src={logo}
                  alt="Logo Dynamique Israël Mutombo"
                  className="h-20 w-auto md:h-28 lg:h-32 object-contain rounded-xl"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <div key={i} className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: kpi.bg }}>
                <kpi.icon size={18} style={{ color: kpi.color }} />
              </div>
              <TrendingUp size={14} className="text-slate-600" />
            </div>
            <div className="font-mono text-2xl font-bold text-white">{kpi.value}</div>
            <div className="text-xs text-slate-400 mt-0.5">{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Signalements récents + Stats provinces */}
      <div className="grid md:grid-cols-3 gap-6">

        <div className="md:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">Signalements récents</h2>
            <Link to="/signalements" className="text-xs text-slate-400 hover:text-white flex items-center gap-1">
              Voir tout <ArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-3">
            {signalements?.docs?.map(s => (
              <Link key={s._id} to={`/signalements/${s._id}`}
                className="card p-4 block hover:border-red-500/30 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`badge ${typeColors[s.type] || 'badge-gris'} text-[10px]`}>
                        {typeLabels[s.type] || s.type}
                      </span>
                      <span className={`badge text-[10px] ${s.statut === 'resolu' ? 'badge-vert' : s.statut === 'en_cours' ? 'badge-bleu' : s.statut === 'verifie' ? 'badge-jaune' : 'badge-gris'}`}>
                        {s.statut?.replace('_', ' ')}
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold text-white truncate">{s.titre}</h3>
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{s.description}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <div className="text-xs text-slate-500 flex items-center gap-1">
                      <MapPin size={10} />{s.province}
                    </div>
                    {/* ✅ Remplace l'appel direct par le composant TimeAgo */}
                    <TimeAgo date={s.createdAt} />
                  </div>
                </div>
              </Link>
            )) || Array(4).fill(0).map((_, i) => (
              <div key={i} className="card p-4">
                <div className="skeleton h-4 w-24 mb-2" />
                <div className="skeleton h-3 w-full mb-1" />
                <div className="skeleton h-3 w-2/3" />
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">Zones actives</h2>
            <Link to="/carte" className="text-xs text-slate-400 hover:text-white flex items-center gap-1">
              Carte <ArrowRight size={12} />
            </Link>
          </div>
          <div className="card p-4 space-y-3">
            {stats?.stats?.slice(0, 8).map((s, i) => (
              <div key={s._id} className="flex items-center gap-3">
                <span className="font-mono text-xs w-5 text-slate-500">{i + 1}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-white">{s._id}</span>
                    <span className="font-mono text-xs" style={{ color: 'var(--rdc-rouge)' }}>{s.total}</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--dark-600)' }}>
                    <div className="h-full rounded-full transition-all"
                      style={{ width: `${Math.min((s.total / (stats.stats[0]?.total || 1)) * 100, 100)}%`, background: 'var(--rdc-rouge)' }} />
                  </div>
                </div>
              </div>
            )) || Array(6).fill(0).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="skeleton h-3 w-5" />
                <div className="flex-1 skeleton h-3" />
              </div>
            ))}
          </div>

          <div className="mt-4 space-y-2">
            {[
              { to: '/petitions', label: '📝 Signer une pétition', color: 'var(--rdc-bleu)' },
              { to: '/campagnes', label: '📣 Rejoindre une campagne', color: 'var(--rdc-vert)' },
              { to: '/innovations', label: '💡 Proposer une innovation', color: 'var(--rdc-jaune)' },
            ].map(a => (
              <Link key={a.to} to={a.to}
                className="flex items-center justify-between p-3 rounded-lg text-sm font-medium text-white hover:opacity-80 transition-opacity"
                style={{ background: 'var(--dark-700)', border: `1px solid ${a.color}20` }}>
                <span>{a.label}</span>
                <ArrowRight size={14} style={{ color: a.color }} />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}