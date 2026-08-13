import { Inventory } from "../models/inventory.model.js";
import { ApiError } from "../utils/ApiError.js";

class InventoryService {
  // Get all inventory items (paginated)
  static async getAll({ page = 1, limit = 20, search = "" } = {}) {
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 20;
    const skip = (page - 1) * limit;

    const query = search ? { name: { $regex: search, $options: "i" } } : {};

    const [items, total] = await Promise.all([
      Inventory.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Inventory.countDocuments(query),
    ]);

    return {
      items,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  // Get single inventory item by id
  static async getOne(id) {
    const inventory = await Inventory.findById(id);
    if (!inventory) throw new ApiError(404, "Inventory item not found");
    return inventory;
  }

  // Create a standalone inventory item
  static async create(data) {
    const { name, quantity, unit, reorderLevel } = data;
    if (!name || !unit) throw new ApiError(400, "Name and unit are required");

    const inventory = await Inventory.create({
      name,
      quantity: quantity ?? 0,
      unit,
      reorderLevel: reorderLevel ?? 5,
    });

    return inventory;
  }

  // Update inventory settings
  static async update(id, data) {
    const inventory = await Inventory.findById(id);
    if (!inventory) throw new ApiError(404, "Inventory item not found");

    const allowed = ["name", "quantity", "unit", "reorderLevel", "costPerUnit"];
    for (const key of allowed) {
      if (data[key] !== undefined) inventory[key] = data[key];
    }

    await inventory.save();
    return inventory;
  }

  // Delete an inventory item
  static async remove(id) {
    const inventory = await Inventory.findByIdAndDelete(id);
    if (!inventory) throw new ApiError(404, "Inventory item not found");
    return { message: "Inventory item deleted" };
  }

  // Adjust stock (add or deduct)
  static async adjustStock(id, amount, type) {
    if (!amount || amount <= 0) throw new ApiError(400, "Amount must be a positive number");
    if (!["add", "deduct"].includes(type)) throw new ApiError(400, "Type must be 'add' or 'deduct'");

    const inventory = await Inventory.findById(id);
    if (!inventory) throw new ApiError(404, "Inventory item not found");

    if (type === "deduct" && inventory.quantity < amount) {
      throw new ApiError(400, `Insufficient stock. Available: ${inventory.quantity}`);
    }

    inventory.quantity += type === "add" ? amount : -amount;
    inventory.stockHistory.push({
      type: type === "add" ? "add" : "deduct",
      quantity: amount,
      reason: type === "add" ? "Manual add" : "Manual deduct",
      date: new Date(),
    });
    if (type === "add") inventory.lastRestocked = new Date();

    await inventory.save();
    return inventory;
  }

  // Get low stock / items needing reorder
  static async getLowStock() {
    return Inventory.find({
      $expr: { $lte: ["$quantity", "$reorderLevel"] },
      isActive: true,
    }).sort({ quantity: 1 });
  }
}

export { InventoryService };
