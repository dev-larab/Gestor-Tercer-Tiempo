import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  getDocs,
  getDoc,
  writeBatch
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Product, Supplier, RugbyEvent, StockLog, User, ShiftClosure } from '../types';
import { INITIAL_PRODUCTS, INITIAL_SUPPLIERS, INITIAL_EVENTS, INITIAL_USERS } from '../data/initialData';

export const COLLECTIONS = {
  PRODUCTS: 'products',
  SUPPLIERS: 'suppliers',
  EVENTS: 'events',
  LOGS: 'logs',
  CLOSURES: 'closures',
  USERS: 'users',
} as const;

// Clean undefined fields before sending to Firestore
function sanitizePayload<T extends Record<string, any>>(obj: T): T {
  const result: any = {};
  for (const [key, val] of Object.entries(obj)) {
    if (val !== undefined) {
      result[key] = val;
    }
  }
  return result;
}

// ==========================================
// SEEDING (One-time when collections are empty)
// ==========================================
export async function seedInitialFirestoreData(): Promise<void> {
  try {
    const productsSnap = await getDocs(collection(db, COLLECTIONS.PRODUCTS));
    if (productsSnap.empty) {
      console.log('Seeding initial products to Firestore...');
      const batch = writeBatch(db);
      for (const prod of INITIAL_PRODUCTS) {
        const ref = doc(db, COLLECTIONS.PRODUCTS, prod.id);
        batch.set(ref, sanitizePayload(prod));
      }
      await batch.commit();
    }

    const suppliersSnap = await getDocs(collection(db, COLLECTIONS.SUPPLIERS));
    if (suppliersSnap.empty) {
      console.log('Seeding initial suppliers to Firestore...');
      const batch = writeBatch(db);
      for (const sup of INITIAL_SUPPLIERS) {
        const ref = doc(db, COLLECTIONS.SUPPLIERS, sup.id);
        batch.set(ref, sanitizePayload(sup));
      }
      await batch.commit();
    }

    const eventsSnap = await getDocs(collection(db, COLLECTIONS.EVENTS));
    if (eventsSnap.empty) {
      console.log('Seeding initial events to Firestore...');
      const batch = writeBatch(db);
      for (const ev of INITIAL_EVENTS) {
        const ref = doc(db, COLLECTIONS.EVENTS, ev.id);
        batch.set(ref, sanitizePayload(ev));
      }
      await batch.commit();
    } else {
      // Ensure current weekend matches exist so filter can be tested immediately
      try {
        const snapEvt5 = await getDoc(doc(db, COLLECTIONS.EVENTS, 'evt-5'));
        if (!snapEvt5.exists()) {
          const ev5 = INITIAL_EVENTS.find(e => e.id === 'evt-5');
          if (ev5) await setDoc(doc(db, COLLECTIONS.EVENTS, ev5.id), sanitizePayload(ev5));
        }
        const snapEvt6 = await getDoc(doc(db, COLLECTIONS.EVENTS, 'evt-6'));
        if (!snapEvt6.exists()) {
          const ev6 = INITIAL_EVENTS.find(e => e.id === 'evt-6');
          if (ev6) await setDoc(doc(db, COLLECTIONS.EVENTS, ev6.id), sanitizePayload(ev6));
        }
      } catch (err) {
        console.warn('Could not check or seed weekend matches:', err);
      }
    }

    const usersSnap = await getDocs(collection(db, COLLECTIONS.USERS));
    if (usersSnap.empty) {
      console.log('Seeding initial users to Firestore...');
      const batch = writeBatch(db);
      for (const u of INITIAL_USERS) {
        const ref = doc(db, COLLECTIONS.USERS, u.id);
        batch.set(ref, sanitizePayload(u));
      }
      await batch.commit();
    }
  } catch (error) {
    console.warn('Initial seeding encountered an error or already seeded:', error);
  }
}

// ==========================================
// REAL-TIME SUBSCRIPTIONS
// ==========================================

