// Mock Database Layer to simulate MongoDB/Mongoose
// This allows us to build the real architecture and swap it for Mongoose later easily.

// ─── Interfaces ─────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "cocina" | "recepcion" | "pensionista";
  status: "active" | "inactive";
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  order: number;
  active: boolean;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  image?: string;
  available: boolean;
  calories?: string;
  time?: string;
  popular?: boolean;
  createdAt: string;
}

export interface Table {
  id: string;
  number: number;
  qrCode: string;
  status: "libre" | "ocupada" | "reservada" | "en_pedido" | "por_limpiar";
  row: number;
  col: number;
}

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  subtotal: number;
  observation?: string;
}

export interface Order {
  id: string;
  tableId: string;
  items: OrderItem[];
  total: number;
  paymentMethod: "efectivo" | "yape" | "plin" | "tarjeta";
  status: "pendiente" | "en_preparacion" | "listo" | "entregado" | "cancelado";
  createdAt: string;
  updatedAt: string;
}

export interface Pensionist {
  id: string;
  userId?: string;
  fullName: string;
  dni: string;
  code: string;
  phone: string;
  qrCode: string;
  planType: "saldo" | "cupos";
  status: "active" | "inactive";
  startDate: string;
  endDate: string;
  balance?: number; // for "saldo" plan
  breakfastCredits?: number; // for "cupos" plan
  lunchCredits?: number;
  dinnerCredits?: number;
  createdAt: string;
}

export interface Consumption {
  id: string;
  pensionistId: string;
  mealType: "desayuno" | "almuerzo" | "cena";
  date: string;
  time: string;
  validatedBy: string; // User ID of recepcion
  status: "confirmado" | "anulado";
  observation?: string;
  createdAt: string;
}

// ─── Initial Data ───────────────────────────────────────────────────────────

// Default categories
const initialCategories: Category[] = [
  { id: "cat_1", name: "Desayuno", order: 1, active: true },
  { id: "cat_2", name: "Almuerzo", order: 2, active: true },
  { id: "cat_3", name: "Cena", order: 3, active: true },
  { id: "cat_4", name: "Postres", order: 4, active: true },
];

// Default products matching our UI
const initialProducts: Product[] = [
  {
    id: "prod_1",
    name: "Desayuno Andino",
    description: "Huevos revueltos de corral, pan artesanal tostado, jugo de naranja recién exprimido y café de especialidad.",
    price: 15.00,
    categoryId: "cat_1",
    available: true,
    calories: "450 cal",
    time: "7:00 AM - 10:00 AM",
    popular: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "prod_2",
    name: "Ceviche de la Casa",
    description: "Pesca del día marinada al limón peruano con cebolla morada y ají limo, acompañado de canchita paccho y camote glaseado.",
    price: 35.00,
    categoryId: "cat_2",
    available: true,
    calories: "380 cal",
    time: "12:00 PM - 3:00 PM",
    popular: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "prod_3",
    name: "Lomo Saltado Fino",
    description: "Trozos jugosos de lomo fino flambeados al wok tradicional con arroz blanco graneado y papas amarillas crocantes.",
    price: 38.00,
    categoryId: "cat_2",
    available: true,
    calories: "650 cal",
    time: "12:00 PM - 3:00 PM",
    popular: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "prod_4",
    name: "Caldo de Gallina",
    description: "Reconfortante caldo tradicional cocinado a fuego lento con fideos largos, papa amarilla y huevo de corral.",
    price: 25.00,
    categoryId: "cat_3",
    available: true,
    calories: "500 cal",
    time: "7:00 PM - 10:00 PM",
    popular: false,
    createdAt: new Date().toISOString(),
  }
];

// Default users
const initialUsers: User[] = [
  { id: "user_admin", name: "Admin General", email: "admin@shadam.com", role: "admin", status: "active", createdAt: new Date().toISOString() },
  { id: "user_cocina", name: "Chef Master", email: "cocina@shadam.com", role: "cocina", status: "active", createdAt: new Date().toISOString() },
  { id: "user_recepcion", name: "Recepción", email: "recepcion@shadam.com", role: "recepcion", status: "active", createdAt: new Date().toISOString() }
];

// Default Tables
const initialTables: Table[] = [
  { id: "table-1", number: 1, qrCode: "http://localhost:3000/menu/1", status: "libre", row: 0, col: 0 },
  { id: "table-2", number: 2, qrCode: "http://localhost:3000/menu/2", status: "libre", row: 0, col: 1 },
  { id: "table-3", number: 3, qrCode: "http://localhost:3000/menu/3", status: "libre", row: 0, col: 2 },
  { id: "table-4", number: 4, qrCode: "http://localhost:3000/menu/4", status: "libre", row: 1, col: 0 },
];

// Default Pensionists
const initialPensionists: Pensionist[] = [
  {
    id: "pen_1",
    fullName: "Juan Pérez",
    dni: "12345678",
    code: "PEN-0001",
    phone: "999888777",
    qrCode: "PEN-0001",
    planType: "cupos",
    status: "active",
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    breakfastCredits: 10,
    lunchCredits: 20,
    dinnerCredits: 10,
    createdAt: new Date().toISOString(),
  }
];

// ─── Database Class ─────────────────────────────────────────────────────────

// Using a global variable to persist memory during Next.js HMR (hot reloading)
declare global {
  var _mockDb: MockDB | undefined;
}

class MockDB {
  users: User[] = [...initialUsers];
  categories: Category[] = [...initialCategories];
  products: Product[] = [...initialProducts];
  tables: Table[] = [...initialTables];
  orders: Order[] = [];
  pensionists: Pensionist[] = [...initialPensionists];
  consumptions: Consumption[] = [];

  // Generic helper for Mongoose-like "findById"
  findById<T extends { id: string }>(collection: T[], id: string): T | undefined {
    return collection.find(item => item.id === id);
  }

  // Helper for generating IDs
  generateId(prefix: string): string {
    return `${prefix}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const db = global._mockDb || new MockDB();
if (process.env.NODE_ENV !== "production") {
  global._mockDb = db;
}
