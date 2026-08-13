"use client"

import type React from "react"
import { SidebarNav } from "@/components/sidebar-nav"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"
import { CalendarIcon, Clock, Users, Phone, MapPin, Loader2 } from "lucide-react"
import { motion } from "framer-motion"
import { useGetAllReservations } from "@/src/hooks/usereservation"
import { useGetAllTables } from "@/src/hooks/useTable"

export default function AdminReservationPage() {
  // Fetch all reservations
  const { data: reservationsResponse, isLoading: isLoadingReservations, refetch: refetchReservations } = useGetAllReservations()
  const { data: tablesResponse, isLoading: isLoadingTables } = useGetAllTables()

  const reservations = reservationsResponse?.data || []
  const tables = tablesResponse?.data || []

  // Helper function to get table label by ID
  const getTableLabel = (tableId: string) => {
    const table = tables.find((t: any) => t._id === tableId) as any
    return table ? `${table.tableLabel} (Cap: ${table.capacity})` : tableId
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      case 'no-show':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; color: string }> = {
      confirmed: { label: 'Confirmed', color: 'bg-green-100 text-green-800' },
      pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
      cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800' },
      completed: { label: 'Completed', color: 'bg-blue-100 text-blue-800' },
      'no-show': { label: 'No Show', color: 'bg-gray-100 text-gray-800' }
    }
    const info = statusMap[status] || { label: status, color: 'bg-gray-100 text-gray-800' }
    return (
      <span className={`text-xs px-2 py-1 rounded-full ${info.color}`}>
        {info.label}
      </span>
    )
  }

  if (isLoadingReservations || isLoadingTables) {
    return (
      <div className="flex flex-col md:flex-row h-screen bg-gradient-to-br from-orange-50 to-pink-50">
        <SidebarNav />
        <div className="flex-1 flex flex-col overflow-hidden md:ml-64">
          <Header />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-brand-primary mx-auto mb-4" />
              <p className="text-gray-500">Loading reservations...</p>
            </div>
          </main>
        </div>
      </div>
    )
  }

  // Statistics
  const totalReservations = reservations.length
  const confirmedReservations = reservations.filter((r: any) => r.status === 'confirmed').length
  const pendingReservations = reservations.filter((r: any) => r.status === 'pending').length
  const completedReservations = reservations.filter((r: any) => r.status === 'completed').length
  const cancelledReservations = reservations.filter((r: any) => r.status === 'cancelled').length

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gradient-to-br from-orange-50 to-pink-50">
      <SidebarNav />
      <div className="flex-1 flex flex-col overflow-hidden md:ml-64">
        <Header />
        <main className="flex-1 overflow-auto p-4">
          {/* Header with Stats */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5 }}
            className="mb-6"
          >
            <h1 className="text-4xl font-satisfy bg-gradient-to-r from-brand-primary to-purple-600 bg-clip-text text-transparent mb-2">
              Reservations Management
            </h1>
            <p className="text-gray-500">View and manage all restaurant reservations</p>
          </motion.div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-brand-primary"
            >
              <p className="text-sm text-gray-500">Total Reservations</p>
              <p className="text-2xl font-bold text-gray-800">{totalReservations}</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-500"
            >
              <p className="text-sm text-gray-500">Confirmed</p>
              <p className="text-2xl font-bold text-green-600">{confirmedReservations}</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-yellow-500"
            >
              <p className="text-sm text-gray-500">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{pendingReservations}</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-500"
            >
              <p className="text-sm text-gray-500">Completed</p>
              <p className="text-2xl font-bold text-blue-600">{completedReservations}</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-red-500"
            >
              <p className="text-sm text-gray-500">Cancelled</p>
              <p className="text-2xl font-bold text-red-600">{cancelledReservations}</p>
            </motion.div>
          </div>

          {/* Reservations List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reservations.map((reservation: any, index: number) => (
              <motion.div
                key={reservation._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
              >
                <Card className="hover:shadow-md transition-shadow border border-pink-100">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex justify-between items-start flex-col gap-2">
                      <div className="flex justify-between w-full items-center">
                        <span className="text-lg font-semibold text-gray-800">{reservation.guestName}</span>
                        {getStatusBadge(reservation.status)}
                      </div>
                      <div className="flex items-center gap-2 text-sm bg-brand-primary/10 text-brand-primary px-2 py-1 rounded-full">
                        <MapPin className="h-3 w-3" />
                        <span>{getTableLabel(reservation.tableId)}</span>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <CalendarIcon className="mr-2 h-4 w-4 text-gray-400" />
                        <span>{format(new Date(reservation.date), "EEEE, MMMM d, yyyy")}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="mr-2 h-4 w-4 text-gray-400" />
                        <span>{format(new Date(reservation.date), "h:mm a")}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="mr-2 h-4 w-4 text-gray-400" />
                        <span>{reservation.partySize} {reservation.partySize === 1 ? 'Guest' : 'Guests'}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="mr-2 h-4 w-4 text-gray-400" />
                        <span>{reservation.guestPhone}</span>
                      </div>
                      {reservation.guestEmail && (
                        <div className="text-sm text-gray-600 pl-6">
                          📧 {reservation.guestEmail}
                        </div>
                      )}
                      {reservation.specialRequest && (
                        <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-600">
                          <span className="font-medium">Special Request:</span> {reservation.specialRequest}
                        </div>
                      )}
                      {reservation.cancelReason && (
                        <div className="mt-2 p-2 bg-red-50 rounded text-sm text-red-600">
                          <span className="font-medium">Cancel Reason:</span> {reservation.cancelReason}
                        </div>
                      )}
                      <div className="text-xs text-gray-400 pt-2 border-t mt-2">
                        Booked on: {format(new Date(reservation.createdAt), "MMM d, yyyy h:mm a")}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}

            {reservations.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center py-12 text-gray-500">
                <span className="text-4xl mb-4">📅</span>
                <h3 className="text-xl font-medium mb-2">No reservations yet</h3>
                <p>Reservations will appear here once customers book tables</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}