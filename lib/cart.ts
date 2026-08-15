import { cookies } from "next/headers";
import { prisma } from "./prisma";

const CART_COOKIE = "hc_cart";

export interface CartItem {
  productId: string;
  quantity: number;
}

export interface CartItemWithProduct extends CartItem {
  product: {
    id: string;
    slug: string;
    name: Record<string, string>;
    price: number;
    originalPrice: number | null;
    promoEndsAt: Date | string | null;
    stock: number;
    images: string[];
  };
}

export async function getCartFromCookie(): Promise<CartItem[]> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(CART_COOKIE)?.value;
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item: unknown) =>
        typeof item === "object" &&
        item !== null &&
        typeof (item as CartItem).productId === "string" &&
        typeof (item as CartItem).quantity === "number" &&
        (item as CartItem).quantity > 0
    );
  } catch {
    return [];
  }
}

export function serializeCart(items: CartItem[]): string {
  return JSON.stringify(items);
}

export async function getHydratedCart(locale: string = "fr"): Promise<CartItemWithProduct[]> {
  const cartItems = await getCartFromCookie();
  if (cartItems.length === 0) return [];

  const productIds = cartItems.map((item) => item.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, active: true },
    select: {
      id: true, slug: true, name: true, price: true, stock: true, images: true,
      originalPrice: true, promoEndsAt: true,
    },
  });

  return cartItems
    .map((item) => {
      const product = products.find((p: typeof products[0]) => p.id === item.productId);
      if (!product) return null;
      return {
        productId: item.productId,
        quantity: Math.min(item.quantity, product.stock),
        product: {
          id: product.id,
          slug: product.slug,
          name: product.name as Record<string, string>,
          price: Number(product.price),
          originalPrice: product.originalPrice ? Number(product.originalPrice) : null,
          promoEndsAt: product.promoEndsAt ?? null,
          stock: product.stock,
          images: product.images,
        },
      };
    })
    .filter((item): item is CartItemWithProduct => item !== null);
}

export function getCartTotal(items: CartItemWithProduct[]): number {
  return items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
}

export function getCartCount(items: CartItem[]): number {
  return items.reduce((acc, item) => acc + item.quantity, 0);
}
