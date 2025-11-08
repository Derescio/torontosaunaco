import { Schema, model, models } from "mongoose";

const ProductsSchema = new Schema(
  {
    owner: {
      type: String,
      // required: true,
      ref: "User",
    },
    name: {
      type: String,
      // required: true
    },
    type: {
      type: String,
      // required: true
    },
    collectionType: {
      type: String,
      // required: true
    },
    series: {
      type: String,
      // required: true
    },
    description: {
      type: String,
      // required: true
    },
    // Base cost/price of the product
    price: {
      type: Number,
      // required: true
    },
    // Base cost (alternative name for price, for new format)
    baseCost: {
      type: Number,
    },
    // Dimensions - can be string (legacy) or structured object (new format)
    dimension: {
      type: Schema.Types.Mixed,
      // Can be: "68 x 68 (in)" or { width: 72, depth: 60, height: 93, unit: "in", type: "exterior" }
    },
    // Structured dimensions object (new format)
    dimensions: {
      width: Number,
      depth: Number,
      height: Number,
      unit: String, // "in", "cm", etc.
      type: String, // "exterior", "interior"
    },
    // Features as bullet points array (new format)
    features: [
      {
        type: String,
      },
    ],
    views: {
      type: Object,
      default: {},
    },
    // Wood type options with prices
    wood_type: {
      type: Schema.Types.Mixed,
      // Can be Object with keys like "Knotty Cedar": { price: 0, image: "..." }
      // or Array: [{ name: "Knotty Cedar", price: 0, image: "..." }]
    },
    // Stove type options with prices and configurations
    stove_type: {
      type: Schema.Types.Mixed,
      // Can be Object with keys like "Huum Drop 9kW": { price: 3307, remote: true, wifi: false }
      // or Array: [{ name: "Huum Drop 9kW", price: 3307, remote: true, wifi: false, power: "9kW", image: "..." }]
    },
    // Additional upgrades/features with prices (new format)
    additional_upgrades: [
      {
        name: String,
        price: Number,
        description: String,
        image: String,
      },
    ],
    additonal_features: {
      type: Schema.Types.Mixed,
    },
    // Delivery cost (new format)
    delivery: {
      cost: Number,
      included: Boolean,
      description: String,
    },
    // Installation options with costs
    installation: {
      type: Schema.Types.Mixed,
      // Can be Object with keys like "DIY": { price: 0 } or "Professional Install": { price: 1750 }
      // or Array: [{ type: "DIY", price: 0 }, { type: "Professional Install", price: 1750 }]
    },
    seller_info: {
      name: {
        type: String,
        // required: true
      },
      email: {
        type: String,
        // required: true
      },
      phone: {
        type: String,
        // required: true
      },
    },
    images: [
      {
        type: String,
        // required: true
      },
    ],
    is_featured: {
      type: Boolean,
      default: false,
    },
    // Merchandising order for stable sorting on category pages (lower = earlier)
    displayOrder: {
      type: Number,
      default: 999,
      index: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Products = models.Products || model("Products", ProductsSchema);

export default Products;
