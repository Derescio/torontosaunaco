import { readJsonResponse } from "@/lib/http/readJsonResponse";

const apiDomain = process.env.NEXT_PUBLIC_API_DOMAIN || null;

const fetchProducts = async () => {
  try {
    if (typeof window === "undefined") {
      const { getProducts } = await import("@/lib/products/getProducts");
      return await getProducts();
    }

    if (!apiDomain) {
      return [];
    }

    const res = await fetch(`${apiDomain}/products`, {
      next: { revalidate: 7200 },
    });
    return await readJsonResponse(res, []);
  } catch (error) {
    console.error(error);
    return [];
  }
};

const fetchProduct = async (id) => {
  try {
    if (!apiDomain) {
      return null;
    }
    const res = await fetch(`${apiDomain}/products/${id}`);
    return await readJsonResponse(res, null);
  } catch (error) {
    console.error(error);
    return null;
  }
};

const fetchAccessories = async () => {
  try {
    if (!apiDomain) {
      return [];
    }
    const res = await fetch(`${apiDomain}/accessories`, {
      next: { revalidate: 3600 },
    });
    return await readJsonResponse(res, []);
  } catch (error) {
    console.error(error);
    return [];
  }
};

// Fetch Orders (forward Cookie on server so /api/orders sees the session)
const fetchOrders = async () => {
  try {
    if (!apiDomain) {
      return [];
    }
    let cookieHeader;
    if (typeof window === "undefined") {
      const { headers } = await import("next/headers");
      const h = await headers();
      cookieHeader = h.get("cookie") ?? undefined;
    }
    const res = await fetch(`${apiDomain}/orders`, {
      ...(cookieHeader ? { headers: { cookie: cookieHeader } } : {}),
      cache: "no-store",
    });
    return await readJsonResponse(res, []);
  } catch (error) {
    console.error(error);
    return [];
  }
};

// const fetchOrders = async (page = 1, limit = 10) => {
//   try {
//     if(!apiDomain) {
//       return { orders: [], totalPages: 0, currentPage: 1 };
//     }
//     const res = await fetch(`${apiDomain}/orders?page=${page}&limit=${limit}`);
//     if(!res.ok) {
//       throw new Error("Error fetching Orders");
//     }
//     const data = await res.json();
//     console.log('API DATA: ', data)
//     return data;
//   } catch (error) {
//     console.error(error);
//     return { orders: [], totalPages: 0, currentPage: 1 };
//   }
// }

// Fetch Single Order
const fetchOrder = async (id) => {
  try {
    if (!apiDomain) {
      // console.log("Something went Wrong....")
      return null;
    }
    const res = await fetch(`${apiDomain}/orders/${id}`);
    return await readJsonResponse(res, null);
  } catch (error) {
    console.error(error);
    return null;
  }
};

export {
  fetchProduct,
  fetchProducts,
  fetchAccessories,
  fetchOrders,
  fetchOrder,
};
