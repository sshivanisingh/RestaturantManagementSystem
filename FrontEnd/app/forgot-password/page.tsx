
"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import Link from "next/link"
import { useForgotPassword, useResetPassword } from "@/src/hooks/useAuth"
import { Loader2 } from "lucide-react"

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<"email" | "reset">("email")
  const [email, setEmail] = useState("")
  const [token, setToken] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const { toast } = useToast()

  const { mutateAsync: forgotPassword, isPending: isForgetting } = useForgotPassword({
    onSuccess: () => {
      toast({
        title: "✅ Reset Link Sent",
        description: "Check your email for the reset link. It expires in 30 minutes.",
      })
      setStep("reset")
      setEmail("")
    },
    onError: (err: any) => {
      toast({
        title: "❌ Error",
        description: err?.response?.data?.message || "Failed to send reset link",
        variant: "destructive",
      })
    },
  })

  const { mutateAsync: resetPassword, isPending: isResetting } = useResetPassword({
    onSuccess: () => {
      toast({
        title: "✅ Password Reset",
        description: "Your password has been successfully reset. Login with your new password.",
      })
      setToken("")
      setNewPassword("")
      setConfirmPassword("")
      window.location.href = "/login"
    },
    onError: (err: any) => {
      toast({
        title: "❌ Error",
        description: err?.response?.data?.message || "Failed to reset password",
        variant: "destructive",
      })
    },
  })

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      toast({ title: "Error", description: "Please enter your email", variant: "destructive" })
      return
    }
    await forgotPassword({ email })
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token || !newPassword || !confirmPassword) {
      toast({ title: "Error", description: "Please fill in all fields", variant: "destructive" })
      return
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "Error", description: "Passwords don't match", variant: "destructive" })
      return
    }
    if (newPassword.length < 6) {
      toast({ title: "Error", description: "Password must be at least 6 characters", variant: "destructive" })
      return
    }
    await resetPassword({ token, password: newPassword })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#fff5eb] to-[#ffe9d6] p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        {step === "email" ? (
          <>
            <h2 className="text-3xl font-satisfy text-brand-primary mb-2 text-center">Forgot Password?</h2>
            <p className="text-sm text-gray-600 text-center mb-6">
              Enter your email address and we'll send you a link to reset your password.
            </p>

            <form onSubmit={handleForgotPassword} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full bg-brand-primary hover:bg-brand-primary/90" disabled={isForgetting}>
                {isForgetting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Sending...</> : "Send Reset Link"}
              </Button>
            </form>

            <p className="text-sm text-center text-gray-600 mt-4">
              <Link href="/login" className="text-brand-primary hover:underline">
                Back to Login
              </Link>
            </p>
          </>
        ) : (
          <>
            <h2 className="text-3xl font-satisfy text-brand-primary mb-2 text-center">Reset Password</h2>
            <p className="text-sm text-gray-600 text-center mb-6">
              Enter the reset token from your email and create a new password.
            </p>

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="token">Reset Token</Label>
                <Input
                  id="token"
                  type="text"
                  placeholder="Paste token from email"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="At least 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full bg-brand-primary hover:bg-brand-primary/90" disabled={isResetting}>
                {isResetting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Resetting...</> : "Reset Password"}
              </Button>
            </form>

            <p className="text-sm text-center text-gray-600 mt-4">
              <button
                type="button"
                onClick={() => {
                  setStep("email")
                  setToken("")
                  setNewPassword("")
                  setConfirmPassword("")
                }}
                className="text-brand-primary hover:underline"
              >
                Send new reset link
              </button>
            </p>
          </>
        )}
      </div>
      <Toaster />
    </div>
  )
}
