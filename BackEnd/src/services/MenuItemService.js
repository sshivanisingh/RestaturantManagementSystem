import { MenuItem }            from "../models/menuItem.model.js";
import { MenuCategory }        from "../models/menuCategory.model.js";
import { ApiError }            from "../utils/ApiError.js";
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";

class MenuItemService {

  // ─── Create ────────────────────────────────────
  static async create(data, imageLocalPath) {
    const {
      categoryId, name, description,
      price, discountPercent,
      type, preparationTime, servingSize,
      nutrition, ingredients, isBestSeller,
      initialRating,   
    } = data;

    // Category exist karti hai aur same restaurant ki hai?
    const category = await MenuCategory.findOne({
      _id          : categoryId,
    });
    if (!category) {
      throw new ApiError(404, "Category not found or does not belong to your restaurant");
    }

    // Same name same category mein?
    const exists = await MenuItem.findOne({
      categoryId,
      name : name.trim(),
    });
    if (exists) throw new ApiError(409, `Item "${name}" already exists in this category`);

    // Image upload
    let imageUrl = "";
    if (imageLocalPath) {
      const uploaded = await uploadOnCloudinary(imageLocalPath);
      if (!uploaded?.url) throw new ApiError(500, "Image upload failed");
      imageUrl = uploaded.url;
    }

    // Rating: admin initial rating dega toh set karo, warna 0
    const parsedRating = parseFloat(initialRating);
    const rating = {
      averageRating : (!isNaN(parsedRating) && parsedRating >= 1 && parsedRating <= 5)
        ? parseFloat(parsedRating.toFixed(1))
        : 0,
      ratingCount : 0,   
    };

    const item = await MenuItem.create({
      categoryId,
      name            : name.trim(),
      description     : description?.trim() || "",
      image           : imageUrl,
      price           : Number(price),
      discountPercent : Number(discountPercent) || 0,
      type,
      preparationTime : Number(preparationTime) || 0,
      servingSize     : servingSize || "1 person",
      nutrition       : nutrition   || {},
      ingredients     : ingredients || [],
      isBestSeller    : isBestSeller || false,
      rating,
    });

    return item;
  }

  // ─── Get All with Search & Filter ─────────
  static async getAllByRestaurant(query = {}) {
    const filter = {};
    const {
      search,
      categoryId,
      type,
      minPrice,
      maxPrice,
      isBestSeller,
      isActive,
      isAvailable,
      sortBy = "createdAt",
      sortOrder = "desc",
      page = 1,
      limit = 20,
    } = query;

    // Text search in name and description
    if (search && search.trim()) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Category filter
    if (categoryId) filter.categoryId = categoryId;

    // Type filter (veg, non-veg, vegan, etc.)
    if (type) filter.type = type;

    // Price range filter
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // Best seller filter
    if (isBestSeller !== undefined) filter.isBestSeller = isBestSeller === "true";

    // Active filter
    if (isActive !== undefined) filter.isActive = isActive === "true";

    // Available filter
    if (isAvailable !== undefined) filter.isAvailable = isAvailable === "true";

    // Sorting
    const sortObj = {};
    const sortField = ["name", "price", "rating", "createdAt"].includes(sortBy) ? sortBy : "createdAt";
    const sortDir = sortOrder === "asc" ? 1 : -1;
    sortObj[sortField] = sortDir;

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);

    const [items, total] = await Promise.all([
      MenuItem
        .find(filter)
        .populate("categoryId", "name")
        .sort(sortObj)
        .skip(skip)
        .limit(Number(limit))
        .select("-__v"),
      MenuItem.countDocuments(filter),
    ]);

