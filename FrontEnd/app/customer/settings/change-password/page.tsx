"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Eye, EyeOff, Loader2, Lock, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useChangeUserPassword } from "@/src/hooks/useUser"

export default function ChangePasswordPage() {
  const router  = useRouter()
  const { toast } = useToast()

  const [form, setForm] = useState({
    currentPassword: "",
    newPassword    : "",
    confirmPassword: "",
  })
  const [show, setShow] = useState({
    current: false, newPass: false, confirm: false,
  })

  const { mutate: changePassword, isPending } = useChangeUserPassword({
    onSuccess: () => {
      toast({ title: "Password changed", description: "Your password has been updated successfully." })
      router.push("/customer/settings")
    },
    onError: (err: any) => {
      toast({
        title      : "Failed",
        description: err?.response?.data?.message || "Something went wrong",
        variant    : "destructive",
      })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (form.newPassword.length < 6) {
      toast({ title: "Too short", description: "New password must be at least 6 characters", variant: "destructive" })
      return
    }
    if (form.newPassword !== form.confirmPassword) {
      toast({ title: "Mismatch", description: "New passwords do not match", variant: "destructive" })
      return
    }
    changePassword({ currentPassword: form.currentPassword, newPassword: form.newPassword })
  }

  const GRAD = "bg-gradient-to-r from-brand-primary to-brand-secondary hover:from-brand-primary/90 hover:to-brand-secondary/90 text-white"

  return (
    <div className="p-4 bg-gradient-to-br from-orange-50 to-pink-50 min-h-full">
          <div className="mb-6 flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/customer/settings"><ArrowLeft className="h-5 w-5" /></Link>
            </Button>
            <div>
              <h1 className="text-3xl font-satisfy bg-gradient-to-r from-brand-primary to-purple-600 bg-clip-text text-transparent">
                Change Password
              </h1>
              <p className="text-sm text-gray-500 font-poppins">Update your account password</p>
            </div>
          </div>

          <Card className="max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base font-poppins">
                <Lock className="h-4 w-4 text-brand-primary" />
                Password Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Current Password */}
                <div className="space-y-1.5">
                  <Label htmlFor="currentPassword" className="font-poppins text-sm">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={show.current ? "text" : "password"}
                      value={form.currentPassword}
                      onChange={(e) => setForm((p) => ({ ...p, currentPassword: e.target.value }))}
                      placeholder="Enter current password"
                      required
                    />
                    <button type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      onClick={() => setShow((p) => ({ ...p, current: !p.current }))}>
                      {show.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div className="space-y-1.5">
                  <Label htmlFor="newPassword" className="font-poppins text-sm">New Password</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={show.newPass ? "text" : "password"}
                      value={form.newPassword}
                      onChange={(e) => setForm((p) => ({ ...p, newPassword: e.target.value }))}
                      placeholder="Min. 6 characters"
                      required
                    />
                    <button type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      onClick={() => setShow((p) => ({ ...p, newPass: !p.newPass }))}>
                      {show.newPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword" className="font-poppins text-sm">Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={show.confirm ? "text" : "password"}
                      value={form.confirmPassword}
                      onChange={(e) => setForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                      placeholder="Re-enter new password"
                      required
                    />
                    <button type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      onClick={() => setShow((p) => ({ ...p, confirm: !p.confirm }))}>
                      {show.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {form.confirmPassword && form.newPassword !== form.confirmPassword && (
                    <p className="text-xs text-red-500 font-poppins">Passwords do not match</p>
                  )}
                </div>

                <Button type="submit" disabled={isPending} className={`w-full ${GRAD}`}>
                  {isPending
                    ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Updating…</>
                    : "Update Password"}
                </Button>
              </form>
            </CardContent>
          </Card>
    </div>
  )
}
