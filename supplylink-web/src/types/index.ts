export type Role = 'FACTORY' | 'SUPPLIER' | 'ADMIN';
export type UserStatus = 'PENDING' | 'ACTIVE' | 'BLOCKED';
export type DemandStatus = 'OPEN' | 'IN_NEGOTIATION' | 'CLOSED' | 'CANCELLED';
export type QuoteStatus = 'PENDING' | 'ANSWERED' | 'ACCEPTED' | 'REJECTED';
export type OrderStatus = 'CONFIRMED' | 'PREPARING' | 'IN_TRANSIT' | 'DELIVERED';
export type NotificationType = 'NEW_QUOTE' | 'QUOTE_ANSWERED' | 'ORDER_STATUS' | 'ML_ALERT';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  companyName: string;
  cnpj: string;
  address?: string;
  logoUrl?: string;
  status: UserStatus;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
}

export interface Product {
  id: string;
  supplierId: string;
  categoryId: string;
  name: string;
  description?: string;
  unit: string;
  basePrice: number;
  stockQty: number;
  images: string[];
  createdAt: string;
}

export interface Demand {
  id: string;
  factoryId: string;
  productName: string;
  quantity: number;
  unit: string;
  neededBy: string;
  conditions?: string;
  status: DemandStatus;
  createdAt: string;
}

export interface QuoteRequest {
  id: string;
  demandId: string;
  supplierId: string;
  status: QuoteStatus;
  createdAt: string;
  response?: QuoteResponse;
}

export interface QuoteResponse {
  id: string;
  quoteRequestId: string;
  unitPrice: number;
  totalPrice: number;
  leadTimeDays: number;
  conditions?: string;
  createdAt: string;
}

export interface Order {
  id: string;
  quoteResponseId: string;
  factoryId: string;
  supplierId: string;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: { page: number; total: number };
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    statusCode: number;
  };
}
