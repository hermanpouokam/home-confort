// ─── Meta Pixel & Conversions API — Shared Types ───────────────────────────

export type MetaEventName =
  | "PageView"
  | "ViewContent"
  | "AddToCart"
  | "RemoveFromCart"
  | "InitiateCheckout"
  | "AddPaymentInfo"
  | "Purchase"
  | "Search";

// Données produit normalisées pour les événements
export interface MetaContentItem {
  id: string;
  quantity: number;
  item_price?: number;
}

// Paramètres communs aux événements e-commerce
export interface MetaEventData {
  event_name: MetaEventName;
  event_id: string; // Pour la déduplication Pixel ↔ CAPI
  content_ids?: string[];
  content_name?: string;
  content_type?: "product" | "product_group";
  contents?: MetaContentItem[];
  currency?: string;
  value?: number;
  search_string?: string;
  num_items?: number;
}

// Données utilisateur hashées (SHA-256) envoyées à la CAPI
export interface MetaUserData {
  em?: string;   // email haché
  ph?: string;   // téléphone haché
  fn?: string;   // prénom haché
  ln?: string;   // nom haché
  ct?: string;   // ville hachée
  country?: string; // pays haché
  client_ip_address?: string;
  client_user_agent?: string;
  fbc?: string;  // cookie _fbc
  fbp?: string;  // cookie _fbp
}

// Payload envoyé au endpoint /api/meta/events
export interface MetaClientEventPayload {
  event_name: MetaEventName;
  event_id: string;
  event_data?: Omit<MetaEventData, "event_name" | "event_id">;
  url?: string;
}

// Format catalogue Meta
export interface MetaCatalogProduct {
  id: string;
  title: string;
  description: string;
  availability: "in stock" | "out of stock";
  condition: "new";
  price: string;  // "10000 XAF"
  link: string;
  image_link: string;
  brand: string;
  google_product_category?: string;
}
