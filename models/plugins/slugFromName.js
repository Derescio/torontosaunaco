import { slugify } from "../../assets/utils/slugify.js";

// Adds a URL slug to a schema, filled from `name` on save when empty (the same rule as models/Heaters.js).
// The field is additive and sparse, so documents without a slug keep working.

/** pre("save") hook: slugify(name), with -1, -2… while another document already has that slug. */
export async function assignSlug() {
  if (this.slug || !this.name) return;

  const base = slugify(this.name);
  if (!base) return;

  const Model = this.constructor;
  let candidate = base;
  let counter = 1;
  while (await Model.findOne({ slug: candidate, _id: { $ne: this._id } }).lean()) {
    candidate = `${base}-${counter}`;
    counter += 1;
  }
  this.slug = candidate;
}

export function slugFromName(schema) {
  schema.add({
    slug: { type: String, unique: true, sparse: true, trim: true, lowercase: true },
  });
  schema.pre("save", assignSlug);
}
