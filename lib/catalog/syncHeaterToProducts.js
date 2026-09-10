import { revalidatePath } from "next/cache";
import Products from "@/models/Products";
import { applyHeaterToStoveType } from "./heaterStoveLink.js";

function toPlainHeater(heater) {
  if (!heater) return heater;
  if (typeof heater.toObject === "function") {
    return heater.toObject();
  }
  return heater;
}

export async function syncHeaterToProducts({ previous, updated }) {
  const heater = toPlainHeater(updated);
  const previousHeater = toPlainHeater(previous) || heater;

  if (!heater?._id) {
    return { products: 0, options: 0, productIds: [] };
  }

  const products = await Products.find({
    stove_type: { $exists: true, $nin: [null, {}] },
  });

  let productsChanged = 0;
  let optionsChanged = 0;
  const productIds = [];

  for (const product of products) {
    try {
      const result = applyHeaterToStoveType(
        product.stove_type,
        heater,
        previousHeater
      );
      if (!result.changed) continue;

      // Avoid product.save() — unrelated schema fields (e.g. dimensions.type)
      // fail validation and would abort the whole heater sync.
      await Products.updateOne(
        { _id: product._id },
        { $set: { stove_type: result.stoveType, updatedAt: new Date() } }
      );

      productsChanged += 1;
      optionsChanged += result.matchedKeys.length;
      productIds.push(String(product._id));
    } catch (error) {
      console.error(
        `Failed to sync heater onto product ${product._id}:`,
        error
      );
    }
  }

  try {
    revalidatePath("/saunas");
    revalidatePath("/saunas/[id]", "page");
    revalidatePath("/api/products");
    for (const id of productIds) {
      revalidatePath(`/saunas/${id}`);
    }
  } catch {
    // revalidatePath is a no-op outside a Next.js request, e.g. scripts.
  }

  return {
    products: productsChanged,
    options: optionsChanged,
    productIds,
  };
}