    return {
      items,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    };
  }

  // ─── Get One ───────────────────────────────────
  static async getOne(itemId) {
    const item = await MenuItem
      .findOne({ _id: itemId })
      .populate("categoryId", "name isActive")
      .select("-__v");

    if (!item) throw new ApiError(404, "Menu item not found");
    return item;
  }

  // ─── Update ────────────────────────────────────
  static async update(itemId, data, imageLocalPath) {
    const item = await MenuItem.findOne({ _id: itemId });
    if (!item) throw new ApiError(404, "Menu item not found");

    const {
      categoryId, name, description,
      price, discountPercent,
      type, preparationTime, servingSize,
      nutrition, ingredients, isBestSeller,
      initialRating,  // admin manually rating update kar sakta hai
    } = data;

    // Agar category change ho rahi hai toh check karo
    if (categoryId && categoryId !== item.categoryId.toString()) {
      const category = await MenuCategory.findOne({
        _id          : categoryId,
      });
      if (!category) throw new ApiError(404, "Category not found");
      item.categoryId = categoryId;
    }

    // Duplicate name check
    if (name && name.trim() !== item.name) {
      const exists = await MenuItem.findOne({
        categoryId : item.categoryId,
        name       : name.trim(),
        _id        : { $ne: itemId },
      });
      if (exists) throw new ApiError(409, `Item "${name}" already exists`);
    }

    // New image
    if (imageLocalPath) {
      if (item.image) {
        const publicId = item.image.split("/").pop().split(".")[0];
        await deleteFromCloudinary(publicId);
      }
      const uploaded = await uploadOnCloudinary(imageLocalPath);
      if (!uploaded?.url) throw new ApiError(500, "Image upload failed");
      item.image = uploaded.url;
    }

    if (name            !== undefined) item.name            = name.trim();
    if (description     !== undefined) item.description     = description.trim();
    if (price           !== undefined) item.price           = Number(price);
    if (discountPercent !== undefined) item.discountPercent = Number(discountPercent);
    if (type            !== undefined) item.type            = type;
    if (preparationTime !== undefined) item.preparationTime = Number(preparationTime);
    if (servingSize     !== undefined) item.servingSize     = servingSize;
    if (nutrition       !== undefined) item.nutrition       = nutrition;
    if (ingredients     !== undefined) item.ingredients     = ingredients;
    if (isBestSeller    !== undefined) item.isBestSeller    = isBestSeller;

    // Admin manually rating update kare — only averageRating change hogi
    // ratingCount ko touch nahi karenge (wo user reviews se badhega)
    if (initialRating !== undefined) {
      const parsedRating = parseFloat(initialRating);
      if (!isNaN(parsedRating) && parsedRating >= 1 && parsedRating <= 5) {
        item.rating.averageRating = parseFloat(parsedRating.toFixed(1));
      }
    }

    await item.save();
    return item;
  }

  // ─── Delete ────────────────────────────────────
  static async delete(itemId) {
    const item = await MenuItem.findOne({ _id: itemId });
    if (!item) throw new ApiError(404, "Menu item not found");

    if (item.image) {
      const publicId = item.image.split("/").pop().split(".")[0];
      await deleteFromCloudinary(publicId);
    }

    await item.deleteOne();
    return { message: "Menu item deleted successfully" };
  }

  // ─── Toggle Active/Inactive ────────────────────
  static async toggleStatus(itemId) {
    const item = await MenuItem.findOne({ _id: itemId});
    if (!item) throw new ApiError(404, "Menu item not found");

    item.isActive = !item.isActive;
    await item.save();

    return {
      message  : `Item ${item.isActive ? "activated" : "deactivated"}`,
      isActive : item.isActive,
    };
  }

  // ─── Toggle Available/Unavailable ──────────────
  static async toggleAvailability(itemId) {
    const item = await MenuItem.findOne({ _id: itemId});
    if (!item) throw new ApiError(404, "Menu item not found");

    item.isAvailable = !item.isAvailable;
    await item.save();

    return {
      message     : `Item marked as ${item.isAvailable ? "available" : "unavailable"}`,
      isAvailable : item.isAvailable,
    };
  }

  // ─── Update Rating (future: user review ke baad call hoga) ─────────────
  // Jab user review dega tab yeh method call karenge
  // Abhi ke liye sirf foundation hai — controller mein expose nahi kiya
  static async updateRatingFromReview(itemId, newRatingValue) {
    const item = await MenuItem.findById(itemId);
    if (!item) throw new ApiError(404, "Menu item not found");

    const currentCount   = item.rating.ratingCount;
    const currentAvg     = item.rating.averageRating;

    // Weighted average formula
    const newCount   = currentCount + 1;
    const newAverage = parseFloat(
      ((currentAvg * currentCount + newRatingValue) / newCount).toFixed(1)
    );

    item.rating.averageRating = newAverage;
    item.rating.ratingCount   = newCount;

    await item.save();
    return item.rating;
  }
}

export { MenuItemService };