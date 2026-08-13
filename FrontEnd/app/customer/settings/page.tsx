"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { Switch } from "@/components/ui/switch"
import { Loader2, Save } from "lucide-react"
import { useAuth } from "@/components/providers/auth-provider"
import { useUpdateUserProfile } from "@/src/hooks/useUser"

export default function SettingsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const { mutateAsync: updateProfile, isPending: isSaving } = useUpdateUserProfile()

  const [profileForm, setProfileForm] = useState({
    name: "", email: "", phone: "", address: "",
  })

  const [notifications, setNotifications] = useState({
    orderUpdates  : true,
    promotions    : false,
    newsletter    : false,
  })

  useEffect(() => {
    if (user) {
      setProfileForm({
        name   : (user as any).name    || "",
        email  : (user as any).email   || "",
        phone  : (user as any).phone   || "",
        address: (user as any).address || "",
      })
    }
  }, [user])

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setProfileForm((p) => ({ ...p, [name]: value }))
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await updateProfile(profileForm)
      toast({ title: "Profile updated", description: "Your settings have been saved." })
    } catch (err: any) {
      toast({
        title      : "Error",
        description: err?.response?.data?.message || "Failed to save",
        variant    : "destructive",
      })
    }
  }

  const handleNotificationToggle = (key: keyof typeof notifications) => {
    setNotifications((p) => ({ ...p, [key]: !p[key] }))
    toast({ title: "Preference saved", duration: 1500 })
  }

  const GRAD = "bg-gradient-to-r from-brand-primary to-brand-secondary hover:from-brand-primary/90 hover:to-brand-secondary/90 text-white"

  return (
    <div className="p-4 bg-gradient-to-br from-orange-50 to-pink-50 min-h-full">
          <div className="mb-6">
            <h1 className="text-4xl font-satisfy bg-gradient-to-r from-brand-primary to-purple-600 bg-clip-text text-transparent mb-1">
              Settings
            </h1>
            <p className="text-gray-500 text-sm font-poppins">Manage your account preferences</p>
          </div>

          <Tabs defaultValue="profile">
            <TabsList className="mb-4 bg-gray-100 p-1 rounded-full">
              {["profile", "notifications"].map((tab) => (
                <TabsTrigger
                  key={tab}
                  value={tab}
                  className="rounded-full capitalize data-[state=active]:bg-white data-[state=active]:text-brand-primary"
                >
                  {tab}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* ── Profile Tab ─────────────────────────── */}
            <TabsContent value="profile" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-poppins">Personal Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSaveProfile} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" name="name" value={profileForm.name} onChange={handleProfileChange} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" name="email" type="email" value={profileForm.email} onChange={handleProfileChange} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input id="phone" name="phone" value={profileForm.phone} onChange={handleProfileChange} placeholder="+91 XXXXX XXXXX" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="address">Delivery Address</Label>
                        <Input id="address" name="address" value={profileForm.address} onChange={handleProfileChange} placeholder="Your address" />
                      </div>
                    </div>
                    <div className="flex justify-end pt-2">
                      <Button type="submit" disabled={isSaving} className={GRAD}>
                        {isSaving
                          ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving…</>
                          : <><Save className="mr-2 h-4 w-4" />Save Changes</>}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-poppins">Account</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between py-2 border-b">
                    <div>
                      <p className="font-medium text-sm">Joined</p>
                      <p className="text-xs text-gray-500">
                        {(user as any)?.createdAt
                          ? new Date((user as any).createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
                          : "—"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="font-medium text-sm">Account Status</p>
                      <p className="text-xs text-gray-500">Your account is active</p>
                    </div>
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">Active</span>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ── Notifications Tab ───────────────────── */}
            <TabsContent value="notifications" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-poppins">Notification Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  {[
                    { key: "orderUpdates", label: "Order Updates",   desc: "Get notified when your order status changes" },
                    { key: "promotions",   label: "Promotions",      desc: "Receive discount codes and special offers" },
                    { key: "newsletter",   label: "Newsletter",      desc: "Weekly updates about new dishes and events" },
                  ].map(({ key, label, desc }) => (
                    <div key={key} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{label}</p>
                        <p className="text-xs text-gray-500">{desc}</p>
                      </div>
                      <Switch
                        checked={notifications[key as keyof typeof notifications]}
                        onCheckedChange={() => handleNotificationToggle(key as keyof typeof notifications)}
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
    </div>
  )
}
