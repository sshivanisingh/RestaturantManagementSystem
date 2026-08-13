"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/components/providers/auth-provider"
import { useState, useEffect, useRef } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera, Edit, LogOut, Save, Loader2, Package, MapPin, CreditCard } from "lucide-react"
import Link from "next/link"
import Advancefeaturemodel from "@/components/AdvancedFeatureModel/advancefeaturemodel"
import { useUpdateUserProfile, useUserLogout, useGetMyOrders } from "@/src/hooks/useUser"

export default function ProfilePage() {
  const { user } = useAuth()
  const { mutateAsync: updateProfile, isPending: isUpdating } = useUpdateUserProfile()
  const { mutateAsync: logout } = useUserLogout()
  const { data: ordersData, isLoading: ordersLoading } = useGetMyOrders()
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const[openModel,setOpenModel]= useState(false)
  const [formData, setFormData] = useState({
    name: (user as any)?.name || "",
    email: (user as any)?.email || "",
    phone: (user as any)?.phone || "",
    address: (user as any)?.address || "",
  })
  const [avatarUrl, setAvatarUrl] = useState((user as any)?.avatar || "")

  // Update form data when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: (user as any).name || "",
        email: (user as any).email || "",
        phone: (user as any).phone || "",
        address: (user as any).address || "",
      })
    }
  }, [user])

  // Improve the profile page editability
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await updateProfile(formData)
      setIsEditing(false)
      toast({
        title: "✅ Profile updated",
        description: "Your profile information has been updated successfully.",
      })
    } catch (error: any) {
      toast({
        title: "❌ Error",
        description: error?.response?.data?.message || "Failed to update profile",
        variant: "destructive",
      })
    }
  }

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file
    if (!file.type.startsWith("image/")) {
      toast({ title: "Error", description: "Please select an image file", variant: "destructive" })
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Error", description: "Image size must be less than 5MB", variant: "destructive" })
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setAvatarUrl(reader.result as string)
    }
    reader.readAsDataURL(file)

    // TODO: Upload to server when API is ready
    toast({
      title: "✅ Photo selected",
      description: "Photo updated (will be saved with profile changes)",
    })
  }

  const handleLogout = async () => {
    try {
      await logout()
      window.location.href = "/login"
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to logout",
        variant: "destructive",
      })
    }
  }

  const handleAddPaymentMethod = () => {
    setOpenModel(true)
  }

  const handleCallNow = () => {
    window.open("tel:9027130674", "_self")
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Loading profile...</h2>
        </div>
      </div>
    )
  }

  return (
    <>
     <Advancefeaturemodel openModel={openModel} setOpenModel={setOpenModel} handleCallNow={handleCallNow}/>
            <div className="container mx-auto px-4 py-8">
              <h1 className="text-3xl font-satisfy text-brand-primary mb-6">My Profile</h1>
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="bg-brand-primary p-8 text-white relative">
                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    <div className="relative">
                      <Avatar className="h-24 w-24 border-4 border-white">
                        <AvatarImage src={avatarUrl} />
                        <AvatarFallback className="bg-brand-secondary text-white text-2xl">
                          {(user as any)?.name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="hidden"
                      />
                      <Button
                        variant="secondary"
                        size="icon"
                        className="absolute bottom-0 right-0 rounded-full h-8 w-8 bg-white text-brand-primary hover:bg-gray-100"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Camera className="h-4 w-4" />
                      </Button>
                    </div>
                    <div>
                      <h2 className="text-2xl font-medium">{(user as any)?.name}</h2>
                      <p className="text-white/80">{(user as any)?.email}</p>
                      <p className="text-white/80 mt-1">
                        Member since {(user as any)?.createdAt ? new Date((user as any).createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" }) : "—"}
                      </p>
                    </div>
                  </div>
                </div>
                <Tabs defaultValue="profile" className="p-6">
                  <TabsList className="mb-6">
                    <TabsTrigger value="profile">Profile Information</TabsTrigger>
                    <TabsTrigger value="orders">Order History</TabsTrigger>
                    <TabsTrigger value="addresses">Saved Addresses</TabsTrigger>
                    <TabsTrigger value="payment">Payment Methods</TabsTrigger>
                  </TabsList>
                  <TabsContent value="profile">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-medium">Personal Information</h3>
                      <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)}>
                        {isEditing ? (
                          <>
                            <Edit className="mr-2 h-4 w-4" />
                            Cancel
                          </>
                        ) : (
                          <>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Profile
                          </>
                        )}
                      </Button>
                    </div>
                    {/* Replace the form section with this improved version */}
                    <form onSubmit={handleSubmit}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="name">Full Name</Label>
                          <Input
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className={isEditing ? "border-brand-primary focus:border-brand-primary" : ""}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email Address</Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className={isEditing ? "border-brand-primary focus:border-brand-primary" : ""}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className={isEditing ? "border-brand-primary focus:border-brand-primary" : ""}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="address">Default Address</Label>
                          <Input
                            id="address"
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className={isEditing ? "border-brand-primary focus:border-brand-primary" : ""}
                          />
                        </div>
                      </div>
                      {isEditing && (
                        <div className="mt-6 flex justify-end">
                          <Button
                            type="submit"
                            className="bg-gradient-to-r from-brand-primary to-brand-secondary hover:from-brand-primary/90 hover:to-brand-secondary/90 text-white"
                            disabled={isUpdating}
                          >
                            {isUpdating ? (
                              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
                            ) : (
                              <><Save className="mr-2 h-4 w-4" /> Save Changes</>
                            )}
                          </Button>
                        </div>
                      )}
                    </form>
                    <div className="mt-8 pt-6 border-t">
                      <h3 className="text-xl font-medium mb-4">Account Settings</h3>
                      <div className="space-y-4">
                        <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                          <Link href="/customer/settings/change-password">Change Password</Link>
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-red-500 hover:bg-red-50 hover:text-red-600 bg-transparent"
                          onClick={handleLogout}
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          Sign Out
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="orders">
                    <h3 className="text-xl font-medium mb-6">Order History</h3>
                    {ordersLoading ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-6 w-6 animate-spin text-brand-primary" />
                      </div>
                    ) : !ordersData?.data?.length ? (
                      <div className="text-center py-12">
                        <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 font-poppins">No orders yet</p>
                        <Link href="/" className="text-sm text-brand-primary hover:underline mt-1 inline-block">Browse menu</Link>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {(ordersData.data as any[]).map((order: any) => {
                          const statusColors: Record<string, string> = {
                            delivered  : "bg-green-100 text-green-800",
                            pending    : "bg-yellow-100 text-yellow-800",
                            confirmed  : "bg-blue-100 text-blue-800",
                            preparing  : "bg-orange-100 text-orange-800",
                            cancelled  : "bg-red-100 text-red-800",
                          }
                          const statusClass = statusColors[order.status?.toLowerCase()] ?? "bg-gray-100 text-gray-800"
                          return (
                            <div key={order._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                              <div className="flex flex-col sm:flex-row justify-between mb-3">
                                <div>
                                  <div className="font-medium text-sm">Order #{order._id?.slice(-6).toUpperCase()}</div>
                                  <div className="text-xs text-gray-500 mt-0.5">
                                    {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                  </div>
                                </div>
                                <span className={`mt-2 sm:mt-0 self-start inline-block px-2 py-1 text-xs font-medium rounded-full capitalize ${statusClass}`}>
                                  {order.status}
                                </span>
                              </div>
                              <div className="text-sm text-gray-600 mb-3">
                                {order.items?.length
                                  ? order.items.map((i: any) => i.menuItemId?.name || i.name || "Item").join(", ")
                                  : `${order.items?.length ?? 0} items`}
                              </div>
                              <div className="flex justify-between items-center pt-3 border-t">
                                <div className="font-semibold text-brand-primary">₹{order.totalAmount?.toFixed(2) ?? "—"}</div>
                                <Button variant="outline" size="sm" asChild>
                                  <Link href={`/customer/orders`}>View Details</Link>
                                </Button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </TabsContent>
                  <TabsContent value="addresses">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-medium">Saved Address</h3>
                    </div>
                    {(user as any)?.address ? (
                      <div className="border rounded-lg p-4 relative max-w-md">
                        <div className="absolute top-4 right-4">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsEditing(true)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <MapPin className="h-4 w-4 text-brand-primary" />
                          <span className="font-medium">Default Address</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{(user as any).address}</p>
                        {(user as any).phone && <p className="text-sm text-gray-600">Phone: {(user as any).phone}</p>}
                        <div className="mt-3 pt-3 border-t">
                          <span className="text-xs px-2 py-1 bg-brand-primary/10 text-brand-primary rounded-full">Default</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 font-poppins">No address saved</p>
                        <Button variant="outline" size="sm" className="mt-3" onClick={() => setIsEditing(true)}>
                          Add Address
                        </Button>
                      </div>
                    )}
                  </TabsContent>
                  <TabsContent value="payment">
                    <div className="text-center py-16">
                      <CreditCard className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 font-poppins font-medium">No saved payment methods</p>
                      <p className="text-xs text-gray-400 mt-1">You can pay via Razorpay or Cash on Delivery at checkout</p>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>

      {/* Payment Method Modal */}
      {/* <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-center justify-center">
              <CreditCard className="h-6 w-6 text-brand-primary" />
              Advanced Payment Features
            </DialogTitle>
            <DialogDescription className="text-center pt-2">
              For advanced payment method setup and premium features
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-6 py-4">
            <div className="w-20 h-20 bg-gradient-to-r from-brand-primary to-brand-secondary rounded-full flex items-center justify-center">
              <Phone className="h-10 w-10 text-white" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold text-gray-900">Contact Our Support Team</h3>
              <p className="text-sm text-gray-600 max-w-sm">
                Please contact us for advanced payment features, custom integrations, and premium support.
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 w-full text-center">
              <p className="text-sm text-gray-600 mb-2">Call us at:</p>
              <div className="text-2xl font-bold text-brand-primary mb-3">9027130674</div>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Button
                  onClick={handleCallNow}
                  className="bg-gradient-to-r from-brand-primary to-brand-secondary hover:from-brand-primary/90 hover:to-brand-secondary/90 text-white"
                >
                  <Phone className="mr-2 h-4 w-4" />
                  Call Now
                </Button>
                <Button variant="outline" onClick={() => setIsPaymentModalOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
            <div className="text-xs text-gray-500 text-center">Available Monday - Friday, 9:00 AM - 6:00 PM</div>
          </div>
        </DialogContent>
      </Dialog> */}

    </>
  )
}


