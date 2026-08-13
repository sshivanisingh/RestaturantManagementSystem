"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { useRegister, useSendOtp, useVerifyOtp } from "@/src/hooks";
import { useRouter } from "next/navigation";
import {
  Loader2,
  User,
  UtensilsCrossed,
  ShieldCheck,
  Check,
  Zap,
  BarChart3,
  Rocket,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface FormData {
  ownerFullName: string;
  ownerEmail: string;
  ownerPhone: string;
  ownerAddress: string;
  name: string;
  restaurantEmail: string;
  restaurantPhone: string;
  restaurantAddress: string;
  password: string;
  confirmPassword: string;
  logo: File | null;
}

const STEPS = [
  { id: 1, label: "Owner", Icon: User },
  { id: 2, label: "Restaurant", Icon: UtensilsCrossed },
  { id: 3, label: "Security", Icon: ShieldCheck },
];

// ─── Reusable Field — uses same Input component, no double ring ───────────────
function Field({
  label,
  id,
  type = "text",
  value,
  onChange,
  placeholder,
  required = true,
}: {
  label: string;
  id: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <Label
        htmlFor={id}
        className="text-sm font-medium text-gray-700 font-poppins"
      >
        {label}{" "}
        {required && (
          <span style={{ color: "hsl(var(--brand-primary))" }}>*</span>
        )}
      </Label>
      <Input
        id={id}
        type={type}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

// ─── OTP Modal — all logic unchanged, only style updated ─────────────────────
function OtpModal({
  email,
  onClose,
  onVerified,
}: {
  email: string;
  onClose: () => void;
  onVerified: () => void;
}) {
  const { toast } = useToast();
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [shake, setShake] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const { mutate: verifyOtp, isPending: verifying } = useVerifyOtp({
    onSuccess: () => {
      toast({
        title: "✅ Email Verified!",
        description: "OTP verified successfully.",
      });
      onVerified();
    },
    onError: (err: any) => {
      toast({
        title: "Invalid OTP",
        description: err?.response?.data?.message || "Wrong OTP",
        variant: "destructive",
      });
      setShake(true);
      setTimeout(() => {
        setShake(false);
        setOtp(Array(6).fill(""));
        inputRefs.current[0]?.focus();
      }, 600);
    },
  });

  const { mutate: resendOtp, isPending: resending } = useSendOtp({
    onSuccess: () => {
      toast({
        title: "OTP Resent! 📧",
        description: `New OTP sent to ${email}`,
      });
      setTimer(30);
      setCanResend(false);
      setOtp(Array(6).fill(""));
      inputRefs.current[0]?.focus();
    },
    onError: (err: any) =>
      toast({
        title: "Failed to resend",
        description: err?.response?.data?.message || "Try again",
        variant: "destructive",
      }),
  });

  useEffect(() => {
    if (timer === 0) {
      setCanResend(true);
      return;
    }
    const t = setTimeout(() => setTimer((p) => p - 1), 1000);
    return () => clearTimeout(t);
  }, [timer]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (i: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp];
    next[i] = val.slice(-1);
    setOtp(next);
    if (val && i < 5) inputRefs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[i] && i > 0)
      inputRefs.current[i - 1]?.focus();
    if (e.key === "ArrowLeft" && i > 0) inputRefs.current[i - 1]?.focus();
    if (e.key === "ArrowRight" && i < 5) inputRefs.current[i + 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (!pasted) return;
    const next = Array(6).fill("");
    pasted.split("").forEach((ch, i) => {
      next[i] = ch;
    });
    setOtp(next);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const filled = otp.filter(Boolean).length;

  const handleVerify = () => {
    const code = otp.join("");
    if (code.length < 6) {
      toast({
        title: "Incomplete OTP",
        description: "Enter all 6 digits",
        variant: "destructive",
      });
      return;
    }
    verifyOtp({ email, otp: code });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="relative w-full max-w-sm bg-white shadow-xl overflow-hidden
        animate-in fade-in zoom-in-95 duration-200"
      >
        <div
          className="h-1 w-full"
          style={{
            background:
              "linear-gradient(90deg, hsl(var(--brand-primary)), hsl(var(--brand-accent)))",
          }}
        />

        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 w-7 h-7 bg-gray-100 hover:bg-gray-200
            flex items-center justify-center text-gray-400 hover:text-gray-700 text-sm font-bold transition-colors"
        >
          ✕
        </button>

        <div className="px-7 pt-6 pb-7 space-y-5">
          <div className="text-center">
            <div className="text-4xl mb-2">📧</div>
            <h3
              className="text-xl font-satisfy"
              style={{ color: "hsl(var(--brand-primary))" }}
            >
              Verify Your Email
            </h3>
            <p className="text-xs font-poppins text-gray-400 mt-1">
              We sent a 6-digit code to
            </p>
            <p
              className="text-sm font-poppins font-semibold mt-0.5"
              style={{ color: "hsl(var(--brand-dark))" }}
            >
              {email}
            </p>
          </div>

          {/* OTP inputs */}
          <div
            className={`flex gap-2 justify-center ${shake ? "animate-[shake_0.5s_ease-in-out]" : ""}`}
            onPaste={handlePaste}
          >
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={(el) => {
                  inputRefs.current[i] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className={`w-11 text-center text-xl font-bold font-poppins border-2 outline-none
                  transition-all duration-150
                  ${
                    shake
                      ? "border-red-400 bg-red-50 text-red-500"
                      : digit
                        ? "border-orange-400 bg-orange-50 text-orange-500"
                        : "border-gray-200 bg-gray-50 text-gray-800"
                  }
                  focus:border-orange-400 focus:bg-orange-50`}
                style={{ height: "52px" }}
              />
            ))}
          </div>

          {/* Progress dots */}
          <div className="flex justify-center gap-1.5">
            {otp.map((d, i) => (
              <div
                key={i}
                className={`h-1 rounded-full transition-all duration-200 ${
                  d ? "w-5 bg-orange-400" : "w-2 bg-gray-200"
                }`}
              />
            ))}
          </div>

          <Button
            onClick={handleVerify}
            disabled={verifying || filled < 6}
            className="w-full h-11 font-poppins font-semibold rounded-lg transition-all hover:opacity-90"
            style={{
              background:
                filled === 6
                  ? "linear-gradient(135deg, hsl(var(--brand-primary)), hsl(var(--brand-secondary)))"
                  : "#f3f4f6",
              color: filled === 6 ? "white" : "#9ca3af",
            }}
          >
            {verifying ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Verifying…
              </span>
            ) : filled === 6 ? (
              "✓ Verify OTP"
            ) : (
              `Enter ${6 - filled} more digit${6 - filled !== 1 ? "s" : ""}`
            )}
          </Button>

          <div className="text-center">
            {canResend ? (
              <button
                type="button"
                onClick={() => resendOtp({ email })}
                disabled={resending}
                className="text-sm font-poppins font-medium hover:underline disabled:opacity-50"
                style={{ color: "hsl(var(--brand-primary))" }}
              >
                {resending ? "Sending..." : "↺ Resend OTP"}
              </button>
            ) : (
              <p className="text-xs font-poppins text-gray-400">
                Resend in{" "}
                <span
                  className="font-bold tabular-nums"
                  style={{ color: "hsl(var(--brand-primary))" }}
                >
                  {timer}s
                </span>
              </p>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%,100%{transform:translateX(0)} 20%{transform:translateX(-6px)}
          40%{transform:translateX(6px)}   60%{transform:translateX(-4px)}
          80%{transform:translateX(4px)}
        }
      `}</style>
    </div>
  );
}

// ─── Main Register Page ───────────────────────────────────────────────────────
export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>({
    ownerFullName: "",
    ownerEmail: "",
    ownerPhone: "",
    ownerAddress: "",
    name: "",
    restaurantEmail: "",
    restaurantPhone: "",
    restaurantAddress: "",
    password: "",
    confirmPassword: "",
    logo: null,
  });
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [otpModal, setOtpModal] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);

  const { mutate: register, isPending } = useRegister({
    onSuccess: () =>
      toast({ title: "🎉 Account Created!", description: "Welcome aboard!" }),
    onError: (err: any) =>
      toast({
        title: "Registration Failed",
        description: err?.response?.data?.message || "Something went wrong",
        variant: "destructive",
      }),
  });

  const { mutate: sendOtp, isPending: sendingOtp } = useSendOtp({
    onSuccess: () => {
      toast({
        title: "OTP Sent! 📧",
        description: `Check your inbox: ${form.ownerEmail}`,
      });
      setOtpModal(true);
    },
    onError: (err: any) =>
      toast({
        title: "Failed to send OTP",
        description: err?.response?.data?.message || "Try again",
        variant: "destructive",
      }),
  });

  const set = useCallback(
    (key: keyof FormData) => (val: string) =>
      setForm((prev) => ({ ...prev, [key]: val })),
    [],
  );

  const handleOwnerEmailChange = (val: string) => {
    setForm((prev) => ({ ...prev, ownerEmail: val }));
    if (emailVerified) setEmailVerified(false);
  };

  const handleSendOtp = () => {
    if (
      !form.ownerEmail ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.ownerEmail)
    ) {
      toast({
        title: "Invalid email",
        description: "Enter a valid email first",
        variant: "destructive",
      });
      return;
    }
    sendOtp({ email: form.ownerEmail });
  };

  const handleLogoFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Max size is 5MB",
        variant: "destructive",
      });
      return;
    }
    setForm((prev) => ({ ...prev, logo: file }));
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleLogoFile(file);
  };

  const validateStep = () => {
    if (step === 1) {
      if (
        !form.ownerFullName ||
        !form.ownerEmail ||
        !form.ownerPhone ||
        !form.ownerAddress
      ) {
        toast({
          title: "Missing fields",
          description: "Please fill all owner details",
          variant: "destructive",
        });
        return false;
      }
      if (!emailVerified) {
        toast({
          title: "Email not verified",
          description: "Verify your email with OTP to continue",
          variant: "destructive",
        });
        return false;
      }
    }
    if (step === 2) {
      if (
        !form.name ||
        !form.restaurantEmail ||
        !form.restaurantPhone ||
        !form.restaurantAddress
      ) {
        toast({
          title: "Missing fields",
          description: "Please fill all restaurant details",
          variant: "destructive",
        });
        return false;
      }
    }
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "Passwords must match",
        variant: "destructive",
      });
      return;
    }
    if (form.password.length < 8) {
      toast({
        title: "Weak password",
        description: "Minimum 8 characters required",
        variant: "destructive",
      });
      return;
    }
    const payload = new FormData();
    payload.append("ownerFullName", form.ownerFullName);
    payload.append("ownerEmail", form.ownerEmail);
    payload.append("ownerPhone", form.ownerPhone);
    payload.append("ownerAddress", form.ownerAddress);
    payload.append("restaurantName", form.name);
    payload.append("restaurantEmail", form.restaurantEmail);
    payload.append("restaurantPhone", form.restaurantPhone);
    payload.append("restaurantAddress", form.restaurantAddress);
    payload.append("password", form.password);
    if (form.logo) payload.append("logo", form.logo);
    register(payload);
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#fdf6f0] flex items-center justify-center p-4">
      {otpModal && (
        <OtpModal
          email={form.ownerEmail}
          onClose={() => setOtpModal(false)}
          onVerified={() => {
            setEmailVerified(true);
            setOtpModal(false);
          }}
        />
      )}

      <div className="w-full max-w-2xl bg-white shadow-md overflow-hidden">
        {/* Header */}
        <div className="px-8 pt-8 pb-6 text-center border-b border-gray-100">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md"
            style={{
              background:
                "linear-gradient(135deg, hsl(var(--brand-primary)), hsl(var(--brand-secondary)))",
            }}
          >
            <UtensilsCrossed className="w-6 h-6 text-white" />
          </div>
          <h1
            className="text-2xl font-satisfy"
            style={{ color: "hsl(var(--brand-primary))" }}
          >
            Register Your Restaurant
          </h1>
          <p className="text-sm text-gray-400 font-poppins mt-1">
            Join thousands of restaurants growing with us
          </p>
        </div>

        {/* Step bar */}
        <div className="px-8 py-5 bg-orange-50/40 border-b border-gray-100">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 right-0 top-5 h-0.5 bg-gray-200 mx-8" />
            <div
              className="absolute left-8 top-5 h-0.5 transition-all duration-500"
              style={{
                width: `calc(${((step - 1) / (STEPS.length - 1)) * 100}%)`,
                background: "hsl(var(--brand-primary))",
              }}
            />
            {STEPS.map((s) => (
              <div
                key={s.id}
                className="flex flex-col items-center gap-1.5 z-10"
              >
                <button
                  type="button"
                  onClick={() => step > s.id && setStep(s.id)}
                  className={`w-11 h-11 rounded-full flex items-center justify-center
                    transition-all duration-300 border-2 shadow-sm
                    ${
                      step === s.id
                        ? "border-transparent text-white shadow-md scale-110"
                        : step > s.id
                          ? "border-transparent text-white"
                          : "bg-white border-gray-200 text-gray-400"
                    }`}
                  style={
                    step >= s.id
                      ? {
                          background:
                            "linear-gradient(135deg, hsl(var(--brand-primary)), hsl(var(--brand-secondary)))",
                        }
                      : {}
                  }
                >
                  {step > s.id ? (
                    <Check className="w-4 h-4" strokeWidth={3} />
                  ) : (
                    <s.Icon className="w-4 h-4" />
                  )}
                </button>
                <span
                  className={`text-xs font-poppins font-semibold ${
                    step >= s.id ? "text-orange-500" : "text-gray-400"
                  }`}
                >
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="px-8 py-6">
            {/* ── STEP 1 ── */}
            {step === 1 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">👤</span>
                  <h2
                    className="text-lg font-satisfy"
                    style={{ color: "hsl(var(--brand-dark))" }}
                  >
                    Owner Details
                  </h2>
                </div>

                <Field
                  label="Full Name"
                  id="ownerFullName"
                  value={form.ownerFullName}
                  onChange={set("ownerFullName")}
                  placeholder="John Doe"
                />

                {/* Email + OTP */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="ownerEmail"
                    className="text-sm font-medium text-gray-700 font-poppins"
                  >
                    Email{" "}
                    <span style={{ color: "hsl(var(--brand-primary))" }}>
                      *
                    </span>
                  </Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        id="ownerEmail"
                        type="email"
                        value={form.ownerEmail}
                        required
                        onChange={(e) => handleOwnerEmailChange(e.target.value)}
                        placeholder="johndoe@gmail.com"
                        // className={`h-11 font-poppins text-sm rounded-none
                        //   focus-visible:ring-0 focus-visible:border-orange-400
                        //   ${emailVerified ? "border-green-400 bg-green-50 pr-9" : ""}`}
                      />
                      {emailVerified && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 font-bold">
                          ✓
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={emailVerified ? undefined : handleSendOtp}
                      disabled={sendingOtp || !form.ownerEmail}
                      className={`h-11 px-4 text-sm rounded-md font-poppins font-semibold whitespace-nowrap
                        flex-shrink-0 flex items-center gap-1.5 transition-all
                        disabled:opacity-50 disabled:cursor-not-allowed
                        ${
                          emailVerified
                            ? "bg-green-50 border border-green-300 text-green-600 cursor-default"
                            : "text-white"
                        }`}
                      style={
                        !emailVerified
                          ? {
                              background:
                                "linear-gradient(135deg, hsl(var(--brand-primary)), hsl(var(--brand-secondary)))",
                            }
                          : {}
                      }
                    >
                      {sendingOtp ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Sending…
                        </>
                      ) : emailVerified ? (
                        <>✓ Verified</>
                      ) : (
                        <>📨 Send OTP</>
                      )}
                    </button>
                  </div>
                  <p
                    className={`text-xs font-poppins ${emailVerified ? "text-green-500" : "text-gray-400"}`}
                  >
                    {emailVerified
                      ? "✓ Email verified — you're good to go!"
                      : 'Click "Send OTP" to verify your email address'}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field
                    label="Phone"
                    id="ownerPhone"
                    type="tel"
                    value={form.ownerPhone}
                    onChange={set("ownerPhone")}
                    placeholder="9876543210"
                  />
                  <Field
                    label="Address"
                    id="ownerAddress"
                    value={form.ownerAddress}
                    onChange={set("ownerAddress")}
                    placeholder="403 D Ram Apartment, Kalyan"
                  />
                </div>
              </div>
            )}

            {/* ── STEP 2 ── */}
            {step === 2 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">🍽️</span>
                  <h2
                    className="text-lg font-satisfy"
                    style={{ color: "hsl(var(--brand-dark))" }}
                  >
                    Restaurant Details
                  </h2>
                </div>

                <Field
                  label="Restaurant Name"
                  id="name"
                  value={form.name}
                  onChange={set("name")}
                  placeholder="Spice Garden"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field
                    label="Restaurant Email"
                    id="restaurantEmail"
                    type="email"
                    value={form.restaurantEmail}
                    onChange={set("restaurantEmail")}
                    placeholder="info@spicegarden.com"
                  />
                  <Field
                    label="Restaurant Phone"
                    id="restaurantPhone"
                    type="tel"
                    value={form.restaurantPhone}
                    onChange={set("restaurantPhone")}
                    placeholder="0120-4567890"
                  />
                </div>

                <Field
                  label="Restaurant Address"
                  id="restaurantAddress"
                  value={form.restaurantAddress}
                  onChange={set("restaurantAddress")}
                  placeholder="Shop 12, Sector 5, Vaishali"
                />

                {/* Logo Upload */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-gray-700 font-poppins">
                    Restaurant Logo{" "}
                    <span className="text-gray-400 font-normal">
                      (optional)
                    </span>
                  </Label>
                  <div
                    onClick={() => fileRef.current?.click()}
                    onDrop={handleDrop}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOver(true);
                    }}
                    onDragLeave={() => setDragOver(false)}
                    className={`border-2 border-dashed cursor-pointer transition-all
                      ${
                        dragOver
                          ? "border-orange-400 bg-orange-50"
                          : logoPreview
                            ? "border-orange-300"
                            : "border-gray-200 hover:border-orange-300 hover:bg-orange-50/40"
                      }`}
                  >
                    {logoPreview ? (
                      <div className="flex items-center gap-4 p-4">
                        <div className="relative w-16 h-16 overflow-hidden border border-orange-100 flex-shrink-0">
                          <Image
                            src={logoPreview}
                            alt="Logo"
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-poppins font-medium text-gray-700 truncate">
                            {form.logo?.name}
                          </p>
                          <p className="text-xs text-gray-400 font-poppins">
                            {form.logo
                              ? (form.logo.size / 1024).toFixed(1) + " KB"
                              : ""}
                          </p>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setLogoPreview(null);
                              setForm((p) => ({ ...p, logo: null }));
                              if (fileRef.current) fileRef.current.value = "";
                            }}
                            className="mt-1 text-xs text-red-400 hover:text-red-600 font-poppins underline"
                          >
                            Remove
                          </button>
                        </div>
                        <span className="text-2xl">✅</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center py-8 text-center">
                        <span className="text-3xl mb-2">🖼️</span>
                        <p className="text-sm font-poppins text-gray-500">
                          Drop logo here or{" "}
                          <span
                            className="underline"
                            style={{ color: "hsl(var(--brand-primary))" }}
                          >
                            browse
                          </span>
                        </p>
                        <p className="text-xs text-gray-400 font-poppins mt-1">
                          PNG, JPG, WebP — max 5MB
                        </p>
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleLogoFile(f);
                    }}
                  />
                </div>
              </div>
            )}

            {/* ── STEP 3 ── */}
            {step === 3 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">🔒</span>
                  <h2
                    className="text-lg font-satisfy"
                    style={{ color: "hsl(var(--brand-dark))" }}
                  >
                    Set Password
                  </h2>
                </div>

                <Field
                  label="Password"
                  id="password"
                  type="password"
                  value={form.password}
                  onChange={set("password")}
                  placeholder="Min. 8 characters"
                />
                <Field
                  label="Confirm Password"
                  id="confirmPassword"
                  type="password"
                  value={form.confirmPassword}
                  onChange={set("confirmPassword")}
                  placeholder="Re-enter password"
                />

                {/* Password strength */}
                {form.password && (
                  <div className="space-y-1">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((i) => {
                        const s =
                          (form.password.length >= 8 ? 1 : 0) +
                          (/[A-Z]/.test(form.password) ? 1 : 0) +
                          (/[0-9]/.test(form.password) ? 1 : 0) +
                          (/[^A-Za-z0-9]/.test(form.password) ? 1 : 0);
                        return (
                          <div
                            key={i}
                            className={`h-1.5 flex-1 transition-all duration-300 ${
                              i <= s
                                ? s <= 1
                                  ? "bg-red-400"
                                  : s <= 2
                                    ? "bg-yellow-400"
                                    : s <= 3
                                      ? "bg-blue-400"
                                      : "bg-green-400"
                                : "bg-gray-200"
                            }`}
                          />
                        );
                      })}
                    </div>
                    <p className="text-xs font-poppins text-gray-400">
                      Use uppercase, numbers & symbols for stronger password
                    </p>
                  </div>
                )}

                {form.confirmPassword && (
                  <p
                    className={`text-xs font-poppins ${form.password === form.confirmPassword ? "text-green-500" : "text-red-400"}`}
                  >
                    {form.password === form.confirmPassword
                      ? "✓ Passwords match"
                      : "✗ Passwords do not match"}
                  </p>
                )}

                {/* Summary */}
                <div className="border border-orange-100 bg-orange-50/50 p-4 space-y-2">
                  <p className="text-xs font-poppins font-semibold text-gray-700 mb-2">
                    📋 Summary
                  </p>
                  {[
                    { label: "Owner", value: form.ownerFullName },
                    { label: "Email", value: `${form.ownerEmail} ✓` },
                    { label: "Restaurant", value: form.name },
                    {
                      label: "Logo",
                      value: form.logo
                        ? "✅ " + form.logo.name
                        : "Not uploaded",
                    },
                  ].map(({ label, value }) => (
                    <div
                      key={label}
                      className="flex justify-between text-xs font-poppins"
                    >
                      <span className="text-gray-500">{label}</span>
                      <span
                        className="font-medium truncate max-w-[60%] text-right"
                        style={{ color: "hsl(var(--brand-dark))" }}
                      >
                        {value || "—"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer buttons */}
          <div className="px-8 pb-8 flex items-center gap-3">
            {step > 1 ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep((s) => s - 1)}
                className="flex-1 h-11 font-poppins rounded-none border-gray-200
                  hover:border-orange-300 hover:text-orange-500"
              >
                ← Back
              </Button>
            ) : (
              <div className="flex-1" />
            )}

            {step < 3 ? (
              <Button
                type="button"
                onClick={() => validateStep() && setStep((s) => s + 1)}
                className="flex-1 rounded-lg h-11 font-poppins font-semibold text-white hover:opacity-90"
                style={{
                  background:
                    "linear-gradient(135deg, hsl(var(--brand-primary)), hsl(var(--brand-secondary)))",
                }}
              >
                Next →
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isPending || form.password !== form.confirmPassword}
                className="flex-1 h-11 font-poppins font-semibold text-white rounded-lg disabled:opacity-50 hover:opacity-90"
                style={{
                  background:
                    "linear-gradient(135deg, hsl(var(--brand-primary)), hsl(var(--brand-secondary)))",
                }}
              >
                {isPending ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating…
                  </span>
                ) : (
                  "🚀 Create Account"
                )}
              </Button>
            )}
          </div>
        </form>

        <div className="text-center pb-6">
          <p className="text-sm font-poppins text-gray-500">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium hover:underline"
              style={{ color: "hsl(var(--brand-primary))" }}
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>

      <Toaster />
    </div>
  );
}
