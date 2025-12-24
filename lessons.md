# Lessons Learned

## 2024-12-24: Production Server Component Error on Product Pages

### Problem
After deploying to Vercel, clicking on any sauna product from `/saunas` resulted in a cryptic error:
```
Uncaught Error: An error occurred in the Server Components render. The specific message is omitted in production builds to avoid leaking sensitive details.
```

In development, the actual error was revealed:
```
Error: Invalid OpenGraph type: product
```

### Root Causes

1. **Invalid OpenGraph Type**: Next.js metadata API does not accept `type: "product"` for OpenGraph. Valid types are: `website`, `article`, `book`, `profile`, etc.

2. **Wrong Domain URL**: The codebase had inconsistent URLs - some using `www.torontosaunaco.com` and others using `www.thetorontosaunaco.com` (the correct domain with "the").

3. **Unsafe `product.features` Spread**: The JSON-LD generation used `...(product.features && {...})` which could fail if `features` existed but wasn't an array.

### Fixes Applied

1. **Changed OpenGraph type from `"product"` to `"website"`** in `app/saunas/[id]/page.jsx`:
   ```javascript
   // WRONG
   type: "product",
   
   // CORRECT
   type: "website",
   ```

2. **Updated all URLs to use the correct domain** (`www.thetorontosaunaco.com`) in:
   - `app/page.js`
   - `app/saunas/[id]/page.jsx`
   - (Note: `app/saunas/page.jsx` already had the correct URL)

3. **Made `product.features` handling defensive**:
   ```javascript
   // BEFORE (could crash if features is not an array)
   ...(product.features && {
     additionalProperty: product.features.map(...)
   })
   
   // AFTER (safe)
   ...(Array.isArray(product.features) && product.features.length > 0 && {
     additionalProperty: product.features.map(...)
   })
   ```

### Key Takeaways

- **Production hides error details**: Always test in development first to see actual error messages.
- **OpenGraph types are limited**: For product pages, use `type: "website"` and rely on JSON-LD structured data for product SEO.
- **Consistent URLs matter**: Ensure all metadata URLs match your actual domain.
- **Defensive coding**: Always check array types before calling `.map()` on data from the database.

