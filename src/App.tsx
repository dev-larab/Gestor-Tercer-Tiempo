import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { InventoryView } from './components/InventoryView';
import { ShiftClosureView } from './components/ShiftClosureView';
import { SuppliersView } from './components/SuppliersView';
import { EventsView } from './components/EventsView';
import { ShoppingListView } from './components/ShoppingListView';
import { QuickBarModeModal } from './components/QuickBarModeModal';
import { LoginView } from './components/LoginView';
import { UserManagementModal } from './components/UserManagementModal';
import { 
  loadStoredProducts, 
  saveStoredProducts, 
  loadStoredSuppliers, 
  saveStoredSuppliers, 
  loadStoredEvents, 
  saveStoredEvents, 
  loadStoredLogs, 
  saveStoredLogs,
  resetAllDataToDefault,
  loadStoredUsers,
  saveStoredUsers,
  loadCurrentUser,
  saveCurrentUser,
  clearCurrentUser,
  generateId,
  loadStoredClosures,
  saveStoredClosures
} from './utils/storage';
import { Product, Supplier, RugbyEvent, StockLog, User, ShiftClosure, TabType } from './types';
import { Check, ShieldCheck, Sparkles } from 'lucide-react';
import { DynamicBackground } from './components/DynamicBackground';

import {
  seedInitialFirestoreData,
  subscribeToProducts,
  subscribeToSuppliers,
  subscribeToEvents,
  subscribeToLogs,
  subscribeToClosures,
  subscribeToUsers,
  saveProductToFirestore,
  deleteProductFromFirestore,
  saveSupplierToFirestore,
  deleteSupplierFromFirestore,
  saveEventToFirestore,
  deleteEventFromFirestore,
  saveLogToFirestore,
  saveClosureToFirestore,
  deleteClosureFromFirestore,
  saveUserToFirestore,
  deleteUserFromFirestore
} from './services/firestoreService';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(loadCurrentUser);
  const [users, setUsers] = useState<User[]>(loadStoredUsers);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);

  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [products, setProducts] = useState<Product[]>(loadStoredProducts);
  const [suppliers, setSuppliers] = useState<Supplier[]>(loadStoredSuppliers);
  const [events, setEvents] = useState<RugbyEvent[]>(loadStoredEvents);
  const [logs, setLogs] = useState<StockLog[]>(loadStoredLogs);
  const [closures, setClosures] = useState<ShiftClosure[]>(loadStoredClosures);
  const [isQuickBarOpen, setIsQuickBarOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Vertical sidebar state (collapsible & expandable)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('rugby_sidebar_collapsed');
      return saved !== null ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Dynamic atmospheric background intensity ('full' | 'subtle' | 'minimal')
  const [bgIntensity, setBgIntensity] = useState<'full' | 'subtle' | 'minimal'>(() => {
    try {
      const saved = localStorage.getItem('lurt_bg_intensity');
      if (saved === 'full' || saved === 'subtle' || saved === 'minimal') return saved;
    } catch {
      // default
    }
    return 'full';
  });

  const handleToggleBgIntensity = useCallback(() => {
    setBgIntensity(prev => {
      const next = prev === 'full' ? 'subtle' : prev === 'subtle' ? 'minimal' : 'full';
      try {
        localStorage.setItem('lurt_bg_intensity', next);
      } catch {
        // ignore
      }
      return next;
    });
  }, []);


  const handleToggleSidebar = useCallback(() => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('rugby_sidebar_collapsed', JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  // Sync state changes with localStorage
  useEffect(() => {
    saveCurrentUser(currentUser);
  }, [currentUser]);

  useEffect(() => {
    saveStoredUsers(users);
  }, [users]);

  useEffect(() => {
    saveStoredProducts(products);
  }, [products]);

  useEffect(() => {
    saveStoredSuppliers(suppliers);
  }, [suppliers]);

  useEffect(() => {
    saveStoredEvents(events);
  }, [events]);

  useEffect(() => {
    saveStoredLogs(logs);
  }, [logs]);

  useEffect(() => {
    saveStoredClosures(closures);
  }, [closures]);

  // Sync state if storage changes across tabs or windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (!e.key) return;
      if (e.key.includes('products')) setProducts(loadStoredProducts());
      if (e.key.includes('suppliers')) setSuppliers(loadStoredSuppliers());
      if (e.key.includes('events')) setEvents(loadStoredEvents());
      if (e.key.includes('logs')) setLogs(loadStoredLogs());
      if (e.key.includes('users')) setUsers(loadStoredUsers());
      if (e.key.includes('closures')) setClosures(loadStoredClosures());
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Real-time Firestore synchronization across all devices and sessions
  useEffect(() => {
    // Seed initial data if Firestore collections are empty
    seedInitialFirestoreData().catch((err) => {
      console.warn('Initial Firestore seeding check:', err);
    });

    const unsubProducts = subscribeToProducts((cloudProds) => {
      if (cloudProds && cloudProds.length > 0) {
        setProducts(cloudProds);
        saveStoredProducts(cloudProds);
      }
    });

    const unsubSuppliers = subscribeToSuppliers((cloudSups) => {
      if (cloudSups && cloudSups.length > 0) {
        setSuppliers(cloudSups);
        saveStoredSuppliers(cloudSups);
      }
    });

    const unsubEvents = subscribeToEvents((cloudEvents) => {
      if (cloudEvents && cloudEvents.length > 0) {
        setEvents(cloudEvents);
        saveStoredEvents(cloudEvents);
      }
    });

    const unsubLogs = subscribeToLogs((cloudLogs) => {
      if (cloudLogs && cloudLogs.length > 0) {
        setLogs(cloudLogs);
        saveStoredLogs(cloudLogs);
      }
    });

    const unsubClosures = subscribeToClosures((cloudClosures) => {
      if (cloudClosures && cloudClosures.length > 0) {
        setClosures(cloudClosures);
        saveStoredClosures(cloudClosures);
      }
    });

    const unsubUsers = subscribeToUsers((cloudUsers) => {
      if (cloudUsers && cloudUsers.length > 0) {
        setUsers(cloudUsers);
        saveStoredUsers(cloudUsers);
      }
    });

    return () => {
      unsubProducts();
      unsubSuppliers();
      unsubEvents();
      unsubLogs();
      unsubClosures();
      unsubUsers();
    };
  }, []);

  // Tab access control: Responsable de Turno can access 'dashboard', 'inventory', 'closure', and 'events' (suppliers & shopping remain admin only)
  const handleSelectTab = useCallback((tab: TabType) => {
    if (currentUser?.role !== 'admin' && (tab === 'suppliers' || tab === 'shopping')) {
      // Non-admin cannot switch to suppliers or shopping
      return;
    }
    setActiveTab(tab);
  }, [currentUser]);

  // Fallback to dashboard if a non-admin enters an unauthorized tab
  useEffect(() => {
    if (currentUser && currentUser.role !== 'admin' && (activeTab === 'suppliers' || activeTab === 'shopping')) {
      setActiveTab('dashboard');
    }
  }, [currentUser, activeTab]);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 2800);
  }, []);

  // Authentication Handlers
  const handleLogin = useCallback((user: User) => {
    setCurrentUser(user);
    saveCurrentUser(user);
    // Reload state from persistent storage so all saved additions, modifications, and deletions are accurately reflected
    setProducts(loadStoredProducts());
    setSuppliers(loadStoredSuppliers());
    setEvents(loadStoredEvents());
    setLogs(loadStoredLogs());
    setUsers(loadStoredUsers());
    setClosures(loadStoredClosures());
    if (user.role !== 'admin') {
      setActiveTab('dashboard');
    }
    showToast(`¡Bienvenido, ${user.name}!`);
  }, [showToast]);

  const handleLogout = useCallback(() => {
    // Synchronously save all current state before clearing active session
    saveStoredProducts(products);
    saveStoredSuppliers(suppliers);
    saveStoredEvents(events);
    saveStoredLogs(logs);
    saveStoredUsers(users);
    saveStoredClosures(closures);
    clearCurrentUser();
    setCurrentUser(null);
    showToast('Sesión cerrada correctamente');
  }, [products, suppliers, events, logs, users, closures, showToast]);

  const handleAddUser = useCallback((newUser: User) => {
    setUsers((prev) => {
      const updated = [...prev, newUser];
      saveStoredUsers(updated);
      saveUserToFirestore(newUser).catch(console.error);
      return updated;
    });
    showToast(`Usuario @${newUser.username} añadido`);
  }, [showToast]);

  const handleDeleteUser = useCallback((userId: string) => {
    setUsers((prev) => {
      const updated = prev.filter((u) => u.id !== userId);
      saveStoredUsers(updated);
      deleteUserFromFirestore(userId).catch(console.error);
      return updated;
    });
    showToast('Usuario eliminado');
  }, [showToast]);

  const handleUpdateUser = useCallback((updatedUser: User) => {
    setUsers((prev) => {
      const updated = prev.map((u) => (u.id === updatedUser.id ? updatedUser : u));
      saveStoredUsers(updated);
      saveUserToFirestore(updatedUser).catch(console.error);
      return updated;
    });
    showToast(`Usuario @${updatedUser.username} actualizado`);
  }, [showToast]);

  // Quick stock update (+ / -)
  const handleQuickUpdateStock = useCallback((productId: string, delta: number, reason: string) => {
    const targetProduct = products.find((p) => p.id === productId);
    if (!targetProduct) return;

    const newQty = Math.max(0, targetProduct.currentStock + delta);
    const updatedProduct: Product = {
      ...targetProduct,
      currentStock: newQty,
      updatedAt: new Date().toISOString(),
    };

    setProducts((prev) => {
      const updated = prev.map((p) => (p.id === productId ? updatedProduct : p));
      saveStoredProducts(updated);
      saveProductToFirestore(updatedProduct).catch(console.error);
      return updated;
    });

    const newLog: StockLog = {
      id: generateId('log'),
      productId: targetProduct.id,
      productName: targetProduct.name,
      change: delta,
      newStock: newQty,
      reason,
      timestamp: new Date().toISOString(),
    };
    setLogs((prevLogs) => {
      const updated = [newLog, ...prevLogs.filter((l) => l.id !== newLog.id)].slice(0, 50);
      saveStoredLogs(updated);
      saveLogToFirestore(newLog).catch(console.error);
      return updated;
    });
    showToast(`${delta > 0 ? '+' + delta : delta} ${targetProduct.name} (${newQty} ${targetProduct.unit})`);
  }, [products, showToast]);

  // One-click restock to safe level
  const handleRestockToSafeLevel = useCallback((productId: string) => {
    const targetProduct = products.find((p) => p.id === productId);
    if (!targetProduct) return;

    const safeTarget = targetProduct.minStock + 2;
    const delta = safeTarget - targetProduct.currentStock;
    const updatedProduct: Product = {
      ...targetProduct,
      currentStock: safeTarget,
      updatedAt: new Date().toISOString(),
    };

    setProducts((prev) => {
      const updated = prev.map((p) => (p.id === productId ? updatedProduct : p));
      saveStoredProducts(updated);
      saveProductToFirestore(updatedProduct).catch(console.error);
      return updated;
    });

    if (delta > 0) {
      const newLog: StockLog = {
        id: generateId('log'),
        productId: targetProduct.id,
        productName: targetProduct.name,
        change: delta,
        newStock: safeTarget,
        reason: 'Reposición rápida a nivel seguro',
        timestamp: new Date().toISOString(),
      };
      setLogs((prevLogs) => {
        const updated = [newLog, ...prevLogs.filter((l) => l.id !== newLog.id)].slice(0, 50);
        saveStoredLogs(updated);
        saveLogToFirestore(newLog).catch(console.error);
        return updated;
      });
    }

    showToast(`Stock de ${targetProduct.name} repuesto a ${safeTarget} ${targetProduct.unit}`);
  }, [products, showToast]);

  // Batch restock from shopping list
  const handleBatchRestock = useCallback((restockItems: { productId: string; quantity: number }[]) => {
    if (!restockItems || restockItems.length === 0) return;
    const itemMap = new Map(restockItems.map((i) => [i.productId, i.quantity]));
    const nowIso = new Date().toISOString();

    setProducts((prev) => {
      const updated = prev.map((p) => {
        if (itemMap.has(p.id)) {
          const addQty = itemMap.get(p.id)!;
          const updatedP = {
            ...p,
            currentStock: p.currentStock + addQty,
            updatedAt: nowIso,
          };
          saveProductToFirestore(updatedP).catch(console.error);
          return updatedP;
        }
        return p;
      });
      saveStoredProducts(updated);
      return updated;
    });

    const newLogs: StockLog[] = [];
    for (const item of restockItems) {
      const p = products.find((prod) => prod.id === item.productId);
      if (p) {
        const l: StockLog = {
          id: generateId('log'),
          productId: p.id,
          productName: p.name,
          change: item.quantity,
          newStock: p.currentStock + item.quantity,
          reason: 'Entrada pedido de compra',
          timestamp: nowIso,
        };
        newLogs.push(l);
        saveLogToFirestore(l).catch(console.error);
      }
    }

    if (newLogs.length > 0) {
      setLogs((prevLogs) => {
        const updated = [...newLogs, ...prevLogs].slice(0, 50);
        saveStoredLogs(updated);
        return updated;
      });
    }
    showToast(`¡${restockItems.length} artículos recibidos y sumados al inventario!`);
  }, [products, showToast]);

  // Product CRUD
  const handleAddProduct = useCallback((productData: Omit<Product, 'id' | 'updatedAt'>) => {
    const newProd: Product = {
      ...productData,
      id: generateId('prod'),
      updatedAt: new Date().toISOString(),
    };
    setProducts((prev) => {
      const updated = [newProd, ...prev];
      saveStoredProducts(updated);
      saveProductToFirestore(newProd).catch(console.error);
      return updated;
    });

    const newLog: StockLog = {
      id: generateId('log'),
      productId: newProd.id,
      productName: newProd.name,
      change: newProd.currentStock,
      newStock: newProd.currentStock,
      reason: 'Nuevo producto dado de alta',
      timestamp: new Date().toISOString(),
    };
    setLogs((prevLogs) => {
      const updated = [newLog, ...prevLogs.filter((l) => l.id !== newLog.id)].slice(0, 50);
      saveStoredLogs(updated);
      saveLogToFirestore(newLog).catch(console.error);
      return updated;
    });

    showToast(`Artículo "${newProd.name}" añadido al almacén`);
  }, [showToast]);

  const handleEditProduct = useCallback((product: Product) => {
    setProducts((prev) => {
      const updated = prev.map((p) => (p.id === product.id ? product : p));
      saveStoredProducts(updated);
      saveProductToFirestore(product).catch(console.error);
      return updated;
    });
    showToast(`Artículo "${product.name}" actualizado`);
  }, [showToast]);

  const handleDeleteProduct = useCallback((productId: string) => {
    const prodToDelete = products.find((p) => p.id === productId);
    setProducts((prev) => {
      const updated = prev.filter((p) => p.id !== productId);
      saveStoredProducts(updated);
      deleteProductFromFirestore(productId).catch(console.error);
      return updated;
    });

    if (prodToDelete) {
      const newLog: StockLog = {
        id: generateId('log'),
        productId: prodToDelete.id,
        productName: prodToDelete.name,
        change: -prodToDelete.currentStock,
        newStock: 0,
        reason: 'Artículo eliminado del inventario',
        timestamp: new Date().toISOString(),
      };
      setLogs((prevLogs) => {
        const updated = [newLog, ...prevLogs.filter((l) => l.id !== newLog.id)].slice(0, 50);
        saveStoredLogs(updated);
        saveLogToFirestore(newLog).catch(console.error);
        return updated;
      });
    }

    showToast('Producto eliminado');
  }, [products, showToast]);

  // Supplier CRUD
  const handleAddSupplier = useCallback((supplierData: Omit<Supplier, 'id'>) => {
    const newSup: Supplier = {
      ...supplierData,
      id: generateId('sup'),
    };
    setSuppliers((prev) => {
      const updated = [newSup, ...prev];
      saveStoredSuppliers(updated);
      saveSupplierToFirestore(newSup).catch(console.error);
      return updated;
    });
    showToast(`Proveedor "${newSup.name}" registrado`);
  }, [showToast]);

  const handleEditSupplier = useCallback((supplier: Supplier) => {
    setSuppliers((prev) => {
      const updated = prev.map((s) => (s.id === supplier.id ? supplier : s));
      saveStoredSuppliers(updated);
      saveSupplierToFirestore(supplier).catch(console.error);
      return updated;
    });
    showToast(`Proveedor "${supplier.name}" actualizado`);
  }, [showToast]);

  const handleDeleteSupplier = useCallback((supplierId: string) => {
    setSuppliers((prev) => {
      const updated = prev.filter((s) => s.id !== supplierId);
      saveStoredSuppliers(updated);
      deleteSupplierFromFirestore(supplierId).catch(console.error);
      return updated;
    });
    showToast('Proveedor eliminado');
  }, [showToast]);

  // Event CRUD
  const handleAddEvent = useCallback((eventData: Omit<RugbyEvent, 'id'>) => {
    const newEvt: RugbyEvent = {
      ...eventData,
      id: generateId('evt'),
    };
    setEvents((prev) => {
      const updated = [newEvt, ...prev];
      saveStoredEvents(updated);
      saveEventToFirestore(newEvt).catch(console.error);
      return updated;
    });
    showToast(`Partido "${newEvt.title}" programado en calendario`);
  }, [showToast]);

  const handleEditEvent = useCallback((event: RugbyEvent, silent: boolean = false) => {
    setEvents((prev) => {
      const updated = prev.map((e) => (e.id === event.id ? event : e));
      saveStoredEvents(updated);
      saveEventToFirestore(event).catch(console.error);
      return updated;
    });
    if (!silent) {
      showToast(`Evento "${event.title}" actualizado`);
    }
  }, [showToast]);

  const handleDeleteEvent = useCallback((eventId: string) => {
    setEvents((prev) => {
      const updated = prev.filter((e) => e.id !== eventId);
      saveStoredEvents(updated);
      deleteEventFromFirestore(eventId).catch(console.error);
      return updated;
    });
    showToast('Evento eliminado');
  }, [showToast]);

  const handleToggleChecklistItem = useCallback((eventId: string, productId: string) => {
    setEvents((prev) => {
      let updatedEvt: RugbyEvent | null = null;
      const updated = prev.map((e) => {
        if (e.id === eventId) {
          updatedEvt = {
            ...e,
            checklist: e.checklist.map((item) => {
              if (item.productId === productId) {
                return { ...item, checked: !item.checked };
              }
              return item;
            })
          };
          return updatedEvt;
        }
        return e;
      });
      saveStoredEvents(updated);
      if (updatedEvt) {
        saveEventToFirestore(updatedEvt).catch(console.error);
      }
      return updated;
    });
  }, []);

  const handleToggleEventComplete = useCallback((eventId: string) => {
    setEvents((prev) => {
      let updatedEvt: RugbyEvent | null = null;
      const updated = prev.map((e) => {
        if (e.id === eventId) {
          const nextState = !e.isCompleted;
          showToast(nextState ? 'Tercer tiempo marcado como realizado' : 'Evento reabierto');
          updatedEvt = { ...e, isCompleted: nextState };
          return updatedEvt;
        }
        return e;
      });
      saveStoredEvents(updated);
      if (updatedEvt) {
        saveEventToFirestore(updatedEvt).catch(console.error);
      }
      return updated;
    });
  }, [showToast]);

  // Shift Closure CRUD
  const handleAddClosure = useCallback((closureData: Omit<ShiftClosure, 'id' | 'timestamp'>) => {
    const newClosure: ShiftClosure = {
      ...closureData,
      id: generateId('closure'),
      timestamp: new Date().toISOString(),
    };
    setClosures((prev) => {
      const updated = [newClosure, ...prev];
      saveStoredClosures(updated);
      saveClosureToFirestore(newClosure).catch(console.error);
      return updated;
    });
    showToast(`Cierre de jornada guardado (${newClosure.revenue.toFixed(2)}€)`);
  }, [showToast]);

  const handleDeleteClosure = useCallback((closureId: string) => {
    setClosures((prev) => {
      const updated = prev.filter((c) => c.id !== closureId);
      saveStoredClosures(updated);
      deleteClosureFromFirestore(closureId).catch(console.error);
      return updated;
    });
    showToast('Registro de cierre eliminado');
  }, [showToast]);

  // Reset data to defaults (Admin restricted)
  const handleResetData = useCallback(() => {
    if (currentUser?.role !== 'admin') {
      showToast('Acceso denegado: solo el administrador puede reiniciar los datos');
      return;
    }
    resetAllDataToDefault();
    setProducts(loadStoredProducts());
    setSuppliers(loadStoredSuppliers());
    setEvents(loadStoredEvents());
    setLogs(loadStoredLogs());
    setClosures(loadStoredClosures());
    showToast('Datos de La Única Rugby Taldea restablecidos correctamente');
  }, [currentUser, showToast]);

  // If user is not authenticated, show Login View
  if (!currentUser) {
    return <LoginView onLogin={handleLogin} />;
  }

  const lowStockCount = products.filter(p => p.currentStock < p.minStock).length;

  return (
    <div className="min-h-screen bg-[#070b09] text-zinc-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-black relative">
      {/* Dynamic atmospheric moving background (aurora, pitch geometry & light mist) */}
      <DynamicBackground intensity={bgIntensity} />

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Club Header (Brand, Quick Bar, Reset, User profile, Sidebar toggle) */}
        <Header

        onToggleSidebarCollapse={handleToggleSidebar}
        isSidebarCollapsed={isSidebarCollapsed}
        onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
        onOpenQuickBar={() => setIsQuickBarOpen(true)}
        onResetData={handleResetData}
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenUserModal={() => setIsUserModalOpen(true)}
      />

      {/* Main Body with Vertical Collapsible Navigation Sidebar */}
      <div className="flex-1 flex flex-row min-h-0 w-full relative">
        {/* Vertical Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={handleSelectTab}
          lowStockCount={lowStockCount}
          currentUser={currentUser}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={handleToggleSidebar}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
          onOpenQuickBar={() => setIsQuickBarOpen(true)}
          onOpenUserModal={() => setIsUserModalOpen(true)}
        />

        {/* Content Area & Footer */}
        <div className="flex-1 min-w-0 flex flex-col">
          <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
            {activeTab === 'dashboard' && (
              <DashboardView
                products={products}
                suppliers={suppliers}
                events={events}
                logs={logs}
                currentUser={currentUser}
                onQuickUpdateStock={handleQuickUpdateStock}
                onNavigateTab={handleSelectTab}
              />
            )}

            {activeTab === 'inventory' && (
              <InventoryView
                products={products}
                suppliers={suppliers}
                onAddProduct={handleAddProduct}
                onEditProduct={handleEditProduct}
                onDeleteProduct={handleDeleteProduct}
                onQuickUpdateStock={handleQuickUpdateStock}
                onRestockToSafeLevel={handleRestockToSafeLevel}
              />
            )}

            {activeTab === 'closure' && (
              <ShiftClosureView
                closures={closures}
                currentUser={currentUser}
                onAddClosure={handleAddClosure}
                onDeleteClosure={handleDeleteClosure}
              />
            )}

            {currentUser.role === 'admin' && activeTab === 'suppliers' && (
              <SuppliersView
                suppliers={suppliers}
                products={products}
                onAddSupplier={handleAddSupplier}
                onEditSupplier={handleEditSupplier}
                onDeleteSupplier={handleDeleteSupplier}
                onNavigateTab={handleSelectTab}
              />
            )}

            {activeTab === 'events' && (
              <EventsView
                events={events}
                products={products}
                currentUser={currentUser}
                onAddEvent={handleAddEvent}
                onEditEvent={handleEditEvent}
                onDeleteEvent={handleDeleteEvent}
                onToggleChecklistItem={handleToggleChecklistItem}
                onToggleEventComplete={handleToggleEventComplete}
                onNavigateTab={handleSelectTab}
              />
            )}

            {currentUser.role === 'admin' && activeTab === 'shopping' && (
              <ShoppingListView
                products={products}
                suppliers={suppliers}
                events={events}
                onBatchRestock={handleBatchRestock}
                onNavigateTab={handleSelectTab}
              />
            )}
          </main>

          {/* Club Footer */}
          <footer className="mt-auto border-t border-emerald-950/80 bg-[#070b09] py-6 px-4">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
              <div className="flex items-center gap-2">
                <span className="font-rugby font-bold text-emerald-400 tracking-wider">
                  LA ÚNICA RUGBY TALDEA
                </span>
                <span>•</span>
                <span>Herria, Taldea, Erresua</span>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-[11px] text-zinc-400">
                <span>Sede Polideportivo UPNA, Pamplona / Iruña</span>
                <span>•</span>
                <span className="text-emerald-400 flex items-center gap-1 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Almacenamiento Local & Nube Activo
                </span>
                <span>•</span>
                <button
                  type="button"
                  onClick={handleToggleBgIntensity}
                  title="Cambiar intensidad del efecto dinámico de fondo (Dinámico / Suave / Estático)"
                  className="px-2.5 py-1 rounded-lg bg-emerald-950/70 hover:bg-emerald-900/70 border border-emerald-800/60 text-emerald-300 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer text-[11px]"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>
                    Fondo:{' '}
                    <strong className="text-emerald-200">
                      {bgIntensity === 'full' ? 'Dinámico ✦' : bgIntensity === 'subtle' ? 'Suave' : 'Estático'}
                    </strong>
                  </span>
                </button>
              </div>
            </div>
          </footer>
        </div>
      </div>

      {/* Quick Bar Mode Touch Modal */}
      <QuickBarModeModal
        isOpen={isQuickBarOpen}
        onClose={() => setIsQuickBarOpen(false)}
        products={products}
        onQuickUpdateStock={handleQuickUpdateStock}
      />

      {/* User Accounts & Permissions Modal (Admin Only) */}
      <UserManagementModal
        isOpen={isUserModalOpen && currentUser?.role === 'admin'}
        onClose={() => setIsUserModalOpen(false)}
        currentUser={currentUser}
        users={users}
        onAddUser={handleAddUser}
        onDeleteUser={handleDeleteUser}
        onUpdateUser={handleUpdateUser}
      />

      {/* Action Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#14231b] border-2 border-emerald-500 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-200">
          <div className="w-6 h-6 rounded-full bg-emerald-500 text-black flex items-center justify-center font-bold text-xs">
            <Check className="w-4 h-4 stroke-[3]" />
          </div>
          <span className="text-xs sm:text-sm font-semibold tracking-wide">
            {toastMessage}
          </span>
        </div>
      )}
      </div>
    </div>
  );
}
