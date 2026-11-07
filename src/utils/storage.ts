import { Product, Supplier, RugbyEvent, StockLog, User, ShiftClosure } from '../types';
import { INITIAL_PRODUCTS, INITIAL_SUPPLIERS, INITIAL_EVENTS, INITIAL_USERS } from '../data/initialData';

const STORAGE_KEYS = {
  PRODUCTS: 'lurt_inventory_products',
  SUPPLIERS: 'lurt_inventory_suppliers',
  EVENTS: 'lurt_inventory_events',
  LOGS: 'lurt_inventory_logs',
  USERS: 'lurt_inventory_users',
  CURRENT_USER: 'lurt_current_auth_user',
  CLOSURES: 'lurt_inventory_closures',
};

export function loadStoredUsers(): User[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    if (raw) {
      let parsed: User[] = JSON.parse(raw);
      let updated = false;

      // Ensure the admin user is always present and has secure passwordHash
      const adminIdx = parsed.findIndex(u => u.username === 'admin');
      if (adminIdx === -1) {
        parsed.unshift(INITIAL_USERS[0]);
        updated = true;
      } else {
        if (!parsed[adminIdx].passwordHash) {
          parsed[adminIdx].passwordHash = INITIAL_USERS[0].passwordHash;
          delete parsed[adminIdx].password;
          updated = true;
        }
        parsed[adminIdx].role = 'admin';
        parsed[adminIdx].roleLabel = 'Administrador';
      }

      // Ensure the responsable user is always present and has secure passwordHash
      const respIdx = parsed.findIndex(u => u.username === 'resp' || u.username === 'responsable');
      if (respIdx === -1) {
        parsed.push(INITIAL_USERS[1]);
        updated = true;
      } else {
        if (!parsed[respIdx].passwordHash) {
          parsed[respIdx].passwordHash = INITIAL_USERS[1].passwordHash;
          delete parsed[respIdx].password;
          updated = true;
        }
        parsed[respIdx].name = parsed[respIdx].name || 'Responsable de Turno';
        parsed[respIdx].role = 'staff';
        parsed[respIdx].roleLabel = 'Responsable de Turno';
        parsed[respIdx].badge = 'Responsable de Turno';
      }

      // Remove obsolete default users like 'barra' or 'voluntario' if they exist
      const cleaned = parsed.filter(u => u.username !== 'barra' && u.username !== 'voluntario');
      if (cleaned.length !== parsed.length) {
        parsed = cleaned;
        updated = true;
      }

      if (updated) {
        saveStoredUsers(parsed);
      }
      return parsed;
    }
  } catch (e) {
    console.error('Error loading users from localStorage', e);
  }
  saveStoredUsers(INITIAL_USERS);
  return INITIAL_USERS;
}

export function saveStoredUsers(users: User[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  } catch (e) {
    console.error('Error saving users to localStorage', e);
  }
}

export function loadCurrentUser(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error loading current user', e);
  }
  return null;
}

export function saveCurrentUser(user: User | null): void {
  try {
    if (user) {
      // do not store plain password or hash in active session state
      const safeUser = { ...user };
      delete safeUser.password;
      delete safeUser.passwordHash;
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(safeUser));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  } catch (e) {
    console.error('Error saving current user', e);
  }
}

export function clearCurrentUser(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  } catch (e) {
    console.error('Error clearing current user', e);
  }
}

export function loadStoredProducts(): Product[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
    saveStoredProducts(INITIAL_PRODUCTS);
  } catch (e) {
    console.error('Error loading products from localStorage', e);
  }
  return INITIAL_PRODUCTS;
}

export function saveStoredProducts(products: Product[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  } catch (e) {
    console.error('Error saving products to localStorage', e);
  }
}

export function loadStoredSuppliers(): Supplier[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SUPPLIERS);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
    saveStoredSuppliers(INITIAL_SUPPLIERS);
  } catch (e) {
    console.error('Error loading suppliers from localStorage', e);
  }
  return INITIAL_SUPPLIERS;
}

export function saveStoredSuppliers(suppliers: Supplier[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(suppliers));
  } catch (e) {
    console.error('Error saving suppliers to localStorage', e);
  }
}

