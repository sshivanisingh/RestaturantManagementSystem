
"use client";

import React, { useState } from "react";
import { useGetAvailableTables } from "@/src/hooks/useTable";
import { useCreateReservation } from "@/src/hooks/usereservation";
import { toast } from "sonner";
import {
  CalendarIcon,
  Users,
  Phone,
  Mail,
  User,
  Clock,
  Coffee,
  CheckCircle2,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar/navbar";

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
  const [formData, setFormData] =
    useState<ReservationFormData>(initialFormData);
  const [selectedTableForBooking, setSelectedTableForBooking] =
    useState<string | null>(null);

  // Public endpoint: customers do not need to log in to view tables.
  const {
    data: tablesResponse,
    isLoading,
    isError,
    refetch,
  } = useGetAvailableTables();

  const createReservation = useCreateReservation();

  const availableTables =
    tablesResponse?.data?.filter(
      (table) => table.status === "available"
    ) ?? [];

  const selectedTable = availableTables.find(
    (table) => table._id === selectedTableId
  );

  const handleTableClick = (tableId: string) => {
    setSelectedTableId(tableId);
    setSelectedTableForBooking(tableId);
    setShowForm(true);
  };

  const handleInputChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]:
        name === "partySize" || name === "durationMins"
          ? Number(value)
          : value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!selectedTableId || !selectedTable) {
      toast.error("Please select a table");
      return;
    }

    if (
      !formData.guestName.trim() ||
      !formData.guestPhone.trim() ||
      !formData.date
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (formData.partySize > selectedTable.capacity) {
      toast.error(
        `This table accommodates a maximum of ${selectedTable.capacity} guests.`
      );
      return;
    }

    const reservationData = {
      guestName: formData.guestName.trim(),
      guestPhone: formData.guestPhone.trim(),
      guestEmail: formData.guestEmail.trim() || undefined,
      date: new Date(formData.date).toISOString(),
      partySize: formData.partySize,
      durationMins: formData.durationMins,
      specialRequest: formData.specialRequest.trim() || undefined,
    };

    try {
      await createReservation.mutateAsync({
        tableId: selectedTableId,
        data: reservationData,
      });

      toast.success(
        `Reservation request submitted for ${selectedTable.tableLabel}!`
      );

      setShowForm(false);
      setSelectedTableId(null);
      setSelectedTableForBooking(null);
      setFormData(initialFormData);

      await refetch();
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to create reservation";

      toast.error(message);
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto mb-4" />
          <p className="text-gray-600">Loading available tables...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50 px-4">
          <p className="text-red-600">
            Unable to load tables. Please try again.
          </p>
          <Button onClick={() => refetch()}>Retry</Button>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-satisfy bg-gradient-to-r from-brand-primary to-purple-600 bg-clip-text text-transparent mb-4">
              Book Your Table
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Choose from our available tables and reserve your spot for an
              amazing dining experience.
            </p>
          </div>

          {availableTables.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <Coffee className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No Tables Available
              </h3>
              <p className="text-gray-500">
                All tables are currently booked. Please check back later.
              </p>
              <Button className="mt-4" onClick={() => refetch()}>
                Refresh Tables
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">
                  Available Tables ({availableTables.length})
                </h2>
                <p className="text-gray-500">
                  Select a table to make a reservation.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {availableTables.map((table) => (
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
                          <span className="text-sm">
                            Capacity: {table.capacity} people
                          </span>
                        </div>

                        {table.section && (
                          <div className="flex items-center gap-2">
                            <Coffee className="w-4 h-4" />
                            <span className="text-sm">
                              Section: {table.section}
                            </span>
                          </div>
                        )}
                      </div>

                      <Button
                        className={`w-full mt-4 transition-all ${
                          selectedTableForBooking === table._id
                            ? "bg-brand-primary text-white hover:bg-brand-primary/90"
                            : "bg-gradient-to-r from-brand-primary to-brand-secondary hover:from-brand-primary/90 hover:to-brand-secondary/90 text-white"
                        }`}
                        onClick={(event) => {
                          event.stopPropagation();
                          handleTableClick(table._id);
                        }}
                      >
                        {selectedTableForBooking === table._id ? (
                          <>
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Selected
                          </>
                        ) : (
                          <>
                            <Zap className="mr-2 h-4 w-4" />
                            Reserve Now
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {showForm && selectedTable && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-satisfy text-brand-primary">
                    Reserve {selectedTable.tableLabel}
                  </h2>
                  <button
                    type="button"
                    onClick={closeForm}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                    aria-label="Close reservation form"
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
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
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
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
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
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
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
                      <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="datetime-local"
                        name="date"
                        value={formData.date}
                        onChange={handleInputChange}
                        required
                        min={new Date().toISOString().slice(0, 16)}
                        className="w-full border rounded-lg px-10 py-2 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Number of Guests <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <select
                        name="partySize"
                        value={formData.partySize}
                        onChange={handleInputChange}
                        className="w-full border rounded-lg px-10 py-2 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                      >
                        {Array.from(
                          { length: Math.min(selectedTable.capacity, 10) },
                          (_, index) => index + 1
                        ).map((number) => (
                          <option key={number} value={number}>
                            {number} {number === 1 ? "Guest" : "Guests"}
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
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <select
                        name="durationMins"
                        value={formData.durationMins}
                        onChange={handleInputChange}
                        className="w-full border rounded-lg px-10 py-2 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                      >
                        <option value={60}>1 Hour</option>
                        <option value={90}>1.5 Hours</option>
                        <option value={120}>2 Hours</option>
                        <option value={150}>2.5 Hours</option>
                        <option value={180}>3 Hours</option>
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
                      disabled={createReservation.isPending}
                      className="flex-1 bg-gradient-to-r from-brand-primary to-brand-secondary hover:from-brand-primary/90 hover:to-brand-secondary/90 text-white"
                    >
                      {createReservation.isPending
                        ? "Processing..."
                        : "Confirm Reservation"}
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
