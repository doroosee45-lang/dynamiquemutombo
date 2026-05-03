// import { create } from 'zustand';
// import { persist } from 'zustand/middleware';
// import { io } from 'socket.io-client';

// // ── AUTH STORE ────────────────────────────────────────────────
// export const useAuthStore = create(
//   persist(
//     (set, get) => ({
//       user: null,
//       accessToken: null,
//       refreshToken: null,
//       isAuthenticated: false,

//       login: (user, accessToken, refreshToken) => {
//         set({ user, accessToken, refreshToken, isAuthenticated: true });
//       },

//       logout: () => {
//         set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
//         useSocketStore.getState().disconnect();
//       },

//       updateUser: (userData) => set(state => ({ user: { ...state.user, ...userData } })),

//       setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),

//       hasRole: (...roles) => {
//         const user = get().user;
//         return user && roles.includes(user.role);
//       }
//     }),
//     { name: 'dynamique-auth', partialize: state => ({ user: state.user, accessToken: state.accessToken, refreshToken: state.refreshToken, isAuthenticated: state.isAuthenticated }) }
//   )
// );

// // ── SOCKET STORE ──────────────────────────────────────────────
// export const useSocketStore = create((set, get) => ({
//   socket: null,
//   connected: false,

//   connect: (userId, nom) => {
//     const existingSocket = get().socket;
//     if (existingSocket?.connected) return;

//     const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
//       transports: ['websocket']
//     });

//     socket.on('connect', () => {
//       set({ socket, connected: true });
//       console.log('🔌 Socket connecté');
//     });

//     socket.on('disconnect', () => set({ connected: false }));

//     socket.on('alert', (data) => {
//       useNotifStore.getState().addAlerte(data);
//     });

//     socket.on('statusUpdated', (data) => {
//       console.log('📊 Statut mis à jour:', data);
//     });

//     set({ socket });
//   },

//   disconnect: () => {
//     const socket = get().socket;
//     if (socket) { socket.disconnect(); set({ socket: null, connected: false }); }
//   }
// }));

// // ── NOTIFICATION STORE ────────────────────────────────────────
// export const useNotifStore = create((set, get) => ({
//   notifications: [],
//   alertes: [],
//   unreadCount: 0,

//   setNotifications: (notifications) => {
//     const unread = notifications.filter(n => !n.lue).length;
//     set({ notifications, unreadCount: unread });
//   },

//   addAlerte: (alerte) => {
//     set(state => ({ alertes: [{ ...alerte, id: Date.now() }, ...state.alertes.slice(0, 4)] }));
//   },

//   markAsRead: (id) => {
//     set(state => ({
//       notifications: state.notifications.map(n => n._id === id ? { ...n, lue: true } : n),
//       unreadCount: Math.max(0, state.unreadCount - 1)
//     }));
//   },

//   clearAlerte: (id) => {
//     set(state => ({ alertes: state.alertes.filter(a => a.id !== id) }));
//   }
// }));

// // ── UI STORE ──────────────────────────────────────────────────
// export const useUIStore = create((set) => ({
//   sidebarOpen: true,
//   theme: 'dark',
//   loading: false,

//   toggleSidebar: () => set(state => ({ sidebarOpen: !state.sidebarOpen })),
//   setSidebarOpen: (open) => set({ sidebarOpen: open }),
//   setLoading: (loading) => set({ loading })
// }));



// import { create } from 'zustand';
// import { persist, createJSONStorage } from 'zustand/middleware';
// import { io } from 'socket.io-client';

// // ── AUTH STORE ────────────────────────────────────────────────
// export const useAuthStore = create(
//   persist(
//     (set, get) => ({
//       user: null,
//       accessToken: null,
//       refreshToken: null,
//       isAuthenticated: false,

//       login: (user, accessToken, refreshToken) => {
//         set({ user, accessToken, refreshToken, isAuthenticated: true });
//       },

//       logout: () => {
//         set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
//         useSocketStore.getState().disconnect();
//       },

//       updateUser: (userData) => set(state => ({ user: { ...state.user, ...userData } })),

//       setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),

//       hasRole: (...roles) => {
//         const user = get().user;
//         return user && roles.includes(user.role);
//       }
//     }),
//     {
//       name: 'dynamique-auth',
//       storage: createJSONStorage(() => {
//         if (typeof window !== 'undefined') return localStorage;
//         return {
//           getItem: () => null,
//           setItem: () => {},
//           removeItem: () => {}
//         };
//       }),
//       skipHydration: true,
//       partialize: state => ({
//         user: state.user,
//         accessToken: state.accessToken,
//         refreshToken: state.refreshToken,
//         isAuthenticated: state.isAuthenticated
//       })
//     }
//   )
// );

// // ── SOCKET STORE ──────────────────────────────────────────────
// export const useSocketStore = create((set, get) => ({
//   socket: null,
//   connected: false,

