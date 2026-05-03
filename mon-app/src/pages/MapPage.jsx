import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { Filter, MapPin, AlertTriangle, RefreshCw } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import 'leaflet/dist/leaflet.css';

const TYPES = ['', 'insecurite', 'banditisme', 'transport', 'corruption', 'tribalisme', 'infrastructure', 'sante', 'education'];
const PROVINCES = ['', 'Kinshasa', 'Nord-Kivu', 'Sud-Kivu', 'Ituri', 'Haut-Katanga'];

const priorityColor = { critical: '#f43f5e', high: '#f97316', medium: '#eab308', low: '#22c55e' };
const typeIcon = { insecurite: '🔴', banditisme: '🔴', transport: '🚌', corruption: '💰', autre: '📍' };

// Kinshasa par défaut
const DEFAULT_CENTER = [-4.322447, 15.322481];
const DEFAULT_ZOOM = 6;

function FitBounds({ points }) {
  const map = useMap();
  useEffect(() => {
    if (points?.length > 0) {
      const validPoints = points.filter(p => p.localisation?.lat && p.localisation?.lng);
      if (validPoints.length > 0) {
        const bounds = validPoints.map(p => [p.localisation.lat, p.localisation.lng]);
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 10 });
      }
    }
  }, [points]);
  return null;
}

