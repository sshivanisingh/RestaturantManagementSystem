"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button }    from "@/components/ui/button"
import { Input }     from "@/components/ui/input"
import { Label }     from "@/components/ui/label"
import { Toaster }   from "@/components/ui/toaster"
import { useToast }  from "@/components/ui/use-toast"
import { useLoginDeliveryBoy } from "@/src/hooks/usedeliveryboy"
import { Eye, EyeOff, Loader2 } from "lucide-react"

const saveDeliveryBoySession = (data: {
  deliveryBoy: any; accessToken: string; refreshToken: string
}) => {
  localStorage.setItem("db_accessToken",  data.accessToken)
  localStorage.setItem("db_refreshToken", data.refreshToken)
  localStorage.setItem("db_user",         JSON.stringify(data.deliveryBoy))
}

export default function DeliveryBoyLoginPage() {
  const router    = useRouter()
  const { toast } = useToast()

  const [email,        setEmail]        = useState("")
  const [password,     setPassword]     = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const { mutate: login, isPending } = useLoginDeliveryBoy({
    onSuccess: (res) => {
      saveDeliveryBoySession(res.data)
      toast({ title: "Welcome! 🛵", description: `Hey ${res.data.deliveryBoy.name}!` })
      router.push("/deleveryboy/dashboard")
    },
    onError: (err: any) =>
      toast({
        title      : "Login Failed",
        description: err?.response?.data?.message || "Email ya password galat hai",
        variant    : "destructive",
      }),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      toast({ title: "Fields missing", variant: "destructive" })
      return
    }
    login({ email, password })
  }

  return (
    <div className="min-h-screen bg-[#fdf6f0] flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white shadow-md p-8 space-y-6">

        {/* Icon + Title */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-14 h-14 rounded-full flex items-center justify-center shadow"
            style={{ background: "hsl(var(--brand-primary))" }}>
            <span className="text-2xl">🛵</span>
          </div>
          <h1 className="text-xl font-semibold font-poppins text-gray-800">Delivery Portal</h1>
          <p className="text-sm font-poppins text-gray-400">Sign in to start accepting orders</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          <div className="space-y-1.5">
            <Label htmlFor="db-email" className="text-sm font-poppins text-gray-600">
              Email address
            </Label>
            <Input
              id="db-email" type="email" value={email} required
              onChange={(e) => setEmail(e.target.value)}
              placeholder="delivery@example.com"
              
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="db-password" className="text-sm font-poppins text-gray-600">
              Password
            </Label>
            <div className="relative">
              <Input
                id="db-password" required
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
               
              />
              <button type="button" onClick={() => setShowPassword((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2
                  text-gray-400 hover:text-gray-600 transition-colors">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button type="submit" disabled={isPending || !email || !password}
            className="w-full rounded-md h-11 font-poppins font-semibold text-white disabled:opacity-50"
            style={{ background: "hsl(var(--brand-primary))" }}>
            {isPending
              ? <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />Signing in…</span>
              : "Sign in"}
          </Button>
        </form>

        <p className="text-center text-xs font-poppins text-gray-400">
          Restaurant owner?{" "}
          <a href="/login" className="hover:underline"
            style={{ color: "hsl(var(--brand-primary))" }}>
            Login here
          </a>
        </p>
      </div>

      <Toaster />
    </div>
  )
}