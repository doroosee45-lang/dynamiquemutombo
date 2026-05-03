// import React from 'react';
// import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// import { Toaster } from 'react-hot-toast';

// import Layout from './components/layout/Layout';
// import Home from './pages/Home';
// import Signalements from './pages/Signalements';
// import SignalementDetail from './pages/SignalementDetail';
// import MapPage from './pages/MapPage';
// import Chat from './pages/Chat';
// import Profile from './pages/Profile';
// import { Login, Register } from './pages/Auth';
// import { Publications, Petitions, Campaigns, Innovations, Leaderboard } from './pages/Content';
// import AdminDashboard from './pages/admin/AdminDashboard';
// import AdminSignalements from './pages/admin/AdminSignalements';
// import { AdminUsers, AdminProvinces } from './pages/admin/AdminPages';
// import { useAuthStore } from './store';

// const qc = new QueryClient({
//   defaultOptions: {
//     queries: {
//       retry: 1,
//       staleTime: 30 * 1000,
//       refetchOnWindowFocus: false
//     }
//   }
// });

// // Guards
// function PrivateRoute({ children }) {
//   const { isAuthenticated } = useAuthStore();
//   return isAuthenticated ? children : <Navigate to="/login" replace />;
// }

// function AdminRoute({ children }) {
//   const { isAuthenticated, hasRole } = useAuthStore();
//   if (!isAuthenticated) return <Navigate to="/login" replace />;
//   if (!hasRole('moderator', 'editor', 'admin', 'superadmin')) return <Navigate to="/" replace />;
//   return children;
// }

// function PublicOnlyRoute({ children }) {
//   const { isAuthenticated } = useAuthStore();
//   return isAuthenticated ? <Navigate to="/" replace /> : children;
// }

// export default function App() {
//   return (
//     <QueryClientProvider client={qc}>
//       <BrowserRouter>
//         <Toaster
//           position="top-right"
//           toastOptions={{
//             style: {
//               background: 'var(--dark-700)',
//               color: '#e2e8f0',
//               border: '1px solid rgba(255,255,255,0.08)',
//               borderRadius: '10px',
//               fontSize: '14px'
//             },
//             success: { iconTheme: { primary: '#009A44', secondary: '#fff' } },
//             error: { iconTheme: { primary: '#CE1126', secondary: '#fff' } }
//           }}
//         />

//         <Routes>
//           {/* Auth pages (sans layout) */}
//           <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
//           <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />

//           {/* Pages avec layout */}
//           <Route path="/" element={<Layout><Home /></Layout>} />
//           <Route path="/signalements" element={<Layout><Signalements /></Layout>} />
//           <Route path="/signalements/:id" element={<Layout><SignalementDetail /></Layout>} />
//           <Route path="/carte" element={<Layout><MapPage /></Layout>} />
//           <Route path="/publications" element={<Layout><Publications /></Layout>} />
//           <Route path="/petitions" element={<Layout><Petitions /></Layout>} />
//           <Route path="/campagnes" element={<Layout><Campaigns /></Layout>} />
//           <Route path="/innovations" element={<Layout><Innovations /></Layout>} />
//           <Route path="/leaderboard" element={<Layout><Leaderboard /></Layout>} />

//           {/* Protégé */}
//           <Route path="/chat" element={<Layout><PrivateRoute><Chat /></PrivateRoute></Layout>} />
//           <Route path="/profil" element={<Layout><PrivateRoute><Profile /></PrivateRoute></Layout>} />

//           {/* Admin */}
//           <Route path="/admin/dashboard" element={<Layout><AdminRoute><AdminDashboard /></AdminRoute></Layout>} />
//           <Route path="/admin/signalements" element={<Layout><AdminRoute><AdminSignalements /></AdminRoute></Layout>} />
//           <Route path="/admin/users" element={<Layout><AdminRoute><AdminUsers /></AdminRoute></Layout>} />
//           <Route path="/admin/provinces" element={<Layout><AdminRoute><AdminProvinces /></AdminRoute></Layout>} />

