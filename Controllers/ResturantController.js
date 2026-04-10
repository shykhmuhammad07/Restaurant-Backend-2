import Restaurant from "../Model/restaurantModel.js";
import Table from "../Model/tableModel.js";
import Review from "../Model/reviewModel.js";
import cloudinary from "../Config/Cloudinary.js";

// @desc    Create restaurant
// @route   POST /api/restaurants
export const createRestaurant = async (req, res) => {
  try {
    const { name, description, address, images, lat, lng, ...rest } = req.body;

    // Upload images to Cloudinary
    const imageUrls = req.files?.map((file) => file.path) || [];

    const restaurant = await Restaurant.create({
      name,
      description,
      address,
      images: imageUrls,
      location: {
        lat,
        lng,
      },
      owner: req.user.id,
      ...rest,
    });

    res.status(201).json({
      message: "Restaurant created successfully",
      restaurant,
    });
  } catch (error) {
    console.error("Create restaurant error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get all restaurants
// @route   GET /api/restaurants
export const getAllRestaurants = async (req, res) => {
  try {
    const { search, cuisine, priceRange } = req.query;
    let query = {};

    // Build search query
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { address: { $regex: search, $options: "i" } },
      ];
    }

    if (cuisine) query.cuisine = cuisine;
    if (priceRange) query.priceRange = priceRange;

    const restaurants = await Restaurant.find(query)
      .populate("owner", "username email")
      .sort("-createdAt");

    // Get review counts
    const restaurantsWithStats = await Promise.all(
      restaurants.map(async (restaurant) => {
        const reviewCount = await Review.countDocuments({
          restaurant: restaurant._id,
        });
        return {
          ...restaurant.toObject(),
          reviewCount,
        };
      }),
    );

    res.json({
      message: "Restaurants fetched successfully",
      restaurants: restaurantsWithStats,
    });
  } catch (error) {
    console.error("Get restaurants error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get single restaurant
// @route   GET /api/restaurants/:id
export const getRestaurantById = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id).populate(
      "owner",
      "username email",
    );

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    // Get reviews
    const reviews = await Review.find({ restaurant: restaurant._id })
      .populate("user", "username")
      .sort("-createdAt");

    // Get tables
    const tables = await Table.find({ restaurant: restaurant._id });

    res.json({
      restaurant,
      reviews,
      tables,
      reviewCount: reviews.length,
    });
  } catch (error) {
    console.error("Get restaurant error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update restaurant
// @route   PUT /api/restaurants/:id
export const updateRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    // Check ownership
    if (
      restaurant.owner.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const { name, description, address, lat, lng } = req.body;

    let existingImages = req.body.existingImages || [];

    if (!Array.isArray(existingImages)) {
      existingImages = [existingImages];
    }

    let newImages = req.files?.map((file) => file.path) || [];

    const oldImage = restaurant.images;

  const deleteImages = oldImage.filter((img) => !existingImages.includes(img));
    const getPublicId = (url) =>  {
      const part = url.split("/")
      const publicId = part[part.length - 1].split(".")[0]
      return "restaurants/" + publicId
    }

    const deletePromise = deleteImages.map((img) => {
      const publicId = getPublicId(img);
      return cloudinary.uploader.destroy(publicId)
    }) 

    await Promise.all(deletePromise)

    const imageUrls = [...existingImages, ...newImages];

    const updatedRestaurant = await Restaurant.findByIdAndUpdate(
      req.params.id,
      { name, description, address, images: imageUrls, location: { lat, lng } },
      { new: true, runValidators: true },
    );

    res.json({
      message: "Restaurant updated successfully",
      restaurant: updatedRestaurant,
    });
  } catch (error) {
    console.error("Update restaurant error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Delete restaurant
// @route   DELETE /api/restaurants/:id
export const deleteRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    // Check ownership
    if (
      restaurant.owner.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const getPublicId = (url) => {
      const part = url.split("/");
      const publicId = part[part.length - 1].split(".")[0];
      return "restaurants/" + publicId;
    };

    const deleteImages = restaurant.images.map((img) => {
      const publicId = getPublicId(img);
      return cloudinary.uploader.destroy(publicId);
    });

    await Promise.all(deleteImages);

    // Delete all associated data
    await Promise.all([
      Table.deleteMany({ restaurant: restaurant._id }),
      Review.deleteMany({ restaurant: restaurant._id }),
      restaurant.deleteOne(),
    ]);

    res.json({ message: "Restaurant deleted successfully" });
  } catch (error) {
    console.error("Delete restaurant error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Add table to restaurant
// @route   POST /api/restaurants/:restaurantId/tables
export const addTable = async (req, res) => {
  try {
    const { tableNumber, seats, location } = req.body;

    const existingTable = await Table.findOne({
      restaurant: req.params.restaurantId,
      tableNumber,
    });

    if (existingTable) {
      return res.status(400).json({ message: "Table number already exists" });
    }

    const table = await Table.create({
      restaurant: req.params.restaurantId,
      tableNumber,
      seats,
      location,
    });

    res.status(201).json({
      message: "Table created successfully",
      table,
    });
  } catch (error) {
    console.error("Add table error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get restaurant tables
// @route   GET /api/restaurants/:restaurantId/tables
export const getRestaurantTables = async (req, res) => {
  try {
    const tables = await Table.find({ restaurant: req.params.restaurantId });
    res.json(tables);
  } catch (error) {
    console.error("Get tables error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