export default function MapPage() {
  const [filters, setFilters] = useState({ type: '', province: '', statut: '' });
  const [selected, setSelected] = useState(null);
  const [showHeatmap, setShowHeatmap] = useState(true);

  const params = new URLSearchParams(Object.fromEntries(Object.entries(filters).filter(([, v]) => v))).toString();

  const { data: heatData, isLoading, refetch } = useQuery({
    queryKey: ['heatmap', filters],
    queryFn: () => api.get(`/signalements/heatmap?${params}`).then(r => r.data)
  });

  const { data: statsData } = useQuery({
    queryKey: ['province-stats'],
    queryFn: () => api.get('/signalements/province-stats').then(r => r.data)
  });

  const points = heatData?.points || [];

  return (
    <div className="flex flex-col h-full gap-4" style={{ height: 'calc(100vh - 120px)' }}>
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-2xl font-black text-white">Carte interactive</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            {points.length} incidents géolocalisés · RDC 26 provinces
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowHeatmap(h => !h)}
            className={`btn-secondary text-xs ${showHeatmap ? 'border-red-500/40 text-red-400' : ''}`}>
            🔥 Heatmap {showHeatmap ? 'ON' : 'OFF'}
          </button>
          <button onClick={() => refetch()} className="btn-secondary text-xs">
            <RefreshCw size={13} /> Actualiser
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-3 flex-shrink-0">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-slate-400">
            <Filter size={14} />
            <span className="text-xs font-medium">Filtres :</span>
          </div>
          <select className="input text-xs py-1.5 w-40" value={filters.type} onChange={e => setFilters(f => ({ ...f, type: e.target.value }))}>
            <option value="">Tous types</option>
            {TYPES.filter(Boolean).map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select className="input text-xs py-1.5 w-40" value={filters.province} onChange={e => setFilters(f => ({ ...f, province: e.target.value }))}>
            <option value="">Toutes provinces</option>
            {PROVINCES.filter(Boolean).map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <select className="input text-xs py-1.5 w-36" value={filters.statut} onChange={e => setFilters(f => ({ ...f, statut: e.target.value }))}>
            <option value="">Tous statuts</option>
            <option value="en_attente">En attente</option>
            <option value="verifie">Vérifié</option>
            <option value="en_cours">En cours</option>
            <option value="resolu">Résolu</option>
          </select>

          {/* Légende */}
          <div className="ml-auto flex items-center gap-3">
            {Object.entries(priorityColor).map(([p, c]) => (
              <span key={p} className="flex items-center gap-1 text-xs text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: c }} />
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Map + Sidebar */}
      <div className="flex gap-4 flex-1 min-h-0">
        {/* Carte */}
        <div className="flex-1 rounded-xl overflow-hidden border" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          {isLoading ? (
            <div className="h-full flex items-center justify-center" style={{ background: 'var(--dark-800)' }}>
              <div className="text-slate-400">Chargement de la carte...</div>
            </div>
          ) : (
            <MapContainer
              center={DEFAULT_CENTER}
              zoom={DEFAULT_ZOOM}
              style={{ height: '100%', width: '100%', background: '#0a0a0f' }}
              zoomControl={true}
            >
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://carto.com/">CARTO</a>'
              />

              {points.map((p, i) => {
                if (!p.localisation?.lat || !p.localisation?.lng) return null;
                const color = priorityColor[p.priorite] || '#94a3b8';
                return (
                  <CircleMarker
                    key={i}
                    center={[p.localisation.lat, p.localisation.lng]}
                    radius={showHeatmap ? 14 : 8}
                    pathOptions={{
                      color,
                      fillColor: color,
                      fillOpacity: showHeatmap ? 0.35 : 0.7,
                      weight: 1.5,
                      opacity: 0.9
                    }}
                    eventHandlers={{ click: () => setSelected(p) }}
                  >
                    <Popup>
                      <div style={{ background: 'var(--dark-700)', color: 'white', borderRadius: 8, padding: '8px 12px', minWidth: 180 }}>
                        <div className="font-bold text-sm mb-1">{p.titre || p.type}</div>
                        <div className="text-xs text-slate-300">{p.province}</div>
                        <div className="text-xs mt-1" style={{ color }}>● {p.priorite}</div>
                        <div className="text-xs text-slate-400 mt-0.5 capitalize">{p.statut?.replace('_', ' ')}</div>
                      </div>
                    </Popup>
                  </CircleMarker>
                );
              })}

              {points.length > 0 && <FitBounds points={points} />}
            </MapContainer>
          )}
        </div>

        {/* Stats sidebar */}
        <div className="w-56 flex flex-col gap-3 overflow-y-auto flex-shrink-0">
          <div className="card p-4">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <MapPin size={14} style={{ color: 'var(--rdc-rouge)' }} /> Top provinces
            </h3>
            <div className="space-y-2">
              {statsData?.stats?.slice(0, 10).map((s, i) => (
                <div key={s._id} className="flex items-center justify-between">
                  <span className="text-xs text-slate-300 truncate flex-1">{s._id}</span>
                  <span className="font-mono text-xs font-bold ml-2 flex-shrink-0" style={{ color: 'var(--rdc-rouge)' }}>
                    {s.total}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-4">
            <h3 className="text-sm font-bold text-white mb-3">
              <AlertTriangle size={14} className="inline mr-1" style={{ color: 'var(--rdc-jaune)' }} />
              Risques
            </h3>
            <div className="space-y-1.5 text-xs">
              {[
                { label: '🔴 Critique', provinces: 'Nord-Kivu, Sud-Kivu, Ituri' },
                { label: '🟠 Élevé', provinces: 'Kinshasa, Haut-Uélé' },
                { label: '🔵 Moyen', provinces: '19 autres provinces' },
                { label: '⚪ Faible', provinces: 'Lomami' },
              ].map(r => (
                <div key={r.label} className="p-2 rounded-lg" style={{ background: 'var(--dark-700)' }}>
                  <div className="font-semibold text-white">{r.label}</div>
                  <div className="text-slate-500 text-[10px] mt-0.5">{r.provinces}</div>
                </div>
              ))}
            </div>
          </div>

          {selected && (
            <div className="card p-4" style={{ border: '1px solid rgba(206,17,38,0.3)' }}>
              <h3 className="text-sm font-bold text-white mb-2">Sélectionné</h3>
              <div className="space-y-1 text-xs">
                <div className="text-slate-300 capitalize font-medium">{selected.type}</div>
                <div className="text-slate-400">{selected.province}</div>
                <div className="capitalize text-slate-400">{selected.statut?.replace('_', ' ')}</div>
                <div style={{ color: priorityColor[selected.priorite] }}>● {selected.priorite}</div>
              </div>
              <button onClick={() => setSelected(null)} className="mt-2 text-xs text-slate-500 hover:text-white">
                Fermer ×
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
