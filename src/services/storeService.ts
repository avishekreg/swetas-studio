import { 
  collection, 
  addDoc, 
  setDoc,
  updateDoc, 
  deleteDoc, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  onSnapshot
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { FashionItem, Order, UserProfile, OrderStatus, Promotion } from '../types';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const ItemService = {
  async getAllItems() {
    const path = 'items';
    try {
      const q = query(collection(db, path), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FashionItem));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  },

  async getItemById(id: string) {
    const path = `items/${id}`;
    try {
      const docRef = doc(db, 'items', id);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        return { id: snapshot.id, ...snapshot.data() } as FashionItem;
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
    }
  },

  async addItem(item: Omit<FashionItem, 'id' | 'createdAt'>) {
    const path = 'items';
    try {
      const docRef = await addDoc(collection(db, path), {
        ...item,
        createdAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  async updateItem(id: string, updates: Partial<FashionItem>) {
    const path = `items/${id}`;
    try {
      const docRef = doc(db, 'items', id);
      await updateDoc(docRef, updates);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  async deleteItem(id: string) {
    const path = `items/${id}`;
    try {
      const docRef = doc(db, 'items', id);
      await deleteDoc(docRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  }
};

export const OrderService = {
  async createOrder(order: Omit<Order, 'id' | 'createdAt' | 'status'>) {
    const path = 'orders';
    try {
      const docRef = await addDoc(collection(db, path), {
        ...order,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  async getUserOrders(userId: string) {
    const path = 'orders';
    try {
      const q = query(collection(db, path), where('userId', '==', userId), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  },

  async getAllOrders() {
    const path = 'orders';
    try {
      const q = query(collection(db, path), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  },

  async updateOrderStatus(orderId: string, status: OrderStatus, trackingNumber?: string) {
    const path = `orders/${orderId}`;
    try {
      const docRef = doc(db, 'orders', orderId);
      const updates: any = { status };
      if (trackingNumber) updates.trackingNumber = trackingNumber;
      await updateDoc(docRef, updates);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  }
};

export const UserService = {
  async getProfile(uid: string) {
    const path = `users/${uid}`;
    try {
      const docRef = doc(db, 'users', uid);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        return snapshot.data() as UserProfile;
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
    }
  },

  async syncProfile(profile: Omit<UserProfile, 'createdAt'>) {
    const path = `users/${profile.uid}`;
    try {
      const docRef = doc(db, 'users', profile.uid);
      const snapshot = await getDoc(docRef);
      if (!snapshot.exists()) {
        await setDoc(docRef, {
          ...profile,
          createdAt: serverTimestamp()
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async toggleFavorite(uid: string, itemId: string) {
    const path = `users/${uid}`;
    try {
      const profile = await this.getProfile(uid);
      if (profile) {
        let favorites = profile.favorites || [];
        if (favorites.includes(itemId)) {
          favorites = favorites.filter(id => id !== itemId);
        } else {
          favorites.push(itemId);
        }
        await updateDoc(doc(db, 'users', uid), { favorites });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  }
};

export const PromotionService = {
  async getAllPromotions() {
    const path = 'promotions';
    try {
      const q = query(collection(db, path), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Promotion));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  },

  async addPromotion(promotion: Omit<Promotion, 'id' | 'createdAt'>) {
    const path = 'promotions';
    try {
      const docRef = await addDoc(collection(db, path), {
        ...promotion,
        createdAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  async updatePromotion(id: string, updates: Partial<Promotion>) {
    const path = `promotions/${id}`;
    try {
      const docRef = doc(db, 'promotions', id);
      await updateDoc(docRef, updates);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  async deletePromotion(id: string) {
    const path = `promotions/${id}`;
    try {
      const docRef = doc(db, 'promotions', id);
      await deleteDoc(docRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  }
};
