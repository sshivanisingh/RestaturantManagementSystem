import { asyncHandler }        from "../utils/asyncHandler.js";
import { ApiResponse }         from "../utils/ApiResponse.js";
import { MenuCategoryService } from "../services/MenuCategoryService.js";

const createCategory = asyncHandler(async (req, res) => {
  const category = await MenuCategoryService.create(
    req.body
  );
  res.status(201).json(new ApiResponse(201, category, "Category created"));
});


const getAllCategories = asyncHandler(async (req, res) => {
  const categories = await MenuCategoryService.getAllByRestaurant()
  res.status(200).json(new ApiResponse(200, categories, "Categories fetched"));
});



const getCategory = asyncHandler(async (req, res) => {
  const category = await MenuCategoryService.getOne(
    req.params.id
  );
  res.status(200).json(new ApiResponse(200, category, "Category fetched"));
});

const updateCategory = asyncHandler(async (req, res) => {
  const category = await MenuCategoryService.update(
    req.params.id,
    req.body
  );
  res.status(200).json(new ApiResponse(200, category, "Category updated"));
});

const deleteCategory = asyncHandler(async (req, res) => {
  const result = await MenuCategoryService.delete(
    req.params.id,
  );
  res.status(200).json(new ApiResponse(200, result, result.message));
});


const toggleStatus = asyncHandler(async (req, res) => {
  const result = await MenuCategoryService.toggleStatus(
    req.params.id,
  );
  res.status(200).json(new ApiResponse(200, result, result.message));
});

export {
  createCategory, getAllCategories, getCategory,
  updateCategory, deleteCategory,  toggleStatus,
};