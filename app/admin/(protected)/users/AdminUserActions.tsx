"use client";

import { useState, useTransition } from "react";
import { Plus, ToggleLeft, ToggleRight, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFormState, useFormStatus } from "react-dom";
import { createAdmin, toggleAdminActive, updateAdminRole } from "@/actions/admin";

type CreateAdminState = {
  errors?: { email?: string[]; password?: string[]; role?: string[] };
  error?: string;
  success?: boolean;
};

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary">
      {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
      {label}
    </button>
  );
}

interface AdminUserActionsProps {
  mode: "create" | "edit";
  adminId?: string;
  adminEmail?: string;
  currentRole?: string;
  active?: boolean;
  isSelf?: boolean;
}

const initialState: CreateAdminState = {};

export default function AdminUserActions({ mode, adminId, adminEmail, currentRole, active, isSelf }: AdminUserActionsProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [state, formAction] = useFormState(
    createAdmin as (state: CreateAdminState, formData: FormData) => Promise<CreateAdminState>,
    initialState
  );
  const [role, setRole] = useState(currentRole ?? "ADMIN");

  const handleToggle = () => {
    if (!adminId) return;
    startTransition(async () => { await toggleAdminActive(adminId, !active); });
  };

  const handleRoleChange = (newRole: string) => {
    if (!adminId) return;
    setRole(newRole);
    startTransition(async () => { await updateAdminRole(adminId, newRole as "ADMIN" | "SUPER_ADMIN"); });
  };

  if (mode === "create") {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <button className="btn-primary"><Plus className="w-4 h-4" />Ajouter un admin</button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Nouvel administrateur</DialogTitle></DialogHeader>
          <form action={formAction} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input name="email" type="email" placeholder="admin@example.com" required />
              {state?.errors?.email && <p className="text-xs text-red-500">{state.errors.email[0]}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Mot de passe</Label>
              <Input name="password" type="password" placeholder="••••••••" required />
              {state?.errors?.password && <p className="text-xs text-red-500">{state.errors.password[0]}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Rôle</Label>
              <Select name="role" defaultValue="ADMIN">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {state?.error && <p className="text-sm text-red-500">{state.error}</p>}
            <div className="flex justify-end"><SubmitButton label="Créer" /></div>
          </form>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <div className="flex items-center gap-2 justify-end">
      {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin text-[#9CA3AF]" />}
      {!isSelf && (
        <>
          <Select value={role} onValueChange={handleRoleChange} disabled={isPending}>
            <SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ADMIN" className="text-xs">Admin</SelectItem>
              <SelectItem value="SUPER_ADMIN" className="text-xs">Super Admin</SelectItem>
            </SelectContent>
          </Select>
          <button onClick={handleToggle} disabled={isPending} className="p-1.5 rounded-lg hover:bg-[#F4F4F1] transition-colors" title={active ? "Désactiver" : "Activer"}>
            {active ? <ToggleRight className="w-4 h-4 text-emerald-500" /> : <ToggleLeft className="w-4 h-4 text-[#9CA3AF]" />}
          </button>
        </>
      )}
      {isSelf && <span className="text-xs text-[#9CA3AF]">(vous)</span>}
    </div>
  );
}