export function loadStoredEvents(): RugbyEvent[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EVENTS);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const existingIds = new Set(parsed.map((e: RugbyEvent) => e.id));
        const missing = INITIAL_EVENTS.filter((e) => !existingIds.has(e.id));
        if (missing.length > 0) {
          const merged = [...parsed, ...missing];
          saveStoredEvents(merged);
          return merged;
        }
        return parsed;
      }
    }
    saveStoredEvents(INITIAL_EVENTS);
  } catch (e) {
    console.error('Error loading events from localStorage', e);
  }
  return INITIAL_EVENTS;
}

export function saveStoredEvents(events: RugbyEvent[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
  } catch (e) {
    console.error('Error saving events to localStorage', e);
  }
}

let idSequence = 0;
export function generateId(prefix: string = 'id'): string {
  idSequence += 1;
  const randomPart = Math.random().toString(36).substring(2, 9);
  return `${prefix}-${Date.now()}-${idSequence}-${randomPart}`;
}

export function loadStoredLogs(): StockLog[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LOGS);
    if (raw) {
      const parsed: StockLog[] = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const seen = new Set<string>();
        const sanitized: StockLog[] = [];
        for (let i = 0; i < parsed.length; i++) {
          const item = parsed[i];
          if (!item) continue;
          let id = item.id;
          if (!id || seen.has(id)) {
            id = generateId('log');
          }
          seen.add(id);
          sanitized.push({ ...item, id });
        }
        return sanitized;
      }
    }
  } catch (e) {
    console.error('Error loading logs from localStorage', e);
  }
  return [
    {
      id: 'log-1',
      productId: 'prod-1',
      productName: 'Barril Cerveza Rubia Keler (50L)',
      change: -2,
      newStock: 2,
      reason: 'Consumo Tercer Tiempo anterior vs Durango RT',
      timestamp: new Date(Date.now() - 3600 * 1000 * 48).toISOString(),
    },
    {
      id: 'log-2',
      productId: 'prod-8',
      productName: 'Txistorra Tradicional de Navarra',
      change: -5,
      newStock: 3,
      reason: 'Bocadillos post-entrenamiento de jueves',
      timestamp: new Date(Date.now() - 3600 * 1000 * 24).toISOString(),
    }
  ];
}

export function saveStoredLogs(logs: StockLog[]): void {
  try {
    const seen = new Set<string>();
    const uniqueLogs: StockLog[] = [];
    for (const log of logs) {
      if (!log) continue;
      if (!seen.has(log.id)) {
        seen.add(log.id);
        uniqueLogs.push(log);
      }
    }
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(uniqueLogs.slice(0, 50)));
  } catch (e) {
    console.error('Error saving logs to localStorage', e);
  }
}

export function loadStoredClosures(): ShiftClosure[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CLOSURES);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Error loading closures from localStorage', e);
  }
  const defaultClosures: ShiftClosure[] = [
    {
      id: 'closure-1',
      date: '2026-10-03',
      time: '21:15',
      timestamp: new Date(Date.now() - 3600 * 1000 * 24 * 4).toISOString(),
      revenue: 685.50,
      cleaningCompleted: true,
      keysReturned: true,
      responsibleName: 'Responsable de Turno',
      comments: 'Jornada vs Hernani CRE. Muy buen ambiente. Se agotaron 2 barriles de cerveza rubia. Limpieza general realizada y cocina recogida.',
      userId: 'user-responsable'
    }
  ];
  saveStoredClosures(defaultClosures);
  return defaultClosures;
}

export function saveStoredClosures(closures: ShiftClosure[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CLOSURES, JSON.stringify(closures));
  } catch (e) {
    console.error('Error saving closures to localStorage', e);
  }
}

export function resetAllDataToDefault(): void {
  localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
  localStorage.removeItem(STORAGE_KEYS.SUPPLIERS);
  localStorage.removeItem(STORAGE_KEYS.EVENTS);
  localStorage.removeItem(STORAGE_KEYS.LOGS);
  localStorage.removeItem(STORAGE_KEYS.CLOSURES);
}