export function subscribeToProducts(onData: (products: Product[]) => void): () => void {
  const path = COLLECTIONS.PRODUCTS;
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const items: Product[] = [];
      snapshot.forEach((d) => {
        items.push({ id: d.id, ...d.data() } as Product);
      });
      onData(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export function subscribeToSuppliers(onData: (suppliers: Supplier[]) => void): () => void {
  const path = COLLECTIONS.SUPPLIERS;
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const items: Supplier[] = [];
      snapshot.forEach((d) => {
        items.push({ id: d.id, ...d.data() } as Supplier);
      });
      onData(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export function subscribeToEvents(onData: (events: RugbyEvent[]) => void): () => void {
  const path = COLLECTIONS.EVENTS;
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const items: RugbyEvent[] = [];
      snapshot.forEach((d) => {
        items.push({ id: d.id, ...d.data() } as RugbyEvent);
      });
      // Sort by date ascending
      items.sort((a, b) => (a.date || '').localeCompare(b.date || ''));
      onData(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export function subscribeToLogs(onData: (logs: StockLog[]) => void): () => void {
  const path = COLLECTIONS.LOGS;
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const items: StockLog[] = [];
      snapshot.forEach((d) => {
        items.push({ id: d.id, ...d.data() } as StockLog);
      });
      // Sort newest first
      items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      onData(items.slice(0, 100));
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export function subscribeToClosures(onData: (closures: ShiftClosure[]) => void): () => void {
  const path = COLLECTIONS.CLOSURES;
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const items: ShiftClosure[] = [];
      snapshot.forEach((d) => {
        items.push({ id: d.id, ...d.data() } as ShiftClosure);
      });
      // Sort newest first
      items.sort((a, b) => new Date(b.timestamp || b.date).getTime() - new Date(a.timestamp || a.date).getTime());
      onData(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export function subscribeToUsers(onData: (users: User[]) => void): () => void {
  const path = COLLECTIONS.USERS;
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const items: User[] = [];
      snapshot.forEach((d) => {
        items.push({ id: d.id, ...d.data() } as User);
      });
      onData(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

// ==========================================
// WRITE & MUTATION METHODS
// ==========================================

export async function saveProductToFirestore(product: Product): Promise<void> {
  const path = COLLECTIONS.PRODUCTS;
  try {
    const clean = sanitizePayload(product);
    await setDoc(doc(db, path, product.id), clean);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${path}/${product.id}`);
  }
}

export async function deleteProductFromFirestore(productId: string): Promise<void> {
  const path = COLLECTIONS.PRODUCTS;
  try {
    await deleteDoc(doc(db, path, productId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${path}/${productId}`);
  }
}

export async function saveSupplierToFirestore(supplier: Supplier): Promise<void> {
  const path = COLLECTIONS.SUPPLIERS;
  try {
    const clean = sanitizePayload(supplier);
    await setDoc(doc(db, path, supplier.id), clean);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${path}/${supplier.id}`);
  }
}

export async function deleteSupplierFromFirestore(supplierId: string): Promise<void> {
  const path = COLLECTIONS.SUPPLIERS;
  try {
    await deleteDoc(doc(db, path, supplierId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${path}/${supplierId}`);
  }
}

export async function saveEventToFirestore(event: RugbyEvent): Promise<void> {
  const path = COLLECTIONS.EVENTS;
  try {
    const clean = sanitizePayload(event);
    await setDoc(doc(db, path, event.id), clean);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${path}/${event.id}`);
  }
}

export async function deleteEventFromFirestore(eventId: string): Promise<void> {
  const path = COLLECTIONS.EVENTS;
  try {
    await deleteDoc(doc(db, path, eventId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${path}/${eventId}`);
  }
}

export async function saveLogToFirestore(log: StockLog): Promise<void> {
  const path = COLLECTIONS.LOGS;
  try {
    const clean = sanitizePayload(log);
    await setDoc(doc(db, path, log.id), clean);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${path}/${log.id}`);
  }
}

export async function saveClosureToFirestore(closure: ShiftClosure): Promise<void> {
  const path = COLLECTIONS.CLOSURES;
  try {
    const clean = sanitizePayload(closure);
    await setDoc(doc(db, path, closure.id), clean);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${path}/${closure.id}`);
  }
}

export async function deleteClosureFromFirestore(closureId: string): Promise<void> {
  const path = COLLECTIONS.CLOSURES;
  try {
    await deleteDoc(doc(db, path, closureId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${path}/${closureId}`);
  }
}

export async function saveUserToFirestore(user: User): Promise<void> {
  const path = COLLECTIONS.USERS;
  try {
    const clean = sanitizePayload(user);
    await setDoc(doc(db, path, user.id), clean);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${path}/${user.id}`);
  }
}

export async function deleteUserFromFirestore(userId: string): Promise<void> {
  const path = COLLECTIONS.USERS;
  try {
    await deleteDoc(doc(db, path, userId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${path}/${userId}`);
  }
}
