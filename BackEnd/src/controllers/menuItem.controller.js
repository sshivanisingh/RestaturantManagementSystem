import { asyncHandler }    from "../utils/asyncHandler.js";
import { ApiResponse }     from "../utils/ApiResponse.js";
import { MenuItemService } from "../services/MenuItemService.js";

const createItem = asyncHandler(async (req, res) => {
  const imagePath = req.file?.path || null;
  const item      = await MenuItemService.create(
    req.body,
    imagePath
  );
  res.status(201).json(new ApiResponse(201, item, "Menu item created"));
});

const getAllItems = asyncHandler(async (req, res) => {
  const items = await MenuItemService.getAllByRestaurant(
    req.query           
  );
  res.status(200).json(new ApiResponse(200, items, "Menu items fetched"));
});

const getItem = asyncHandler(async (req, res) => {
  const item = await MenuItemService.getOne(
    req.params.id,
    
  );
  res.status(200).json(new ApiResponse(200, item, "Menu item fetched"));
});

const updateItem = asyncHandler(async (req, res) => {
  const imagePath = req.file?.path || null;
  const item      = await MenuItemService.update(
    req.params.id,
    req.body,
    imagePath
  );
  res.status(200).json(new ApiResponse(200, item, "Menu item updated"));
});

const deleteItem = asyncHandler(async (req, res) => {
  const result = await MenuItemService.delete(
    req.params.id,
  );
  res.status(200).json(new ApiResponse(200, result, result.message));
});

const toggleStatus = asyncHandler(async (req, res) => {
  const result = await MenuItemService.toggleStatus(
    req.params.id,
  );
  res.status(200).json(new ApiResponse(200, result, result.message));
});

const toggleAvailability = asyncHandler(async (req, res) => {
  const result = await MenuItemService.toggleAvailability(
    req.params.id,
  );
  res.status(200).json(new ApiResponse(200, result, result.message));
});

export {
  createItem, getAllItems, getItem,
  updateItem, deleteItem,
  toggleStatus, toggleAvailability,
};