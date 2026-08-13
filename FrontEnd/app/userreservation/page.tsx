// app/reservation/page.tsx
"use client";

import React, { useState } from "react";
import { useGetAllTables } from "@/src/hooks/useTable";
import { useCreateReservation } from "@/src/hooks/usereservation";
import { useUpdateTableStatus } from "@/src/hooks/useTable";
import { toast } from "sonner";
import { CalendarIcon, Users, Phone, Mail, User, Clock, Coffee, CheckCircle2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
 import Navbar from "@/components/Navbar/navbar";
 import { useToast } from "@/components/ui/use-toast";

interface ReservationFormData {
  guestName: string;
  guestPhone: string;
  guestEmail: string;
  date: string;
  partySize: number;
  durationMins: number;
  specialRequest: string;
}

const initialFormData: ReservationFormData = {
  guestName: "",
  guestPhone: "",
  guestEmail: "",
  date: "",
  partySize: 2,
  durationMins: 60,
  specialRequest: "",
};

const ReservationPage = () => {
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<ReservationFormData>(initialFormData);
  const [selectedTableForBooking, setSelectedTableForBooking] = useState<string | null>(null);

  const { data: tablesResponse, isLoading, refetch } = useGetAllTables();
  const createReservation = useCreateReservation();
  const updateTableStatus = useUpdateTableStatus();

  // Filter only available tables
  const availableTables = tablesResponse?.data?.filter(
    (table: any) => table.status === "available"
  ) || [];

  const selectedTable = availableTables.find((t: any) => t._id === selectedTableId) as any;

  const handleTableClick = (tableId: string) => {
    setSelectedTableId(tableId);
    setSelectedTableForBooking(tableId);
    setShowForm(true);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedTableId || !selectedTable) {
      toast.error("Please select a table");
      return;
    }

    if (!formData.guestName || !formData.guestPhone || !formData.date) {
      toast.error("Please fill in all required fields");
      return;
    }

    const reservationData = {
      guestName: formData.guestName,
      guestPhone: formData.guestPhone,
      guestEmail: formData.guestEmail || undefined,
      date: new Date(formData.date).toISOString(),
      partySize: formData.partySize,
      durationMins: formData.durationMins,
      specialRequest: formData.specialRequest || undefined,
    };

    try {
      // First create the reservation
      await createReservation.mutateAsync({
        tableId: selectedTableId,
        data: reservationData,
      });

      // Then update table status to "reserved"
      await updateTableStatus.mutateAsync({
        id: selectedTableId,
        status: "reserved"
      });

      toast.success(`Table ${selectedTable.tableLabel} reserved successfully!`);
      setShowForm(false);
      setSelectedTableId(null);
      setSelectedTableForBooking(null);
      setFormData(initialFormData);
      refetch(); // Refresh tables to update availability
    } catch (error: any) {
      toast.error(error?.message || "Failed to create reservation");
    }
  };

  const closeForm = () => {
    setShowForm(false);
    setSelectedTableId(null);
    setSelectedTableForBooking(null);
    setFormData(initialFormData);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading available tables...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-satisfy bg-gradient-to-r from-brand-primary to-purple-600 bg-clip-text text-transparent mb-4">
              Book Your Table
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Choose from our available tables and reserve your spot for an amazing dining experience
            </p>
          </div>

          {/* Available Tables Grid */}
          {availableTables.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <Coffee className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No Tables Available
              </h3>
              <p className="text-gray-500">
                All tables are currently booked. Please check back later!
              </p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">
                  Available Tables ({availableTables.length})
                </h2>
                <p className="text-gray-500">Click on any table to make a reservation</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {availableTables.map((table: any) => (
                  <div
                    key={table._id}
                    onClick={() => handleTableClick(table._id)}
                    className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-brand-primary overflow-hidden group"
                  >
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xl font-bold text-gray-800">
                          {table.tableLabel}
                        </h3>
                        <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
                          Available
                        </span>
                      </div>

                      <div className="space-y-2 text-gray-600">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          <span className="text-sm">Capacity: {table.capacity} people</span>
                        </div>
                        {table.section && (
                          <div className="flex items-center gap-2">
                            <Coffee className="w-4 h-4" />
                            <span className="text-sm">Section: {table.section}</span>
                          </div>
                        )}
                      </div>

                      <Button
                        className={`w-full mt-4 transition-all
                          ${
                            selectedTableForBooking === table._id
                              ? "bg-brand-primary text-white hover:bg-brand-primary/90"
                              : "bg-gradient-to-r from-brand-primary to-brand-secondary hover:from-brand-primary/90 hover:to-brand-secondary/90 text-white"
                          }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTableClick(table._id);
                        }}
                      >
                        {selectedTableForBooking === table._id ? (
                          <>
                            <CheckCircle2 className="mr-2 h-4 w-4" /> Selected
                          </>
                        ) : (
                          <>
                            <Zap className="mr-2 h-4 w-4" /> Reserve Now
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Reservation Form Modal */}
          {showForm && selectedTable && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-satisfy text-brand-primary">
                    Reserve {selectedTable.tableLabel}
                  </h2>
                  <button
                    onClick={closeForm}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ×
                  </button>
                </div>

                <div className="bg-gradient-to-r from-orange-50 to-pink-50 p-3 rounded-lg mb-4">
                  <p className="text-sm text-gray-600">
                    <strong>Capacity:</strong> {selectedTable.capacity} people
                  </p>
                  {selectedTable.section && (
                    <p className="text-sm text-gray-600">
                      <strong>Section:</strong> {selectedTable.section}
                    </p>
                  )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        name="guestName"
                        value={formData.guestName}
                        onChange={handleInputChange}
                        required
                        className="w-full border rounded-lg px-10 py-2 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                        placeholder="John Doe"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="tel"
                        name="guestPhone"
                        value={formData.guestPhone}
                        onChange={handleInputChange}
                        required
                        className="w-full border rounded-lg px-10 py-2 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                        placeholder="+1234567890"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="email"
                        name="guestEmail"
                        value={formData.guestEmail}
                        onChange={handleInputChange}
                        className="w-full border rounded-lg px-10 py-2 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date & Time <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="datetime-local"
                        name="date"
                        value={formData.date}
                        onChange={handleInputChange}
                        required
                        className="w-full border rounded-lg px-10 py-2 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Number of Guests <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <select
                        name="partySize"
                        value={formData.partySize}
                        onChange={handleInputChange}
                        className="w-full border rounded-lg px-10 py-2 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                          <option key={num} value={num}>
                            {num} {num === 1 ? "Guest" : "Guests"}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Duration
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <select
                        name="durationMins"
                        value={formData.durationMins}
                        onChange={handleInputChange}
                        className="w-full border rounded-lg px-10 py-2 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                      >
                        <option value="60">1 Hour</option>
                        <option value="90">1.5 Hours</option>
                        <option value="120">2 Hours</option>
                        <option value="150">2.5 Hours</option>
                        <option value="180">3 Hours</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Special Requests
                    </label>
                    <textarea
                      name="specialRequest"
                      value={formData.specialRequest}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                      placeholder="Any dietary restrictions, special occasions, or preferences?"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={closeForm}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <Button
                      type="submit"
                      disabled={createReservation.isPending || updateTableStatus.isPending}
                      className="flex-1 bg-gradient-to-r from-brand-primary to-brand-secondary hover:from-brand-primary/90 hover:to-brand-secondary/90 text-white"
                    >
                      {createReservation.isPending || updateTableStatus.isPending ? (
                        <span className="flex items-center justify-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Processing...
                        </span>
                      ) : (
                        "Confirm Reservation"
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ReservationPage;