"use client";

import { useState, useTransition,useEffect } from "react";
import { useFormState } from "react-dom";
import { Check, ChevronRight, Loader2 } from "lucide-react";
import { placeOrder, type OrderFormState } from "@/actions/order";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatPrice } from "@/lib/utils";
import { trackEvent } from "@/lib/meta/pixel";
import { useTranslations } from "next-intl";

interface CartItem {
  productId: string;
  quantity: number;
  product: {
    name: Record<string, string>;
    price: number;
    images: string[];
  };
}

interface CheckoutStepperProps {
  cartItems: CartItem[];
  total: number;
  locale: string;
}

const steps = [
  { id: 1, label: "steps.step1" },
  { id: 2, label: "steps.step2" },
  { id: 3, label: "steps.step3" },
];

const deliveryModes = [
  { id: "standard", label: "standard", desc: "standardDesc", price: 1500 },
  { id: "express", label: "express", desc: "expressDesc", price: 3000 },
  { id: "relay", label: "relay", desc: "relayDesc", price: 0 },
];

const slots = [
  { id: "morning", label: "morning" },
  { id: "afternoon", label: "afternoon" },
  { id: "evening", label: "evening" },
];

const initialState: OrderFormState = {};

export default function CheckoutStepper({ cartItems, total, locale }: CheckoutStepperProps) {
  const t = useTranslations("checkout");
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "Douala",
    district: "",
    zip: "237",
    deliveryMode: "standard",
    slot: "morning",
    notes: "",
  });

  const [state, formAction] = useFormState(placeOrder, initialState);
  const [isPending, startTransition] = useTransition();

  const shippingCost = deliveryModes.find((m) => m.id === form.deliveryMode)?.price ?? 0;
  const grandTotal = total + shippingCost;

  const updateField = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const validateStep1 = () => {
    return form.firstName && form.lastName && form.email && form.phone;
  };

  const validateStep2 = () => {
    return form.address && form.city && form.district && form.deliveryMode && form.slot;
  };

  // ── AddPaymentInfo — déclenché quand l'utilisateur arrive à l'étape 3 ──
  useEffect(() => {
    if (step === 3) {
      trackEvent("AddPaymentInfo", {
        currency: "XAF",
        value: grandTotal,
        content_ids: cartItems.map((i) => i.productId),
        contents: cartItems.map((i) => ({
          id: i.productId,
          quantity: i.quantity,
          item_price: i.product.price,
        })),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress */}
      <div className="flex items-center gap-0 mb-10">
        {steps.map((s, i) => (
          <div key={s.id} className="flex items-center flex-1">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 transition-all ${step > s.id
                  ? "bg-emerald-400 text-white"
                  : step === s.id
                    ? "bg-[#111210] text-white"
                    : "bg-[#F4F4F1] text-[#9CA3AF]"
                }`}
            >
              {step > s.id ? <Check className="w-4 h-4" /> : s.id}
            </div>
            <span
              className={`ml-2 text-sm font-medium hidden sm:block ${step === s.id ? "text-[#111210]" : "text-[#9CA3AF]"
                }`}
            >
              {t(s.label as "steps.step1")}
            </span>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-px mx-4 ${step > s.id ? "bg-emerald-400" : "bg-[#E8E8E3]"}`} />
            )}
          </div>
        ))}
      </div>

      <form action={formAction}>
        {/* Hidden fields always present */}
        <input type="hidden" name="firstName" value={form.firstName} />
        <input type="hidden" name="lastName" value={form.lastName} />
        <input type="hidden" name="email" value={form.email} />
        <input type="hidden" name="phone" value={form.phone} />
        <input type="hidden" name="address" value={form.address} />
        <input type="hidden" name="city" value={form.city} />
        <input type="hidden" name="district" value={form.district} />
        <input type="hidden" name="zip" value={form.zip} />
        <input type="hidden" name="deliveryMode" value={form.deliveryMode} />
        <input type="hidden" name="slot" value={form.slot} />
        <input type="hidden" name="notes" value={form.notes} />

        {/* Step 1 — Personal info */}
        {step === 1 && (
          <div className="bg-white rounded-2xl border border-[#E8E8E3] p-6">
            <h2 className="font-semibold text-lg text-[#111210] mb-6">{t("yourInfo")}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="firstName">{t("firstName")} *</Label>
                <Input
                  id="firstName"
                  value={form.firstName}
                  onChange={(e) => updateField("firstName", e.target.value)}
                  placeholder={t("firstName")}
                  required
                />
                {state.errors?.firstName && (
                  <p className="text-xs text-red-500">{state.errors.firstName[0]}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lastName">{t("lastName")} *</Label>
                <Input
                  id="lastName"
                  value={form.lastName}
                  onChange={(e) => updateField("lastName", e.target.value)}
                  placeholder={t("lastName")}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">{t("email")} *</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  placeholder="jean@example.com"
                  required
                />
                {state.errors?.email && (
                  <p className="text-xs text-red-500">{state.errors.email[0]}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">{t("phone")} *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  placeholder="+237 6XX XXX XXX"
                  required
                />
                {state.errors?.phone && (
                  <p className="text-xs text-red-500">{state.errors.phone[0]}</p>
                )}
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => validateStep1() && setStep(2)}
                disabled={!validateStep1()}
                className="btn-primary"
              >
                {t("next")}
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2 — Delivery */}
        {step === 2 && (
          <div className="bg-white rounded-2xl border border-[#E8E8E3] p-6 space-y-6">
            <h2 className="font-semibold text-lg text-[#111210]">{t("step2")}</h2>

            {/* Address */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 space-y-1.5">
                <Label>{t("address")} *</Label>
                <Input
                  value={form.address}
                  onChange={(e) => updateField("address", e.target.value)}
                  placeholder="123 Rue de la Paix"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>{t("city")} *</Label>
                <Input
                  value={form.city}
                  onChange={(e) => updateField("city", e.target.value)}
                  placeholder="Douala"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>{t("district")} *</Label>
                <Input
                  value={form.district}
                  onChange={(e) => updateField("district", e.target.value)}
                  placeholder="Akwa"
                  required
                />
              </div>
            </div>

            {/* Delivery mode */}
            <div className="space-y-3">
              <Label>{t("deliveryMode")}</Label>
              <div className="grid gap-3">
                {deliveryModes.map((mode) => (
                  <label
                    key={mode.id}
                    className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${form.deliveryMode === mode.id
                        ? "border-emerald-400 bg-emerald-50"
                        : "border-[#E8E8E3] hover:border-emerald-200"
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${form.deliveryMode === mode.id
                            ? "border-emerald-400 bg-emerald-400"
                            : "border-[#E8E8E3]"
                          }`}
                      >
                        {form.deliveryMode === mode.id && (
                          <div className="w-1.5 h-1.5 rounded-full bg-white" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm text-[#111210]">{t(mode.label as "standard")}</p>
                        <p className="text-xs text-[#9CA3AF]">{t(mode.desc as "standardDesc")}</p>
                      </div>
                    </div>
                    <span className="font-semibold text-sm text-[#111210]">
                      {mode.price === 0 ? t("free") : formatPrice(mode.price)}
                    </span>
                    <input
                      type="radio"
                      name="deliveryModeSelect"
                      value={mode.id}
                      checked={form.deliveryMode === mode.id}
                      onChange={() => updateField("deliveryMode", mode.id)}
                      className="sr-only"
                    />
                  </label>
                ))}
              </div>
            </div>

            {/* Slot */}
            <div className="space-y-3">
              <Label>{t("deliverySlot")}</Label>
              <div className="flex flex-wrap gap-3">
                {slots.map((slot) => (
                  <button
                    key={slot.id}
                    type="button"
                    onClick={() => updateField("slot", slot.id)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all ${form.slot === slot.id
                        ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                        : "border-[#E8E8E3] text-[#6B7280] hover:border-emerald-200"
                      }`}
                  >
                    {t(slot.label as "morning")}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <Label>{t("notes")}</Label>
              <Textarea
                value={form.notes}
                onChange={(e) => updateField("notes", e.target.value)}
                placeholder={t("notesPlaceholder")}
                rows={2}
              />
            </div>

            <div className="flex justify-between pt-2">
              <button type="button" onClick={() => setStep(1)} className="btn-secondary">
                {t("back")}
              </button>
              <button
                type="button"
                onClick={() => validateStep2() && setStep(3)}
                disabled={!validateStep2()}
                className="btn-primary"
              >
                {t("next")}
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3 — Summary + Confirm */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-[#E8E8E3] p-6">
              <h2 className="font-semibold text-lg text-[#111210] mb-4">{t("orderSummary")}</h2>

              {/* Customer info */}
              <div className="grid grid-cols-2 gap-3 text-sm mb-6 pb-6 border-b border-[#E8E8E3]">
                <div>
                  <p className="text-[#9CA3AF] text-xs uppercase tracking-wider mb-1">{t("customerInfo")}</p>
                  <p className="font-medium">{form.firstName} {form.lastName}</p>
                  <p className="text-[#6B7280]">{form.phone}</p>
                </div>
                <div>
                  <p className="text-[#9CA3AF] text-xs uppercase tracking-wider mb-1">{t("deliveryInfo")}</p>
                  <p className="font-medium">{form.address}</p>
                  <p className="text-[#6B7280]">{form.district}, {form.city}</p>
                </div>
              </div>

              {/* Items */}
              <div className="space-y-3 mb-6 pb-6 border-b border-[#E8E8E3]">
                {cartItems.map((item) => {
                  const name = item.product.name[locale] ?? item.product.name.fr;
                  return (
                    <div key={item.productId} className="flex justify-between items-center text-sm">
                      <span className="text-[#6B7280]">
                        {name} <span className="text-[#9CA3AF]">× {item.quantity}</span>
                      </span>
                      <span className="font-medium">{formatPrice(item.product.price * item.quantity)}</span>
                    </div>
                  );
                })}
              </div>

              {/* Totals */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#6B7280]">{t("subtotal")}</span>
                  <span>{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B7280]">{t("shipping")} ({t(deliveryModes.find(m => m.id === form.deliveryMode)?.label as "standard")})</span>
                  <span>{shippingCost === 0 ? t("free") : formatPrice(shippingCost)}</span>
                </div>
                <div className="flex justify-between font-semibold text-base pt-2 border-t border-[#E8E8E3]">
                  <span>{t("total")}</span>
                  <span>{formatPrice(grandTotal)}</span>
                </div>
              </div>
            </div>

            {state.message && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-600">
                {state.message}
              </div>
            )}

            <div className="flex justify-between">
              <button type="button" onClick={() => setStep(2)} className="btn-secondary">
                {t("back")}
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="btn-primary text-base px-8 py-3"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t("processing")}
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    {t("confirm")}
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}