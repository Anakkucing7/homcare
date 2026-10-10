import { categories, type Service } from "./services";

export type CartItem = { id?: string; name: string; quantity: number };
const storageKey = "homecare-cart-v1";
const services = new Map<string, Service>(categories.flatMap((category) => category.services.map((service) => [service.name, service])));

export function getCart(): CartItem[] {
  try {
    const saved: unknown = JSON.parse(window.sessionStorage.getItem(storageKey) ?? "[]");
    if (!Array.isArray(saved)) return [];
    return saved.flatMap((item): CartItem[] => {
      if (!item || typeof item.name !== "string" || (!item.id && !services.has(item.name)) || !Number.isInteger(item.quantity) || item.quantity < 1) return [];
      return [{ id: typeof item.id === "string" ? item.id : undefined, name: item.name, quantity: Math.min(item.quantity, 99) }];
    });
  } catch {
    return [];
  }
}

function saveCart(cart: CartItem[]) {
  window.sessionStorage.setItem(storageKey, JSON.stringify(cart));
}

export function addToCart(name: string, id?: string) {
  if (!id && !services.has(name)) return;
  const cart = getCart();
  const item = cart.find((entry) => (id ? entry.id === id : entry.name === name));
  if (item) item.quantity = Math.min(item.quantity + 1, 99);
  else cart.push({ id, name, quantity: 1 });
  saveCart(cart);
}

export function changeCartQuantity(name: string, change: -1 | 1, id?: string) {
  const cart = getCart().flatMap((item) => {
    if (id ? (item.id ? item.id !== id : item.name !== name) : item.name !== name) return [item];
    const quantity = item.quantity + change;
    return quantity > 0 ? [{ ...item, quantity: Math.min(quantity, 99) }] : [];
  });
  saveCart(cart);
  return cart;
}

export function removeFromCart(name: string, id?: string) {
  const cart = getCart().filter((item) => id ? (item.id ? item.id !== id : item.name !== name) : item.name !== name);
  saveCart(cart);
  return cart;
}
