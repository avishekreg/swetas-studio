export type UserRole =
  | 'super_admin'
  | 'admin'
  | 'order_fulfillment'
  | 'shipping'
  | 'customer_care'
  | 'promotions'
  | 'customer';

export interface UserProfile {
  uid: string;
  email: string;
  role: UserRole;
  favorites: string[];
  createdAt: any;
}

export interface FashionItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  fabricImageUrl: string;
  renderedImageUrl?: string;
  stock: number;
  isOneOfOne: boolean;
  salePrice?: number;
  saleDescription?: string;
  styles: string[];
  createdAt: any;
}

export interface Promotion {
  id: string;
  title: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  startDate: any;
  endDate: any;
  isActive: boolean;
  applicableCategories: string[];
  bannerUrl?: string;
  createdAt: any;
}

export interface OrderItem {
  itemId: string;
  quantity: number;
  type: 'stitched' | 'material';
  measurements?: Record<string, string>;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered';

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  razorpayOrderId?: string;
  trackingNumber?: string;
  createdAt: any;
}

export interface Measurements {
  neck?: string;
  bust?: string;
  waist?: string;
  hips?: string;
  length?: string;
  sleeveLength?: string;
}
