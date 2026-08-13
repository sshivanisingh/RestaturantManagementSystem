import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { InventoryService } from "../services/InventoryService.js";

// Get all inventory items
const getInventory = asyncHandler(async (req, res) => {
  const { page, limit, search } = req.query;
  const result = await InventoryService.getAll({ page, limit, search });
  res.status(200).json(new ApiResponse(200, result, "Inventory fetched"));
});

// Get single inventory item
const getInventoryItem = asyncHandler(async (req, res) => {
  const inventory = await InventoryService.getOne(req.params.id);
  res.status(200).json(new ApiResponse(200, inventory, "Inventory item fetched"));
});

// Create inventory item
const createInventory = asyncHandler(async (req, res) => {
  const inventory = await InventoryService.create(req.body);
  res.status(201).json(new ApiResponse(201, inventory, "Inventory created"));
});

// Update inventory item
const updateInventory = asyncHandler(async (req, res) => {
  const inventory = await InventoryService.update(req.params.id, req.body);
  res.status(200).json(new ApiResponse(200, inventory, "Inventory updated"));
});

// Delete inventory item
const deleteInventory = asyncHandler(async (req, res) => {
  const result = await InventoryService.remove(req.params.id);
  res.status(200).json(new ApiResponse(200, result, "Inventory deleted"));
});

// Adjust stock (add / deduct)
const adjustStock = asyncHandler(async (req, res) => {
  const { amount, type } = req.body;
  const inventory = await InventoryService.adjustStock(req.params.id, amount, type);
  res.status(200).json(new ApiResponse(200, inventory, "Stock adjusted"));
});

// Get low stock items
const getLowStock = asyncHandler(async (req, res) => {
  const items = await InventoryService.getLowStock();
  res.status(200).json(new ApiResponse(200, items, "Low stock items fetched"));
});

export {
  getInventory,
  getInventoryItem,
  createInventory,
  updateInventory,
  deleteInventory,
  adjustStock,
  getLowStock,
};
