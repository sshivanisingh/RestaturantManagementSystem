import { Table }      from "../models/table.model.js";
import { Restaurant } from "../models/restaurant.model.js";
import { ApiError }   from "../utils/ApiError.js";

class TableService {

  // ══════════════════════════════════════════════════════════════
  //  TABLE CRUD
  // ══════════════════════════════════════════════════════════════

  // ─── Create table ─────────────────────────────────────────────
  static async create(restaurantId, data) {
    const { tableLabel, status, capacity, section } = data;

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) throw new ApiError(404, "Restaurant not found");

    const exists = await Table.findOne({
      restaurantId,
      tableLabel: tableLabel.trim(),
    });
    if (exists) throw new ApiError(409, `Table "${tableLabel}" already exists`);

    const table = await Table.create({
      restaurantId,
      tableLabel : tableLabel.trim(),
      status     : status   || "available",
      capacity   : capacity || 4,
      section    : section  || null,
    });

    return table;
  }

  // ─── Get all tables ────────────────────────────────────────────
  static async getAllByRestaurant(restaurantId, filters = {}) {
    const query = { restaurantId };
    if (filters.status)  query.status  = filters.status;
    if (filters.section) query.section = filters.section;

    const tables = await Table
      .find(query)
      .populate("userId", "name email phone")
      .sort({ tableLabel: 1 })
      .select("-__v");

    return tables;
  }

  // ─── Get one table ─────────────────────────────────────────────
  static async getOne(tableId, restaurantId) {
    const table = await Table
      .findOne({ _id: tableId, restaurantId })
      .populate("userId", "name email phone")
      .populate("reservations.userId", "name email phone")
      .select("-__v");

    if (!table) throw new ApiError(404, "Table not found");
    return table;
  }

  // ─── Update table meta ─────────────────────────────────────────
  static async update(tableId, restaurantId, data) {
    const table = await Table.findOne({ _id: tableId, restaurantId });
    if (!table) throw new ApiError(404, "Table not found");

    const { tableLabel, status, userId, capacity, section } = data;

    // Duplicate label check (khud ko exclude)
    if (tableLabel && tableLabel.trim() !== table.tableLabel) {
      const exists = await Table.findOne({
        restaurantId,
        tableLabel : tableLabel.trim(),
        _id        : { $ne: tableId },
      });
      if (exists) throw new ApiError(409, `Table "${tableLabel}" already exists`);
    }

    if (tableLabel !== undefined) table.tableLabel = tableLabel.trim();
    if (status     !== undefined) table.status     = status;
    if (userId     !== undefined) table.userId     = userId || null;
    if (capacity   !== undefined) table.capacity   = capacity;
    if (section    !== undefined) table.section    = section;

    await table.save();
    return table;
  }

  // ─── Delete table ──────────────────────────────────────────────
  static async delete(tableId, restaurantId) {
    const table = await Table.findOne({ _id: tableId, restaurantId });
    if (!table) throw new ApiError(404, "Table not found");

    await table.deleteOne();
    return { message: "Table deleted successfully" };
  }

  // ─── Update status only ────────────────────────────────────────
  static async updateStatus(tableId, restaurantId, data) {
    const { status, userId } = data;

    const table = await Table.findOne({ _id: tableId, restaurantId });
    if (!table) throw new ApiError(404, "Table not found");

    table.status = status;

    if (status === "occupied" || status === "reserved") {
      table.userId = userId || null;
    } else {
      // available hone par userId clear
      table.userId = null;
    }

    await table.save();
    return { message: `Table status updated to "${status}"`, table };
  }

  // ══════════════════════════════════════════════════════════════
  //  RESERVATION CRUD
  // ══════════════════════════════════════════════════════════════

  // ─── Create reservation ────────────────────────────────────────
  // Body fields:
  //   userId?        — logged-in user ka id (optional)
  //   guestName      — guest/walk-in name
  //   guestPhone     — guest phone *
  //   guestEmail?    — guest email
  //   date *         — reservation datetime (ISO string)
  //   partySize *    — kitne log
  //   durationMins?  — default 60 min
  //   specialRequest?
  static async createReservation(tableId, restaurantId, data) {
    const table = await Table.findOne({ _id: tableId, restaurantId });
    if (!table) throw new ApiError(404, "Table not found");

    const {
      userId, guestName, guestPhone, guestEmail,
      date, partySize, durationMins, specialRequest,
    } = data;

    // Validation
    if (!date)       throw new ApiError(400, "Reservation date is required");
    if (!partySize)  throw new ApiError(400, "Party size is required");
    if (!userId && !guestName)  throw new ApiError(400, "Guest name is required for non-logged-in reservations");
    if (!userId && !guestPhone) throw new ApiError(400, "Guest phone is required");

    if (partySize > table.capacity) {
      throw new ApiError(400, `Party size (${partySize}) exceeds table capacity (${table.capacity})`);
    }

    const reservationDate = new Date(date);
    if (isNaN(reservationDate.getTime())) throw new ApiError(400, "Invalid date format");
    if (reservationDate < new Date())     throw new ApiError(400, "Reservation date cannot be in the past");

    // Overlap check — same table, same time window mein koi active reservation nahi honi chahiye
    const duration = durationMins || 60;
    const endTime  = new Date(reservationDate.getTime() + duration * 60_000);

    const conflict = table.reservations.find(r => {
      if (["cancelled", "completed", "no-show"].includes(r.status)) return false;
      const rEnd = new Date(r.date.getTime() + (r.durationMins || 60) * 60_000);
      return reservationDate < rEnd && endTime > r.date;
    });

    if (conflict) {
      throw new ApiError(409, `Table is already reserved from ${conflict.date.toISOString()} for ${conflict.durationMins || 60} minutes`);
    }

    // Push reservation
    const reservation = {
      userId        : userId        || null,
      guestName     : guestName     || null,
      guestPhone    : guestPhone    || null,
      guestEmail    : guestEmail    || null,
      date          : reservationDate,
      partySize,
      durationMins  : duration,
      specialRequest: specialRequest || null,
      status        : "pending",
    };

    table.reservations.push(reservation);

    // Agar reservation aaj ke liye hai to table status reserved kar do
    const today      = new Date();
    const sameDay    = reservationDate.toDateString() === today.toDateString();
    if (sameDay && table.status === "available") {
      table.status = "reserved";
    }

    await table.save();

    const saved = table.reservations[table.reservations.length - 1];
    return { message: "Reservation created successfully", reservation: saved, table };
  }

  // ─── Get all reservations for a table ─────────────────────────
  static async getReservations(tableId, restaurantId, filters = {}) {
    const table = await Table
      .findOne({ _id: tableId, restaurantId })
      .populate("reservations.userId", "name email phone")
      .select("tableLabel reservations capacity section");

    if (!table) throw new ApiError(404, "Table not found");

    let reservations = table.reservations;

    // Optional filters
    if (filters.status) {
      reservations = reservations.filter(r => r.status === filters.status);
    }
    if (filters.date) {
      const filterDate = new Date(filters.date).toDateString();
      reservations = reservations.filter(
        r => new Date(r.date).toDateString() === filterDate
      );
    }

    // Sort: upcoming first
    reservations = reservations.sort((a, b) => new Date(a.date) - new Date(b.date));

    return { table: { _id: table._id, tableLabel: table.tableLabel }, reservations };
  }

  // ─── Get all reservations across all tables (restaurant-wide) ──
  static async getAllReservations(restaurantId, filters = {}) {
    const tables = await Table
      .find({ restaurantId })
      .populate("reservations.userId", "name email phone")
      .select("tableLabel reservations capacity section status");

    // Flatten reservations with table info
    let all = [];
    for (const t of tables) {
      for (const r of t.reservations) {
        all.push({
          ...r.toObject(),
          tableId    : t._id,
          tableLabel : t.tableLabel,
          capacity   : t.capacity,
          section    : t.section,
        });
      }
    }

    // Filters
    if (filters.status) {
      all = all.filter(r => r.status === filters.status);
    }
    if (filters.date) {
      const filterDate = new Date(filters.date).toDateString();
      all = all.filter(r => new Date(r.date).toDateString() === filterDate);
    }
    if (filters.guestPhone) {
      all = all.filter(r => r.guestPhone?.includes(filters.guestPhone));
    }

    // Sort: upcoming first
    all.sort((a, b) => new Date(a.date) - new Date(b.date));

    return all;
  }

  // ─── Update reservation ────────────────────────────────────────
  static async updateReservation(tableId, restaurantId, reservationId, data) {
    const table = await Table.findOne({ _id: tableId, restaurantId });
    if (!table) throw new ApiError(404, "Table not found");

    const reservation = table.reservations.id(reservationId);
    if (!reservation) throw new ApiError(404, "Reservation not found");

    if (["completed", "cancelled"].includes(reservation.status)) {
      throw new ApiError(400, `Cannot update a ${reservation.status} reservation`);
    }

    const {
      guestName, guestPhone, guestEmail,
      date, partySize, durationMins, specialRequest, status,
    } = data;

    if (date) {
      const newDate = new Date(date);
      if (isNaN(newDate.getTime())) throw new ApiError(400, "Invalid date format");
      reservation.date = newDate;
    }

    if (partySize !== undefined) {
      if (partySize > table.capacity) {
        throw new ApiError(400, `Party size (${partySize}) exceeds table capacity (${table.capacity})`);
      }
      reservation.partySize = partySize;
    }

    if (guestName     !== undefined) reservation.guestName      = guestName;
    if (guestPhone    !== undefined) reservation.guestPhone     = guestPhone;
    if (guestEmail    !== undefined) reservation.guestEmail     = guestEmail;
    if (durationMins  !== undefined) reservation.durationMins   = durationMins;
    if (specialRequest!== undefined) reservation.specialRequest = specialRequest;
    if (status        !== undefined) reservation.status         = status;

    await table.save();
    return { message: "Reservation updated", reservation };
  }

  // ─── Confirm reservation ───────────────────────────────────────
  static async confirmReservation(tableId, restaurantId, reservationId, staffId) {
    const table = await Table.findOne({ _id: tableId, restaurantId });
    if (!table) throw new ApiError(404, "Table not found");

    const reservation = table.reservations.id(reservationId);
    if (!reservation) throw new ApiError(404, "Reservation not found");

    if (reservation.status !== "pending") {
      throw new ApiError(400, `Reservation is already ${reservation.status}`);
    }

    reservation.status      = "confirmed";
    reservation.confirmedBy = staffId || null;
    table.status            = "reserved";

    await table.save();
    return { message: "Reservation confirmed", reservation };
  }

  // ─── Cancel reservation ────────────────────────────────────────
  static async cancelReservation(tableId, restaurantId, reservationId, data = {}) {
    const table = await Table.findOne({ _id: tableId, restaurantId });
    if (!table) throw new ApiError(404, "Table not found");

    const reservation = table.reservations.id(reservationId);
    if (!reservation) throw new ApiError(404, "Reservation not found");

    if (["completed", "cancelled"].includes(reservation.status)) {
      throw new ApiError(400, `Reservation is already ${reservation.status}`);
    }

    reservation.status       = "cancelled";
    reservation.cancelReason = data.reason || null;

    // Agar koi aur active reservation nahi hai to table available kar do
    const hasActive = table.reservations.some(
      r => r._id.toString() !== reservationId &&
           !["cancelled", "completed", "no-show"].includes(r.status)
    );
    if (!hasActive && table.status === "reserved") {
      table.status = "available";
    }

    await table.save();
    return { message: "Reservation cancelled", reservation };
  }

  // ─── Check-in ──────────────────────────────────────────────────
  static async checkIn(tableId, restaurantId, reservationId) {
    const table = await Table.findOne({ _id: tableId, restaurantId });
    if (!table) throw new ApiError(404, "Table not found");

    const reservation = table.reservations.id(reservationId);
    if (!reservation) throw new ApiError(404, "Reservation not found");

    if (!["pending", "confirmed"].includes(reservation.status)) {
      throw new ApiError(400, `Cannot check-in a ${reservation.status} reservation`);
    }

    reservation.status      = "confirmed";
    reservation.checkedInAt = new Date();
    table.status            = "occupied";
    table.userId            = reservation.userId || null;

    await table.save();
    return { message: "Checked in successfully", reservation, table };
  }

  // ─── Check-out ─────────────────────────────────────────────────
  static async checkOut(tableId, restaurantId, reservationId) {
    const table = await Table.findOne({ _id: tableId, restaurantId });
    if (!table) throw new ApiError(404, "Table not found");

    const reservation = table.reservations.id(reservationId);
    if (!reservation) throw new ApiError(404, "Reservation not found");

    reservation.status       = "completed";
    reservation.checkedOutAt = new Date();
    table.status             = "available";
    table.userId             = null;

    await table.save();
    return { message: "Checked out successfully", reservation, table };
  }

  // ─── Mark no-show ──────────────────────────────────────────────
  static async markNoShow(tableId, restaurantId, reservationId) {
    const table = await Table.findOne({ _id: tableId, restaurantId });
    if (!table) throw new ApiError(404, "Table not found");

    const reservation = table.reservations.id(reservationId);
    if (!reservation) throw new ApiError(404, "Reservation not found");

    reservation.status = "no-show";

    const hasActive = table.reservations.some(
      r => r._id.toString() !== reservationId &&
           !["cancelled", "completed", "no-show"].includes(r.status)
    );
    if (!hasActive) table.status = "available";

    await table.save();
    return { message: "Marked as no-show", reservation };
  }
}

export { TableService };