//   connect: (userId, nom) => {
//     const existingSocket = get().socket;
//     if (existingSocket?.connected) return;

//     const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
//       transports: ['websocket']
//     });

//     socket.on('connect', () => {
//       set({ socket, connected: true });
//       console.log('🔌 Socket connecté');
//     });

//     socket.on('disconnect', () => set({ connected: false }));

//     socket.on('alert', (data) => {
//       useNotifStore.getState().addAlerte(data);
//     });

//     socket.on('statusUpdated', (data) => {
//       console.log('📊 Statut mis à jour:', data);
//     });

//     set({ socket });
//   },

//   disconnect: () => {
//     const socket = get().socket;
//     if (socket) {
//       socket.disconnect();
//       set({ socket: null, connected: false });
//     }
//   }
// }));

// // ── NOTIFICATION STORE ────────────────────────────────────────
// export const useNotifStore = create((set, get) => ({
//   notifications: [],
//   alertes: [],
//   unreadCount: 0,

//   setNotifications: (notifications) => {
//     const unread = notifications.filter(n => !n.lue).length;
//     set({ notifications, unreadCount: unread });
//   },

//   addAlerte: (alerte) => {
//     set(state => ({
//       alertes: [{ ...alerte, id: Date.now() }, ...state.alertes.slice(0, 4)]
//     }));
//   },

//   markAsRead: (id) => {
//     set(state => ({
//       notifications: state.notifications.map(n =>
//         n._id === id ? { ...n, lue: true } : n
//       ),
//       unreadCount: Math.max(0, state.unreadCount - 1)
//     }));
//   },

//   clearAlerte: (id) => {
//     set(state => ({
//       alertes: state.alertes.filter(a => a.id !== id)
//     }));
//   }
// }));

// // ── UI STORE ──────────────────────────────────────────────────
// export const useUIStore = create((set) => ({
//   sidebarOpen: true,
//   theme: 'dark',
//   loading: false,

//   toggleSidebar: () => set(state => ({ sidebarOpen: !state.sidebarOpen })),
//   setSidebarOpen: (open) => set({ sidebarOpen: open }),
//   setLoading: (loading) => set({ loading })
// }));





import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { io } from 'socket.io-client';

// ── AUTH STORE ────────────────────────────────────────────────
export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      login: (user, accessToken, refreshToken) => {
        set({ user, accessToken, refreshToken, isAuthenticated: true });
      },

      logout: () => {
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
        useSocketStore.getState().disconnect();
      },

      updateUser: (userData) => set(state => ({ user: { ...state.user, ...userData } })),

      setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),

      hasRole: (...roles) => {
        const user = get().user;
        return user && roles.includes(user.role);
      }
    }),
    {
      name: 'dynamique-auth',
      storage: createJSONStorage(() => {
        if (typeof window !== 'undefined') return localStorage;
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {}
        };
      }),
      skipHydration: true,
      partialize: state => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);

// ── SOCKET STORE ──────────────────────────────────────────────
export const useSocketStore = create((set, get) => ({
  socket: null,
  connected: false,

  connect: (userId, nom) => {
    const existingSocket = get().socket;
    if (existingSocket?.connected) return;

    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
      transports: ['websocket']
    });

    socket.on('connect', () => {
      set({ socket, connected: true });
      console.log('🔌 Socket connecté');
    });

    socket.on('disconnect', () => set({ connected: false }));

    socket.on('alert', (data) => {
      useNotifStore.getState().addAlerte(data);
    });

    socket.on('statusUpdated', (data) => {
      console.log('📊 Statut mis à jour:', data);
    });

    set({ socket });
  },

  disconnect: () => {
    const socket = get().socket;
    if (socket) {
      socket.disconnect();
      set({ socket: null, connected: false });
    }
  }
}));

// ── NOTIFICATION STORE ────────────────────────────────────────
export const useNotifStore = create((set, get) => ({
  notifications: [],
  alertes: [],
  unreadCount: 0,

  setNotifications: (notifications) => {
    const unread = notifications.filter(n => !n.lue).length;
    set({ notifications, unreadCount: unread });
  },

  addAlerte: (alerte) => {
    set(state => ({
      alertes: [{ ...alerte, id: Date.now() }, ...state.alertes.slice(0, 4)]
    }));
  },

  markAsRead: (id) => {
    set(state => ({
      notifications: state.notifications.map(n =>
        n._id === id ? { ...n, lue: true } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1)
    }));
  },

  clearAlerte: (id) => {
    set(state => ({
      alertes: state.alertes.filter(a => a.id !== id)
    }));
  }
}));

// ── UI STORE ──────────────────────────────────────────────────
export const useUIStore = create((set) => ({
  sidebarOpen: true,
  theme: 'dark',
  loading: false,

  toggleSidebar: () => set(state => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setLoading: (loading) => set({ loading })
}));