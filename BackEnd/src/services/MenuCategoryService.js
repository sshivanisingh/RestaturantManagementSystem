import { MenuCategory } from "../models/menuCategory.model.js";
import { ApiError }     from "../utils/ApiError.js";

class MenuCategoryService {

  // ─── Create ────────────────────────────────────
  static async create(data) {
    const { name, description, icon, sortOrder } = data;
    const exists = await MenuCategory.findOne({
      name : name.trim(),
    });
    if (exists) throw new ApiError(409, `Category "${name}" already exists`);

    const category = await MenuCategory.create({
      name        : name.trim(),
      description : description?.trim() || "",
      icon        : icon?.trim()        || "",
      sortOrder   : sortOrder           || 0,
    });

    return category;
  }

  // ─── Get All ───────────────────────────────────
  static async getAllByRestaurant(restaurantId) {
    const categories = await MenuCategory
      .find()
      .sort({ sortOrder: 1, createdAt: 1 })
      .select("-__v");

    return categories;
  }

  // ─── Get One ───────────────────────────────────
  static async getOne(categoryId) {
    const category = await MenuCategory.findOne({
      _id: categoryId,
    }).select("-__v");

    if (!category) throw new ApiError(404, "Category not found");
    return category;
  }

  // ─── Update ────────────────────────────────────
  static async update(categoryId, data) {
    const category = await MenuCategory.findOne({
      _id          : categoryId,
    });
    if (!category) throw new ApiError(404, "Category not found");


    const { name, description, icon, sortOrder } = data;

    // Duplicate name check (khud ko exclude karo)
    if (name && name.trim() !== category.name) {
      const exists = await MenuCategory.findOne({
        name : name.trim(),
        _id  : { $ne: categoryId },
      });
      if (exists) throw new ApiError(409, `Category "${name}" already exists`);
    }

    if (name        !== undefined) category.name        = name.trim();
    if (description !== undefined) category.description = description.trim();
    if (icon        !== undefined) category.icon        = icon.trim();
    if (sortOrder   !== undefined) category.sortOrder   = sortOrder;

    await category.save();
    return category;
  }

  // ─── Delete ────────────────────────────────────
  static async delete(categoryId) {
    const category = await MenuCategory.findOne({
      _id          : categoryId,
    });
    if (!category) throw new ApiError(404, "Category not found");

    await category.deleteOne();
    return { message: "Category deleted successfully" };
  }

  // ─── Toggle Active/Inactive ────────────────────
  static async toggleStatus(categoryId) {
    const category = await MenuCategory.findOne({
      _id: categoryId,
    });
    if (!category) throw new ApiError(404, "Category not found");

    category.isActive = !category.isActive;
    await category.save();

    return {
      message  : `Category ${category.isActive ? "activated" : "deactivated"}`,
      isActive : category.isActive,
    };
  }
}

export { MenuCategoryService };