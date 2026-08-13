"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useLogin, useForgotPassword } from "@/src/hooks";

// ─── Forgot Password Modal ────────────────────────────────────────────────────
function ForgotPasswordModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const { mutate: forgotPassword, isPending } = useForgotPassword({
    onSuccess: () => {
      setSent(true);
      toast({
        title: "Reset link sent! 📧",
        description: `Check your inbox: ${email}`,
      });
    },
    onError: (err: any) =>
      toast({
        title: "Failed to send reset link",
        description:
          err?.response?.data?.message ||
          "Unable to connect to server. Please try again.",
        variant: "destructive",
      }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({
        title: "Invalid email",
        description: "Enter a valid email address",
        variant: "destructive",
      });
      return;
    }
    forgotPassword({ email });
  };

  const handleOpenChange = (val: boolean) => {
    if (!val) {
      onClose();
      setTimeout(() => {
        setEmail("");
        setSent(false);
      }, 300);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md rounded-none p-0 overflow-hidden gap-0">
        <div className="px-7 pt-6 pb-7">
          {!sent ? (
            <>
              <DialogHeader className="text-center items-center mb-5">
                <div className="text-4xl mb-2">🔐</div>
                <DialogTitle
                  className="text-xl font-satisfy"
                  style={{ color: "hsl(var(--brand-primary))" }}
                >
                  Forgot Password?
                </DialogTitle>
                <DialogDescription className="text-xs font-poppins text-gray-400">
                  Enter your owner email — we'll send a reset link
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="forgot-email"
                    className="text-sm font-medium font-poppins text-gray-700"
                  >
                    Owner Email{" "}
                    <span style={{ color: "hsl(var(--brand-primary))" }}>
                      *
                    </span>
                  </Label>
                  <Input
                    id="forgot-email"
                    type="email"
                    value={email}
                    required
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="rahul@gmail.com"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isPending || !email}
                  className="w-full h-11 font-poppins font-semibold text-white rounded-md"
                  style={{ background: "hsl(var(--brand-primary))" }}
                >
                  {isPending ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending…
                    </span>
                  ) : (
                    "Send Reset Link"
                  )}
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center space-y-4 py-2">
              <div className="text-5xl">📧</div>
              <div>
                <h3
                  className="text-lg font-satisfy"
                  style={{ color: "hsl(var(--brand-primary))" }}
                >
                  Check Your Inbox!
                </h3>
                <p className="text-xs font-poppins text-gray-500 mt-1">
                  Reset link sent to
                </p>
                <p
                  className="text-sm font-poppins font-semibold mt-0.5"
                  style={{ color: "hsl(var(--brand-dark))" }}
                >
                  {email}
                </p>
                <p className="text-xs font-poppins text-gray-400 mt-2">
                  Link expires in <strong>15 minutes</strong>
                </p>
              </div>
              <Button
                onClick={onClose}
                className="w-full h-10 font-poppins text-white rounded-none"
                style={{ background: "hsl(var(--brand-primary))" }}
              >
                Back to Login
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Login Page ──────────────────────────────────────────────────────────
function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [forgotModal, setForgotModal] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  const { mutate: login, isPending: isLoading } = useLogin({
    onSuccess: (data) => {
      setRedirecting(true);
      window.dispatchEvent(new Event("storage"));
      const role = (data?.data as any)?.role;
      const redirectTo = searchParams.get("redirect");
      setTimeout(() => {
        if (redirectTo) router.push(decodeURIComponent(redirectTo));
        else if (role === "customer") router.push("/customer/dashboard");
        else router.push("/admin");
      }, 300);
    },
    onError: (err: any) =>
      toast({
        title: "Login Failed",
        description:
          err?.response?.data?.message || "Invalid email or password",
        variant: "destructive",
      }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "Missing fields",
        description: "Enter email and password",
        variant: "destructive",
      });
      return;
    }
    login({ email, password });
  };

  // Full-screen loader while navigating to dashboard
  if (redirecting) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-orange-50 via-white to-pink-50">
        {/* Outer glow ring */}
        <div className="relative flex items-center justify-center mb-8">
          <span
            className="absolute inline-flex h-28 w-28 rounded-full opacity-20 animate-ping"
            style={{ background: "hsl(var(--brand-primary))" }}
          />
          <span
            className="absolute inline-flex h-20 w-20 rounded-full opacity-30 animate-ping [animation-delay:0.3s]"
            style={{ background: "hsl(var(--brand-secondary))" }}
          />
          <div
            className="relative w-20 h-20 rounded-full flex items-center justify-center shadow-2xl"
            style={{
              background:
                "linear-gradient(135deg, hsl(var(--brand-primary)), hsl(var(--brand-secondary)))",
            }}
          >
            <span className="text-4xl">🍽️</span>
          </div>
        </div>

        {/* Text */}
        <h2 className="text-2xl font-satisfy bg-gradient-to-r from-brand-primary to-purple-600 bg-clip-text text-transparent mb-2">
          Welcome Back!
        </h2>
        <p className="text-sm font-poppins text-gray-400 mb-8">
          Setting up your dashboard…
        </p>

        {/* Animated dots */}
        <div className="flex items-center gap-2">
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className="w-2.5 h-2.5 rounded-full animate-bounce"
              style={{
                background: "hsl(var(--brand-primary))",
                animationDelay: `${i * 0.15}s`,
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdf6f0] flex items-center justify-center p-4">
      <ForgotPasswordModal
        open={forgotModal}
        onClose={() => setForgotModal(false)}
      />

      <div className="w-full max-w-sm bg-white shadow-md p-8 space-y-6">
        {/* Icon + Title */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-16 h-16 flex items-center justify-center">
            <img
              src="/logo.png"
              alt="BiteNest"
              className="h-14 w-auto object-contain"
            />
          </div>
          <h1 className="text-xl font-semibold font-poppins text-gray-800">
            Sign in
          </h1>
          <p className="text-sm font-poppins text-gray-400">
            Sign in to your restaurant dashboard
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label
              htmlFor="email"
              className="text-sm font-poppins text-gray-600"
            >
              Email address
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label
                htmlFor="password"
                className="text-sm font-poppins text-gray-600"
              >
                Password
              </Label>
              <button
                type="button"
                onClick={() => setForgotModal(true)}
                className="text-xs font-poppins hover:underline"
                style={{ color: "hsl(var(--brand-primary))" }}
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Input
                id="password"
                required
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2
                  text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading || !email || !password}
            className="w-full h-11 font-poppins font-semibold text-white rounded-md disabled:opacity-50"
            style={{ background: "hsl(var(--brand-primary))" }}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Signing in…
              </span>
            ) : (
              "Sign in"
            )}
          </Button>
        </form>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-100" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-3 text-gray-400 font-poppins">
              or continue with
            </span>
          </div>
        </div>

        {/* Social */}
        {/* <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" type="button"
            className="h-11 font-poppins text-sm rounded-none border-gray-200
              hover:border-orange-300 hover:text-orange-500 transition-all">
            <span className="mr-2">🔵</span> Google
          </Button>
          <Button variant="outline" type="button"
            className="h-11 font-poppins text-sm rounded-none border-gray-200
              hover:border-orange-300 hover:text-orange-500 transition-all">
            <span className="mr-2">🔷</span> Facebook
          </Button>
        </div> */}

        {/* Links */}
        <div className="space-y-2 text-center">
          <p className="text-xs font-poppins text-gray-400">
            Delivery partner?{" "}
            <Link
              href="/deliveryboy/login"
              className="hover:underline"
              style={{ color: "hsl(var(--brand-primary))" }}
            >
              Delivery Portal
            </Link>
          </p>
          <p className="text-sm font-poppins text-gray-500">
            Don't have an account?{" "}
            <Link
              href="/register"
              className="font-medium hover:underline"
              style={{ color: "hsl(var(--brand-primary))" }}
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>

      <Toaster />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
