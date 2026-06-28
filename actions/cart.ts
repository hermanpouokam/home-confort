"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCartFromCookie, serializeCart, type CartItem } from "@/lib/cart";

const CART_COOKIE = "hc_cart";
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 60 * 60 * 24 * 7, // 7 days
  path: "/",
};

const addToCartSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive().max(99),
});

export async function addToCart(productId: string, quantity: number = 1) {
  const parsed = addToCartSchema.safeParse({ productId, quantity });
  if (!parsed.success) {
    return { error: "Données invalides" };
  }

  const items = getCartFromCookie();
  const existing = items.find((item) => item.productId === productId);

  if (existing) {
    existing.quantity = Math.min(existing.quantity + quantity, 99);
  } else {
    items.push({ productId, quantity });
  }

  cookies().set(CART_COOKIE, serializeCart(items), COOKIE_OPTIONS);
  revalidatePath("/", "layout");

  return { success: true };
}

export async function updateCartItem(productId: string, quantity: number) {
  const parsed = z
    .object({ productId: z.string().min(1), quantity: z.number().int().min(0).max(99) })
    .safeParse({ productId, quantity });

  if (!parsed.success) {
    return { error: "Données invalides" };
  }

  let items = getCartFromCookie();

  if (quantity === 0) {
    items = items.filter((item) => item.productId !== productId);
  } else {
    const existing = items.find((item) => item.productId === productId);
    if (existing) {
      existing.quantity = quantity;
    }
  }

  cookies().set(CART_COOKIE, serializeCart(items), COOKIE_OPTIONS);
  revalidatePath("/cart");

  return { success: true };
}

export async function removeFromCart(productId: string) {
  const items = getCartFromCookie();
  const filtered = items.filter((item) => item.productId !== productId);

  cookies().set(CART_COOKIE, serializeCart(filtered), COOKIE_OPTIONS);
  revalidatePath("/cart");

  return { success: true };
}

export async function clearCart() {
  cookies().delete(CART_COOKIE);
  revalidatePath("/", "layout");
}

export async function getCartCount(): Promise<number> {
  const items = getCartFromCookie();
  return items.reduce((acc: number, item: CartItem) => acc + item.quantity, 0);
}
