"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { Toaster }  from "@/components/ui/toaster";
import { getProfileApi, updateProfileApi, changePasswordApi } from "@/src/api/auth.api";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  User, Building2, Lock, Upload,
  Eye, EyeOff, CheckCircle2, Save, AlertCircle,
} from "lucide-react";

// ─── Section Card ─────────────────────────────────────────────────────────────
function SectionCard({ title, icon: Icon, children }: {
  title: string; icon: any; children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-2">
        <Icon className="w-4 h-4 text-[hsl(var(--brand-primary))]" />
        <h2 className="text-base font-satisfy text-[hsl(var(--brand-primary))]">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

// ─── Labeled Input ────────────────────────────────────────────────────────────
function LabeledInput({ label, value, onChange, placeholder, type = "text", disabled = false }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; disabled?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-poppins font-medium text-gray-500">{label}</Label>
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
      />
    </div>
  );
}

// ─── Password Input ───────────────────────────────────────────────────────────
function PasswordInput({ label, value, onChange, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-poppins font-medium text-gray-500">{label}</Label>
      <div className="relative">
        <Input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="pr-10"
        />
        <button type="button" onClick={() => setShow((p) => !p)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
export default function SettingsPage() {
  const { toast }        = useToast();
  const queryClient      = useQueryClient();
  const fileRef          = useRef<HTMLInputElement>(null);

  // ── Fetch profile ──────────────────────────────────────────────────────────
  const { data: profileData, isLoading } = useQuery({
    queryKey: ["settings", "profile"],
    queryFn:  getProfileApi,
    staleTime: 30000,
  });

  const restaurant = (profileData?.data as any)?.data ?? {};

  // ── Profile form state ─────────────────────────────────────────────────────
  const [profile, setProfile] = useState({
    restaurantName:    "",
    restaurantPhone:   "",
    restaurantAddress: "",
    ownerFullName:     "",
    ownerPhone:        "",
    ownerAddress:      "",
  });
  const [logoFile,    setLogoFile]    = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // ── Password form state ────────────────────────────────────────────────────
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword:     "",
    confirmPassword: "",
  });

  // ── Populate form once data loads ──────────────────────────────────────────
  useEffect(() => {
    if (!restaurant?._id) return;
    setProfile({
      restaurantName:    restaurant.name           ?? "",
      restaurantPhone:   restaurant.phone          ?? "",
      restaurantAddress: restaurant.address        ?? "",
      ownerFullName:     restaurant.owner?.fullName ?? "",
      ownerPhone:        restaurant.owner?.phone    ?? "",
      ownerAddress:      restaurant.owner?.address  ?? "",
    });
    if (restaurant.logo) setLogoPreview(restaurant.logo);
  }, [restaurant?._id]);

  // ── Update profile mutation ────────────────────────────────────────────────
  const updateMutation = useMutation({
    mutationFn: (formData: FormData) => updateProfileApi(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings", "profile"] });
      toast({ title: "Profile updated", description: "Your changes have been saved." });
    },
    onError: (err: any) => {
      toast({
        title: "Update failed",
        description: err?.response?.data?.message ?? "Something went wrong",
        variant: "destructive",
      });
    },
  });

  // ── Change password mutation ───────────────────────────────────────────────
  const passwordMutation = useMutation({
    mutationFn: changePasswordApi,
    onSuccess: () => {
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
      toast({ title: "Password changed", description: "Your password has been updated." });
    },
    onError: (err: any) => {
      toast({
        title: "Password change failed",
        description: err?.response?.data?.message ?? "Something went wrong",
        variant: "destructive",
      });
    },
  });

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(profile).forEach(([k, v]) => { if (v) fd.append(k, v); });
    if (logoFile) fd.append("logo", logoFile);
    updateMutation.mutate(fd);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast({ title: "Passwords don't match", description: "New password and confirm password must match.", variant: "destructive" });
      return;
    }
    if (passwords.newPassword.length < 6) {
      toast({ title: "Password too short", description: "New password must be at least 6 characters.", variant: "destructive" });
      return;
    }
    passwordMutation.mutate({ currentPassword: passwords.currentPassword, newPassword: passwords.newPassword });
  };

  // ── Skeleton ───────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="p-4 md:p-6">
        <div className="max-w-4xl mx-auto space-y-5">
          <div className="h-8 w-48 bg-gray-100 animate-pulse rounded-xl" />
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
              <div className="h-5 w-32 bg-gray-100 animate-pulse rounded-lg" />
              <div className="grid grid-cols-2 gap-4">
                {[...Array(4)].map((_, j) => <div key={j} className="h-10 bg-gray-100 animate-pulse rounded-xl" />)}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-5">

        {/* ── Header ── */}
        <div>
          <h1 className="text-2xl font-satisfy text-[hsl(var(--brand-primary))]">Settings</h1>
          <p className="text-sm font-poppins text-gray-500 mt-0.5">Manage your restaurant profile and account</p>
        </div>

        {/* ── Logo + Profile Summary ── */}
        <div className="bg-gradient-to-r from-brand-primary to-brand-secondary p-0.5 rounded-2xl">
          <div className="bg-white rounded-[calc(1rem-2px)] px-6 py-5 flex items-center gap-5">
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gray-100 border-2 border-white shadow">
                {logoPreview
                  ? <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                  : (
                    <div className="w-full h-full flex items-center justify-center bg-orange-50">
                      <Building2 className="w-8 h-8 text-orange-300" />
                    </div>
                  )}
              </div>
              <button onClick={() => fileRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-gradient-to-r from-brand-primary to-brand-secondary
                  flex items-center justify-center shadow-sm hover:shadow-md transition-shadow">
                <Upload className="w-3.5 h-3.5 text-white" />
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
            </div>
            <div>
              <p className="text-lg font-satisfy text-gray-800">{restaurant.name ?? "Your Restaurant"}</p>
              <p className="text-sm font-poppins text-gray-400">{restaurant.email ?? ""}</p>
              <div className="flex items-center gap-1.5 mt-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                <span className="text-xs font-poppins text-green-600">Verified account</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Restaurant Info ── */}
        <form onSubmit={handleProfileSubmit} className="space-y-5">
          <SectionCard title="Restaurant Info" icon={Building2}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <LabeledInput label="Restaurant Name"    value={profile.restaurantName}
                onChange={(v) => setProfile((p) => ({ ...p, restaurantName: v }))}    placeholder="e.g. Spice Garden" />
              <LabeledInput label="Restaurant Phone"   value={profile.restaurantPhone}
                onChange={(v) => setProfile((p) => ({ ...p, restaurantPhone: v }))}   placeholder="+92 300 0000000" />
              <div className="sm:col-span-2">
                <LabeledInput label="Restaurant Address" value={profile.restaurantAddress}
                  onChange={(v) => setProfile((p) => ({ ...p, restaurantAddress: v }))} placeholder="Street, City, Country" />
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Owner Info" icon={User}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <LabeledInput label="Owner Full Name" value={profile.ownerFullName}
                onChange={(v) => setProfile((p) => ({ ...p, ownerFullName: v }))}   placeholder="Full name" />
              <LabeledInput label="Owner Phone"     value={profile.ownerPhone}
                onChange={(v) => setProfile((p) => ({ ...p, ownerPhone: v }))}      placeholder="+92 300 0000000" />
              <div className="sm:col-span-2">
                <LabeledInput label="Owner Address" value={profile.ownerAddress}
                  onChange={(v) => setProfile((p) => ({ ...p, ownerAddress: v }))}  placeholder="Home address" />
              </div>
            </div>
          </SectionCard>

          <div className="flex justify-end">
            <button type="submit" disabled={updateMutation.isPending}
              className="h-10 px-6 rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary
                text-white text-sm font-poppins font-medium flex items-center gap-2
                hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed shadow-sm">
              {updateMutation.isPending
                ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving…</>
                : <><Save className="w-4 h-4" /> Save Changes</>}
            </button>
          </div>
        </form>

        {/* ── Change Password ── */}
        <form onSubmit={handlePasswordSubmit}>
          <SectionCard title="Change Password" icon={Lock}>
            <div className="space-y-4">
              {passwords.newPassword && passwords.confirmPassword &&
                passwords.newPassword !== passwords.confirmPassword && (
                <div className="flex items-center gap-2 px-4 py-2.5 bg-red-50 border border-red-100 rounded-xl">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <p className="text-xs font-poppins text-red-600">Passwords don't match</p>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <PasswordInput label="Current Password" value={passwords.currentPassword}
                  onChange={(v) => setPasswords((p) => ({ ...p, currentPassword: v }))}
                  placeholder="Current password" />
                <PasswordInput label="New Password" value={passwords.newPassword}
                  onChange={(v) => setPasswords((p) => ({ ...p, newPassword: v }))}
                  placeholder="Min. 6 characters" />
                <PasswordInput label="Confirm New Password" value={passwords.confirmPassword}
                  onChange={(v) => setPasswords((p) => ({ ...p, confirmPassword: v }))}
                  placeholder="Repeat new password" />
              </div>
              <div className="flex justify-end">
                <button type="submit"
                  disabled={
                    passwordMutation.isPending ||
                    !passwords.currentPassword ||
                    !passwords.newPassword ||
                    passwords.newPassword !== passwords.confirmPassword
                  }
                  className="h-10 px-6 rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary
                    text-white text-sm font-poppins font-medium flex items-center gap-2
                    hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed shadow-sm">
                  {passwordMutation.isPending
                    ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Changing…</>
                    : <><Lock className="w-4 h-4" /> Change Password</>}
                </button>
              </div>
            </div>
          </SectionCard>
        </form>

        {/* ── Account Info (read-only) ── */}
        <SectionCard title="Account Information" icon={CheckCircle2}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <LabeledInput label="Email (read-only)" value={restaurant.email ?? ""} onChange={() => {}}
              disabled placeholder="email@example.com" />
            <LabeledInput label="Account Status" value={restaurant.isVerified ? "Verified" : "Unverified"}
              onChange={() => {}} disabled />
          </div>
        </SectionCard>

      </div>
      <Toaster />
    </div>
  );
}
