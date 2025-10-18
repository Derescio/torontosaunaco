// Service Areas Data - The Toronto Sauna Co.
// Organized by regions with rich content and SEO metadata

const serviceAreas = {
  core: [
    {
      id: "toronto",
      name: "Toronto",
      state: "ON",
      region: "Core Service Areas",
      population: "7.1M",
      description:
        "Toronto homeowners know the value of relaxation and design. Toronto Sauna Co. offers premium outdoor saunas, barrel saunas, and backyard saunas for sale, all handcrafted in Canada using Western Red Cedar.",
      metaTitle:
        "Toronto Sauna Co. | Outdoor & Backyard Saunas for Sale in Toronto",
      metaDescription:
        "Premium Canadian-made cedar saunas — outdoor, backyard, and barrel saunas for sale in Toronto. Delivered and installed across the GTA.",
      localAreas: [
        "GTA",
        "Downtown Toronto",
        "North York",
        "Scarborough",
        "Etobicoke",
      ],
      climateFeatures:
        "Built to perform in Ontario's four seasons while complementing your property's modern style",
      services: [
        "Outdoor Sauna Installation",
        "Backyard Sauna Design",
        "Barrel Sauna Options",
        "GTA Delivery & Installation",
        "Four-Season Performance",
        "Modern Cube & Traditional Barrel Styles",
      ],
      whyChooseUs: [
        "Canadian-made Western Red Cedar saunas for sale",
        "Outdoor and backyard sauna options with glass or wood finishes",
        "Barrel saunas ideal for compact spaces",
        "Delivery and professional installation across the GTA",
      ],
      responseTime: "24-48 hours",
      yearsServing: 8,
      image: "/images/toronto.jpg",
    },
    {
      id: "vaughan",
      name: "Vaughan",
      state: "ON",
      region: "Core Service Areas",
      population: "323K",
      description:
        "Vaughan Sauna Store brings wellness home with modern outdoor saunas and barrel saunas built for Ontario's climate. Handcrafted from Western Red Cedar, our backyard saunas are designed to endure every season.",
      metaTitle:
        "Vaughan Sauna Store | Outdoor & Backyard Saunas for Sale in Vaughan",
      metaDescription:
        "Premium cedar outdoor and backyard saunas for sale in Vaughan. Designed, delivered, and installed across York Region.",
      localAreas: ["Woodbridge", "Kleinburg", "Maple", "Thornhill", "Concord"],
      climateFeatures:
        "Built for four-season use with weather-resistant materials",
      services: [
        "Modern Outdoor Saunas",
        "Backyard Sauna Installation",
        "Barrel Sauna Options",
        "York Region Delivery",
        "Custom Heaters & Controls",
        "Cold Plunge Add-ons",
      ],
      whyChooseUs: [
        "Modern outdoor and backyard saunas for sale",
        "Barrel sauna and cube options built for four-season use",
        "Locally delivered and installed across Vaughan",
        "Custom heaters, cold plunges, and smart controls available",
      ],
      responseTime: "24-48 hours",
      yearsServing: 6,
      image: "/images/vaughan.jpg",
    },
    {
      id: "richmond-hill",
      name: "Richmond Hill",
      state: "ON",
      region: "Core Service Areas",
      population: "202K",
      description:
        "Richmond Hill Sauna Store delivers handcrafted outdoor saunas that combine natural cedar craftsmanship with modern design. Our backyard saunas for sale are insulated, stylish, and built for four-season use.",
      metaTitle:
        "Richmond Hill Sauna Store | Outdoor & Backyard Saunas for Sale in Richmond Hill",
      metaDescription:
        "Canadian-made cedar outdoor saunas, barrel saunas, and backyard saunas for sale in Richmond Hill.",
      localAreas: [
        "Bayview",
        "Bathurst",
        "Yonge Street",
        "Oak Ridges",
        "Elgin Mills",
      ],
      climateFeatures: "Built in Canada to perform in all weather conditions",
      services: [
        "Outdoor Sauna Installation",
        "Backyard Sauna Design",
        "Barrel Sauna Options",
        "York Region Service",
        "Four-Season Performance",
        "Professional Installation",
      ],
      whyChooseUs: [
        "Outdoor and backyard saunas built from Western Red Cedar",
        "Barrel sauna and cube options",
        "Installation and service across York Region",
        "Locally built, nationally recognized",
      ],
      responseTime: "24-48 hours",
      yearsServing: 5,
      image: "/images/RichmondHill-Feature.jpg",
    },
    {
      id: "markham",
      name: "Markham",
      state: "ON",
      region: "Core Service Areas",
      population: "338K",
      description:
        "Markham Sauna Store builds and installs outdoor saunas and home saunas tailored to modern living. Our backyard saunas for sale feature Western Red Cedar construction, glass-front options, and WiFi-controlled heating systems.",
      metaTitle:
        "Markham Sauna Store | Outdoor & Backyard Saunas for Sale in Markham",
      metaDescription:
        "Outdoor and backyard saunas, barrel saunas, and home saunas for sale in Markham. Canadian-made and professionally installed.",
      localAreas: [
        "Unionville",
        "Greensborough",
        "Thornhill",
        "Milliken",
        "Cornell",
      ],
      climateFeatures: "Built to perform in every season with modern design",
      services: [
        "Outdoor Sauna Installation",
        "Home Sauna Design",
        "Backyard Sauna Options",
        "WiFi-Controlled Heating",
        "Glass-Front Options",
        "Professional Installation",
      ],
      whyChooseUs: [
        "Outdoor and home saunas handcrafted in Canada",
        "Barrel and cube sauna options",
        "Delivered and installed across Markham",
        "Built to perform in every season",
      ],
      responseTime: "24-48 hours",
      yearsServing: 7,
      image: "/images/View_to_Hamilton_from_the_Mountain_(6577549603).jpg",
    },
    {
      id: "aurora",
      name: "Aurora",
      state: "ON",
      region: "Core Service Areas",
      population: "62K",
      description:
        "Aurora Sauna Store specializes in modern outdoor saunas and barrel saunas crafted for Aurora's four-season lifestyle. Each sauna for sale is built in Canada with durable cedar, designed for relaxation, longevity, and year-round comfort.",
      metaTitle:
        "Aurora Sauna Store | Outdoor & Backyard Saunas for Sale in Aurora",
      metaDescription:
        "Handcrafted outdoor and backyard saunas for sale in Aurora. Premium cedar barrel and home saunas delivered across York Region.",
      localAreas: ["Aurora", "Newmarket", "King City", "Schomberg"],
      climateFeatures:
        "Built for four-season performance with durable cedar construction",
      services: [
        "Outdoor Sauna Installation",
        "Barrel Sauna Options",
        "Backyard Sauna Design",
        "York Region Delivery",
        "Cold Plunge Pairing",
        "WiFi Heater Setup",
      ],
      whyChooseUs: [
        "Cedar saunas built for four-season performance",
        "Outdoor, backyard, and barrel sauna models available",
        "Local delivery and expert installation",
        "Optional cold plunge pairing and WiFi heater setup",
      ],
      responseTime: "24-48 hours",
      yearsServing: 4,
      image: "/images/aurora.jpg",
    },
    {
      id: "newmarket",
      name: "Newmarket",
      state: "ON",
      region: "Core Service Areas",
      population: "87K",
      description:
        "Newmarket Sauna Store offers beautifully designed outdoor saunas and backyard barrel saunas handcrafted from Western Red Cedar. Each sauna for sale is insulated, durable, and made to perform through Ontario winters.",
      metaTitle:
        "Newmarket Sauna Store | Outdoor & Backyard Saunas for Sale in Newmarket",
      metaDescription:
        "Premium cedar outdoor and backyard saunas, barrel saunas, and home saunas for sale in Newmarket.",
      localAreas: [
        "Newmarket",
        "Aurora",
        "East Gwillimbury",
        "Holland Landing",
      ],
      climateFeatures:
        "Made to perform through Ontario winters with superior insulation",
      services: [
        "Outdoor Sauna Installation",
        "Backyard Barrel Saunas",
        "Home Sauna Options",
        "York Region Service",
        "Four-Season Performance",
        "Professional Installation",
      ],
      whyChooseUs: [
        "Outdoor and backyard saunas built for longevity",
        "Barrel sauna and cube options available",
        "Delivery and setup across Newmarket and York Region",
        "Built in Canada using sustainable cedar",
      ],
      responseTime: "24-48 hours",
      yearsServing: 5,
      image: "/images/newmarket.jpg",
    },
  ],

  extended: [
    {
      id: "barrie",
      name: "Barrie",
      state: "ON",
      region: "Extended Service Areas",
      population: "147K",
      description:
        "Barrie Sauna Store builds outdoor saunas, barrel saunas, and home saunas that bring the luxury of a spa to your backyard. Designed for Ontario's changing weather, our saunas for sale are handcrafted from cedar and built to last.",
      metaTitle:
        "Barrie Sauna Store | Outdoor & Backyard Saunas for Sale in Barrie",
      metaDescription:
        "Outdoor, backyard, and barrel saunas for sale in Barrie. Canadian-made cedar saunas designed for four-season relaxation.",
      localAreas: [
        "Kempenfelt Bay",
        "Downtown Barrie",
        "Innisfil",
        "Oro-Medonte",
      ],
      climateFeatures:
        "Designed for Ontario's changing weather with cedar construction",
      services: [
        "Outdoor Sauna Installation",
        "Barrel Sauna Options",
        "Home Sauna Design",
        "Simcoe County Service",
        "Four-Season Performance",
        "Full-Service Delivery & Setup",
      ],
      whyChooseUs: [
        "Outdoor and backyard saunas crafted for four seasons",
        "Barrel sauna designs ideal for compact spaces",
        "Local delivery and install service",
        "Canadian-made quality you can trust",
      ],
      responseTime: "48-72 hours",
      yearsServing: 6,
      image: "/images/barrie.jpg",
    },
    {
      id: "mississauga",
      name: "Mississauga",
      state: "ON",
      region: "Extended Service Areas",
      population: "721K",
      description:
        "From Port Credit to Streetsville, Mississauga Sauna Co. brings wellness home with handcrafted outdoor saunas and backyard saunas for sale. Each barrel sauna and home sauna is made in Canada using Western Red Cedar for warmth, strength, and style.",
      metaTitle:
        "Mississauga Sauna Store | Outdoor & Backyard Saunas for Sale in Mississauga",
      metaDescription:
        "Outdoor, backyard, and barrel saunas for sale in Mississauga. Premium Canadian-made cedar saunas built for all-season use.",
      localAreas: [
        "Port Credit",
        "Streetsville",
        "Meadowvale",
        "Erin Mills",
        "Clarkson",
      ],
      climateFeatures:
        "Built for all-season use with Western Red Cedar construction",
      services: [
        "Outdoor Sauna Installation",
        "Backyard Sauna Design",
        "Barrel Sauna Options",
        "Peel Region Delivery",
        "WiFi Heater Controls",
        "Cold Plunge Add-ons",
      ],
      whyChooseUs: [
        "Cedar outdoor and backyard saunas for sale",
        "Modern cube and barrel sauna designs",
        "Local delivery & professional installation",
        "WiFi heater and cold-plunge add-ons available",
      ],
      responseTime: "24-48 hours",
      yearsServing: 7,
      image: "/images/mississauga1.jpg",
    },
    {
      id: "oakville",
      name: "Oakville",
      state: "ON",
      region: "Extended Service Areas",
      population: "213K",
      description:
        "Oakville homeowners appreciate refined design. Oakville Sauna Co. delivers handcrafted outdoor saunas and barrel saunas that blend seamlessly with lakeside living. Each sauna for sale is insulated, weather-resistant, and built to complement modern architecture.",
      metaTitle:
        "Oakville Sauna Store | Outdoor & Backyard Saunas for Sale in Oakville",
      metaDescription:
        "Handcrafted cedar outdoor and backyard saunas, barrel saunas, and home saunas for sale in Oakville.",
      localAreas: [
        "Bronte",
        "Glen Abbey",
        "Downtown Oakville",
        "Iroquois Ridge",
      ],
      climateFeatures:
        "Built to complement modern architecture with weather-resistant materials",
      services: [
        "Outdoor Sauna Installation",
        "Backyard Sauna Design",
        "Barrel Sauna Options",
        "Halton Region Service",
        "Custom Finishing",
        "Smart Control Options",
      ],
      whyChooseUs: [
        "Premium cedar outdoor and backyard saunas",
        "Barrel & cube designs built for four seasons",
        "Local delivery and installation in Halton Region",
        "Custom finishing and smart-control options",
      ],
      responseTime: "24-48 hours",
      yearsServing: 5,
      image: "/images/oakville1.jpg",
    },
    {
      id: "burlington",
      name: "Burlington",
      state: "ON",
      region: "Extended Service Areas",
      population: "186K",
      description:
        "From Aldershot to Millcroft, Burlington Sauna Co. provides premium outdoor saunas and backyard saunas for sale that combine beauty with durability. Built from Western Red Cedar, every unit delivers year-round performance.",
      metaTitle:
        "Burlington Sauna Store | Outdoor & Backyard Saunas for Sale in Burlington",
      metaDescription:
        "Cedar outdoor saunas, backyard saunas, and barrel saunas for sale in Burlington. Built in Canada for four-season living.",
      localAreas: ["Aldershot", "Millcroft", "Downtown Burlington", "Alton"],
      climateFeatures:
        "Built from Western Red Cedar for year-round performance",
      services: [
        "Outdoor Sauna Installation",
        "Backyard Sauna Design",
        "Barrel Sauna Options",
        "Halton Region Service",
        "Cold Plunge Options",
        "WiFi Heaters",
      ],
      whyChooseUs: [
        "Outdoor & backyard saunas built in Canada",
        "Barrel and cube styles for any property size",
        "Delivery and setup across Halton Region",
        "Optional cold plunge and WiFi heaters",
      ],
      responseTime: "24-48 hours",
      yearsServing: 4,
      image: "/images/burlington1.jpg",
    },
  ],

  cottageCountry: [
    {
      id: "muskoka",
      name: "Muskoka",
      state: "ON",
      region: "Cottage Country + Regions",
      population: "90K",
      description:
        "Muskoka is known for its natural beauty, rocky shorelines, towering pines, and lakes that call for quiet moments of restoration. At The Toronto Sauna Co., we design and install handcrafted cedar saunas built for cottage life and all four Ontario seasons.",
      metaTitle: "Saunas in Muskoka | Outdoor & Cottage Saunas Muskoka",
      metaDescription:
        "Canadian-made cedar saunas built for Muskoka living. Modern outdoor sauna installation for lakefront cottages and year-round retreats.",
      localAreas: [
        "Lake Rosseau",
        "Lake Joseph",
        "Lake Muskoka",
        "Gravenhurst",
        "Bracebridge",
        "Huntsville",
      ],
      climateFeatures:
        "Engineered for humidity, snow, and lakeside weather with premium Western Red Cedar",
      services: [
        "Cottage Sauna Installation",
        "Lakefront Sauna Design",
        "Remote Property Delivery",
        "Island Access Installation",
        "Four-Season Performance",
        "Panoramic Glass Options",
      ],
      whyChooseUs: [
        "Premium Western Red Cedar construction",
        "Weatherproof, insulated builds for four-season use",
        "Delivery and installation to remote or island-access properties",
        "Options for glass fronts, WiFi heaters, and cold plunges",
      ],
      responseTime: "72-96 hours",
      yearsServing: 10,
      image: "/images/muskoka.jpg",
    },
    {
      id: "haliburton",
      name: "Haliburton",
      state: "ON",
      region: "Cottage Country + Regions",
      population: "18K",
      description:
        "In the heart of Ontario's Highlands, Haliburton offers rugged landscapes and peaceful lakeside escapes — the perfect setting for an outdoor sauna. The Toronto Sauna Co. brings modern, handcrafted cedar saunas to Haliburton properties, built for all-season use and timeless enjoyment.",
      metaTitle:
        "Haliburton Sauna Store | Outdoor & Cottage Sauna Installation Haliburton",
      metaDescription:
        "Modern cedar saunas delivered and installed in Haliburton. Built for cottages, cabins, and lakefront properties.",
      localAreas: [
        "Kashagawigamog Lake",
        "Drag Lake",
        "Haliburton Village",
        "Minden",
      ],
      climateFeatures:
        "Designed to withstand harsh winters while maintaining natural warmth and scent of cedar",
      services: [
        "Cottage Sauna Installation",
        "Lakefront Property Service",
        "Remote Location Delivery",
        "Four-Season Performance",
        "WiFi Heater Controls",
        "Panoramic Glass Options",
      ],
      whyChooseUs: [
        "Canadian-made Western Red Cedar builds",
        "Modern design with weather-ready materials",
        "Delivered and installed to rural and waterfront properties",
        "Optional upgrades like WiFi heater controls and panoramic glass",
      ],
      responseTime: "72-96 hours",
      yearsServing: 8,
      image: "/images/haliburton.jpg",
    },
    {
      id: "kawarthas",
      name: "Kawarthas",
      state: "ON",
      region: "Cottage Country + Regions",
      population: "75K",
      description:
        "From Bobcaygeon to Fenelon Falls, Kawartha Sauna Co. creates outdoor saunas that bring spa-level relaxation to cottage life. Each sauna for sale is built in Canada with durable cedar and weather-proof details.",
      metaTitle:
        "Kawartha Sauna Store | Outdoor & Backyard Saunas for Sale in the Kawarthas",
      metaDescription:
        "Handcrafted cedar outdoor and barrel saunas for sale throughout the Kawartha Lakes region.",
      localAreas: [
        "Bobcaygeon",
        "Fenelon Falls",
        "Lindsay",
        "Peterborough",
        "Lakefield",
      ],
      climateFeatures:
        "Built in Canada with durable cedar and weather-proof details",
      services: [
        "Cottage Sauna Installation",
        "Outdoor Sauna Design",
        "Barrel Sauna Options",
        "Kawartha Lakes Service",
        "Freight Delivery",
        "Local Install Support",
      ],
      whyChooseUs: [
        "Outdoor & backyard saunas for cottages and homes",
        "Barrel saunas built for small spaces",
        "Freight delivery & local install support",
        "Canadian-made craftsmanship and design",
      ],
      responseTime: "72-96 hours",
      yearsServing: 7,
      image: "/images/kawarthas.jpg",
    },
    {
      id: "collingwood",
      name: "Collingwood & Blue Mountain",
      state: "ON",
      region: "Cottage Country + Regions",
      population: "30K",
      description:
        "In Collingwood and Blue Mountain, wellness meets adventure - ski in the morning, unwind in your sauna at night. The Toronto Sauna Co. designs and installs premium cedar saunas that fit the modern mountain lifestyle perfectly.",
      metaTitle:
        "Collingwood Sauna Store | Outdoor & Backyard Saunas for Sale in Collingwood & Blue Mountain",
      metaDescription:
        "Outdoor, backyard, and barrel saunas for sale in Collingwood and Blue Mountain. Canadian-made saunas built for four-season use.",
      localAreas: ["Georgian Bay", "Blue Mountain", "Collingwood", "Thornbury"],
      climateFeatures:
        "Built to withstand wind, snow, and moisture without compromising on modern aesthetics",
      services: [
        "Mountain Sauna Installation",
        "Four-Season Performance",
        "Georgian Bay Service",
        "Modern Glass Design",
        "WiFi Heater Options",
        "Cold Plunge Pairings",
      ],
      whyChooseUs: [
        "Handcrafted Western Red Cedar construction",
        "Modern, glass-forward design ideal for cottage and chalet settings",
        "Delivery and installation across Collingwood, Blue Mountain, and Georgian Bay",
        "Options for WiFi heaters, cold plunges, and custom finishes",
      ],
      responseTime: "72-96 hours",
      yearsServing: 6,
      image: "/images/collingwood.jpg",
    },
  ],

  national: [
    {
      id: "vancouver",
      name: "Vancouver",
      state: "BC",
      region: "National Service Areas",
      population: "3.1M",
      description:
        "From Kitsilano to North Van, Vancouver Sauna Co. creates outdoor saunas and backyard saunas that complement the West Coast's wellness culture. Built from Western Red Cedar, our saunas for sale are designed to handle the city's humid air and rainy climate.",
      metaTitle:
        "Vancouver Sauna Store | Outdoor & Backyard Saunas for Sale in Vancouver",
      metaDescription:
        "Handcrafted outdoor saunas, backyard saunas, and barrel saunas for sale in Vancouver. Canadian-made cedar saunas built for coastal living.",
      localAreas: [
        "Kitsilano",
        "North Vancouver",
        "West Vancouver",
        "Richmond",
        "Burnaby",
      ],
      climateFeatures:
        "Designed to handle the city's humid air and rainy climate while offering timeless warmth and style",
      services: [
        "Coastal Sauna Installation",
        "Weatherproof Construction",
        "BC Delivery & Installation",
        "Modern Design Options",
        "WiFi Heater Systems",
        "Freight Delivery Support",
      ],
      whyChooseUs: [
        "Weatherproof cedar outdoor saunas for coastal climates",
        "Backyard and barrel sauna models in multiple sizes",
        "Sleek modern designs with WiFi heater options",
        "Freight delivery & installation support across BC",
      ],
      responseTime: "7-10 days",
      yearsServing: 3,
      image: "/images/vancouver.jpg",
    },
    {
      id: "calgary",
      name: "Calgary",
      state: "AB",
      region: "National Service Areas",
      population: "1.3M",
      description:
        "Calgary Sauna Store brings warmth and relaxation to Alberta's changing seasons. Our outdoor saunas and backyard saunas are built from Western Red Cedar and engineered for performance in extreme cold and summer heat.",
      metaTitle:
        "Calgary Sauna Store | Outdoor & Backyard Saunas for Sale in Calgary",
      metaDescription:
        "Outdoor, backyard, and barrel saunas for sale in Calgary. Canadian-made cedar saunas built for Alberta's cold winters and warm summers.",
      localAreas: ["Mahogany", "Aspen Woods", "Springbank", "Downtown Calgary"],
      climateFeatures:
        "Engineered for performance in extreme cold and summer heat",
      services: [
        "Alberta Sauna Installation",
        "Extreme Weather Performance",
        "Province-Wide Delivery",
        "Smart WiFi Controls",
        "Cold Plunge Pairings",
        "Four-Season Design",
      ],
      whyChooseUs: [
        "Insulated cedar construction built for Alberta weather",
        "Modern outdoor and backyard sauna designs",
        "Delivery and setup available province-wide",
        "Smart WiFi heater controls and cold plunge pairings",
      ],
      responseTime: "7-10 days",
      yearsServing: 2,

      image: "/images/calgary.jpg",
    },
    {
      id: "ottawa",
      name: "Ottawa",
      state: "ON",
      region: "National Service Areas",
      population: "800k",
      description:
        "Ottawa Sauna Store designs and delivers outdoor saunas and backyard saunas that suit the capital's four-season lifestyle. From Kanata to Orleans, our saunas for sale are built from Western Red Cedar and engineered for warmth, comfort, and design.",
      metaTitle:
        "Ottawa Sauna Store | Outdoor & Backyard Saunas for Sale in Ottawa",
      metaDescription:
        "Outdoor, backyard, and barrel saunas for sale in Ottawa. Canadian-made cedar saunas built for four-season use across the NCR.",
      localAreas: [
        "Kanata",
        "Orleans",
        "Downtown Ottawa",
        "Nepean",
        "Barrhaven",
      ],
      climateFeatures:
        "Engineered for warmth, comfort, and design in four-season climate",
      services: [
        "NCR Sauna Installation",
        "Four-Season Performance",
        "Urban & Suburban Service",
        "Full Delivery & Install",
        "Durable Cedar Construction",
        "Insulated Interiors",
      ],
      whyChooseUs: [
        "Handcrafted outdoor & backyard saunas for sale",
        "Barrel and cube models designed for urban and suburban lots",
        "Built in Canada with durable cedar and insulated interiors",
        "Full delivery & install support across the National Capital Region",
      ],
      responseTime: "48-72 hours",
      yearsServing: 4,
      image: "/images/ottawa.jpg",
    },
  ],
};

// Flatten all cities into a single array for backward compatibility
export const cities = [
  ...serviceAreas.core,
  ...serviceAreas.extended,
  ...serviceAreas.cottageCountry,
  ...serviceAreas.national,
];

// Export organized data
export const serviceAreasByRegion = serviceAreas;

// Helper functions
export function getCityById(id) {
  return cities.find((city) => city.id === id);
}

export function getCitiesByRegion(region) {
  return cities.filter((city) => city.region === region);
}

export function getCityNames() {
  return cities.map((city) => `${city.name}, ${city.state}`);
}

export function getRegions() {
  return Object.keys(serviceAreas);
}

export function getCitiesCount() {
  return cities.length;
}