//           {/* 404 */}
//           <Route path="*" element={
//             <Layout>
//               <div className="flex flex-col items-center justify-center h-64 text-center">
//                 <div className="text-6xl mb-4">🇨🇩</div>
//                 <h2 className="text-2xl font-black text-white mb-2">Page introuvable</h2>
//                 <p className="text-slate-400 mb-4">Cette page n'existe pas</p>
//                 <a href="/" className="btn-primary">Retour à l'accueil</a>
//               </div>
//             </Layout>
//           } />
//         </Routes>
//       </BrowserRouter>
//     </QueryClientProvider>
//   );
// }


import React, { useEffect, useState } from 'react';  // ← ajoute useState
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Signalements from './pages/Signalements';
import SignalementDetail from './pages/SignalementDetail';
import MapPage from './pages/MapPage';
import Chat from './pages/Chat';
import Profile from './pages/Profile';
import { Login, Register } from './pages/Auth';
import { Publications, Petitions, Campaigns, Innovations, Leaderboard } from './pages/Content';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminSignalements from './pages/admin/AdminSignalements';
import { AdminUsers, AdminProvinces } from './pages/admin/AdminPages';
import { useAuthStore } from './store';

const qc = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30 * 1000,
      refetchOnWindowFocus: false
    }
  }
});

function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function AdminRoute({ children }) {
  const { isAuthenticated, hasRole } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!hasRole('moderator', 'editor', 'admin', 'superadmin')) return <Navigate to="/" replace />;
  return children;
}

function PublicOnlyRoute({ children }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <Navigate to="/" replace /> : children;
}

export default function App() {
  // ✅ Bloque le rendu jusqu'à ce que le client soit prêt
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    useAuthStore.persist.rehydrate();
    setHydrated(true);
  }, []);

  // ✅ Rendu vide côté serveur = pas de mismatch = plus d'erreur #418
  if (!hydrated) return null;

  return (
    <QueryClientProvider client={qc}>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'var(--dark-700)',
              color: '#e2e8f0',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '10px',
              fontSize: '14px'
            },
            success: { iconTheme: { primary: '#009A44', secondary: '#fff' } },
            error: { iconTheme: { primary: '#CE1126', secondary: '#fff' } }
          }}
        />

        <Routes>
          <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
          <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />

          <Route path="/" element={<Layout><Home /></Layout>} />
          <Route path="/signalements" element={<Layout><Signalements /></Layout>} />
          <Route path="/signalements/:id" element={<Layout><SignalementDetail /></Layout>} />
          <Route path="/carte" element={<Layout><MapPage /></Layout>} />
          <Route path="/publications" element={<Layout><Publications /></Layout>} />
          <Route path="/petitions" element={<Layout><Petitions /></Layout>} />
          <Route path="/campagnes" element={<Layout><Campaigns /></Layout>} />
          <Route path="/innovations" element={<Layout><Innovations /></Layout>} />
          <Route path="/leaderboard" element={<Layout><Leaderboard /></Layout>} />

          <Route path="/chat" element={<Layout><PrivateRoute><Chat /></PrivateRoute></Layout>} />
          <Route path="/profil" element={<Layout><PrivateRoute><Profile /></PrivateRoute></Layout>} />

          <Route path="/admin/dashboard" element={<Layout><AdminRoute><AdminDashboard /></AdminRoute></Layout>} />
          <Route path="/admin/signalements" element={<Layout><AdminRoute><AdminSignalements /></AdminRoute></Layout>} />
          <Route path="/admin/users" element={<Layout><AdminRoute><AdminUsers /></AdminRoute></Layout>} />
          <Route path="/admin/provinces" element={<Layout><AdminRoute><AdminProvinces /></AdminRoute></Layout>} />

          <Route path="*" element={
            <Layout>
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <div className="text-6xl mb-4">🇨🇩</div>
                <h2 className="text-2xl font-black text-white mb-2">Page introuvable</h2>
                <p className="text-slate-400 mb-4">Cette page n'existe pas</p>
                <a href="/" className="btn-primary">Retour à l'accueil</a>
              </div>
            </Layout>
          } />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}