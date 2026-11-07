export type ProductCategory = 
  | 'bebidas' 
  | 'comida' 
  | 'hielo' 
  | 'snacks' 
  | 'menaje' 
  | 'limpieza' 
  | 'otros';

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  currentStock: number;
  minStock: number;
  unit: string; // ej: 'barriles (50L)', 'cajas (24 ud)', 'paquetes', 'bolsas (10kg)', 'unidades', 'kg'
  supplierId?: string;
  costPerUnit?: number; // Coste en €
  notes?: string;
  updatedAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  notes: string; // días de entrega, pedidos mínimos, etc.
  address?: string;
}

export type EventType = 
  | 'partido_local' 
  | 'partido_visitante' 
  | 'torneo_seven' 
  | 'celebracion' 
  | 'amistoso' 
  | 'escuela';

export interface EventChecklistItem {
  productId: string;
  quantityNeeded: number;
  checked: boolean;
}

export interface RugbyEvent {
  id: string;
  title: string;
  rival?: string;
  teamCategory: string; // e.g., 'Senior Masculino A', 'Senior Femenino', 'Senior Masculino B', 'Veteranos / Artistas'
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  location: string;
  type: EventType;
  expectedAttendees: number; // comensales tercer tiempo (jugadores + staff + afición)
  notes?: string;
  checklist: EventChecklistItem[];
  isCompleted?: boolean;
  localPlayers?: number; // Jugadores equipo local
  visitorPlayers?: number; // Jugadores equipo visitante
  localStaff?: number; // Staff técnico equipo local
  visitorStaff?: number; // Staff técnico equipo visitante
}

export interface StockLog {
  id: string;
  productId: string;
  productName: string;
  change: number; // +5 or -2
  newStock: number;
  reason: string; // e.g. "Consumo Tercer Tiempo vs Getxo", "Reposición proveedor"
  timestamp: string;
}

export type UserRole = 'admin' | 'staff';

export interface User {
  id: string;
  username: string;
  password?: string;
  passwordHash?: string;
  name: string;
  role: UserRole;
  roleLabel: string;
  badge?: string;
  avatarColor?: string;
}

export interface ShiftClosure {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  timestamp: string; // ISO string
  revenue: number; // Recaudación en euros (€)
  cleaningCompleted: boolean; // Confirmación de limpieza realizada
  keysReturned: boolean; // Confirmación de devolución de llaves en recepción
  responsibleName: string; // Nombre del Responsable de turno
  comments?: string; // Comentarios u observaciones de la jornada
  userId?: string;
}

export type TabType = 'dashboard' | 'inventory' | 'closure' | 'suppliers' | 'events' | 'shopping';
