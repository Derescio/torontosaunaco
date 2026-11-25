import { Schema, model, models } from "mongoose";
import { slugFromName } from "./plugins/slugFromName.js";

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
      type: { type: String }, // "exterior", "interior" — nested `type` must be wrapped
    },
    // Optional size variants (e.g., Barrel 7x6 / 7x7 / 7x8) with per-wood pricing
    // Example:
    // sizes: [
    //   { key: "7x6", label: "7’ x 6’", priceByWood: { "Knotty Cedar": 15350, "Clear Cedar": 23959 } },
    //   { key: "7x7", label: "7’ x 7’", priceByWood: { "Knotty Cedar": 15950, "Clear Cedar": 25027 } }
    // ]
    sizes: [
      new Schema(
        {
          key: { type: String },
          label: { type: String },
          priceByWood: { type: Map, of: Number },
        },
        { _id: false }
      ),
    ],
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
    // Stove/heater options shown on the product. Keys are display names.
    // Linked heaters store heaterId + priceOffset so catalog heater edits
    // can update every associated product (price = heater.basePrice + priceOffset).
    stove_type: {
      type: Schema.Types.Mixed,
      // Object: { "Huum Drop 9kW with Remote": { heaterId, price, priceOffset, image } }
    },
    // Optional sample video URL for product preview
    video: {
      type: String,
    },
    // Multiple product documents (e.g., spec sheets, install guides)
    documents: [
      new Schema(
        {
          label: { type: String },
          url: { type: String },
        },
        { _id: false }
      ),
    ],
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

ProductsSchema.plugin(slugFromName);

const Products = models.Products || model("Products", ProductsSchema);

export default Products;
