"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Input }   from "@/components/ui/input"
import { Label }   from "@/components/ui/label"
import { Button }  from "@/components/ui/button"
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/components/ui/use-toast"
import { useResetPassword } from "@/src/hooks/useAuth"
import { Eye, EyeOff, Loader2 } from "lucide-react"

export default function ResetPasswordPage() {
  const params   = useParams()
  const router   = useRouter()
  const { toast } = useToast()
  const token    = params.token as string

  const [newPassword,     setNewPassword]     = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showNew,         setShowNew]         = useState(false)
  const [showConfirm,     setShowConfirm]     = useState(false)

  const { mutate: resetPassword, isPending } = useResetPassword({
    onSuccess: () => {
      toast({
        title      : "✅ Password Reset",
        description: "Password changed successfully. Redirecting to login…",
      })
      setTimeout(() => router.push("/login"), 2000)
    },
    onError: (err: any) =>
      toast({
        title      : "❌ Failed",
        description: err?.response?.data?.message || "Reset link is invalid or expired.",
        variant    : "destructive",
      }),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPassword || !confirmPassword) {
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
    resetPassword({ token, password: newPassword })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#fff5eb] to-[#ffe9d6] p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 space-y-6">

        <div className="text-center">
          <div className="text-4xl mb-3">🔐</div>
          <h2 className="text-3xl font-satisfy text-brand-primary">Reset Password</h2>
          <p className="text-sm text-gray-500 mt-1">Enter your new password below</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showNew ? "text" : "password"}
                placeholder="At least 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <button type="button" onClick={() => setShowNew(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirm ? "text" : "password"}
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button type="button" onClick={() => setShowConfirm(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isPending}
            className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white"
          >
            {isPending
              ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Resetting…</>
              : "Reset Password"}
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500">
          <a href="/login" className="text-brand-primary hover:underline">Back to Login</a>
        </p>
      </div>
      <Toaster />
    </div>
  )
}
