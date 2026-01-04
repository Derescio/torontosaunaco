import { fetchProducts } from '@/assets/utils/request'

const baseUrl = 'https://www.thetorontosaunaco.com'

// Static routes based on app directory structure
const staticRoutes = [
  '',
  '/about',
  '/accessories',
  '/best-sellers',
  '/blog',
  '/cart',
  '/checkout',
  '/cold-plunge',
  '/consultation',
  '/heaters',
  '/hot-tub',
  '/quote',
  '/register',
  '/saunas',
  '/saunas/barell',
  '/saunas/canadian-timber',
  '/saunas/cube',
  '/saunas/indoor',
  '/saunas/luna',
  '/saunas/studio-6',
  '/service-areas',
  '/showers',
  '/signin',
  '/terms',
  '/thewhistlersaunaco',
  '/tubs',
  '/videos',
  '/warranty',
  '/pacifictide'
]

export default async function sitemap() {
  // Get current date for lastModified
  const currentDate = new Date()
  
  // Create static routes
  const staticSitemapEntries = staticRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: currentDate,
    changeFrequency: route === '' ? 'weekly' : route.includes('/blog') ? 'weekly' : 'monthly',
    priority: route === '' ? 1 : route === '/saunas' ? 0.9 : route.includes('/saunas/') ? 0.8 : 0.7,
  }))

  // Dynamic product routes
  let productSitemapEntries = []
  try {
    const products = await fetchProducts()
    if (products && Array.isArray(products)) {
      productSitemapEntries = products.map((product) => ({
        url: `${baseUrl}/saunas/${product._id}`,
        lastModified: currentDate,
        changeFrequency: 'monthly',
        priority: 0.6,
      }))
    }
  } catch (error) {
    console.log('Error fetching products for sitemap:', error)
    // Continue without dynamic routes if products can't be fetched
  }

  // Service area routes (common locations in Ontario/Canada)
  const serviceAreas = [
    'toronto',
    'mississauga',
    'brampton',
    'markham',
    'vaughan',
    'richmond-hill',
    'oakville',
    'burlington',
    'hamilton',
    'kitchener',
    'waterloo',
    'guelph',
    'london',
    'ottawa',
    'barrie',
    'oshawa',
    'pickering',
    'ajax',
    'whitby',
    'kingston',
    'peterborough',
    'niagara-falls',
    'st-catharines',
    'windsor',
    'sudbury',
    'thunder-bay',
    'sault-ste-marie',
    'north-bay',
    'timmins',
    'muskoka',
    'cottage-country',
    'blue-mountains',
    'collingwood',
    'wasaga-beach',
    'georgian-bay'
  ]

  const serviceAreaEntries = serviceAreas.map((area) => ({
    url: `${baseUrl}/service-areas/${area}`,
    lastModified: currentDate,
    changeFrequency: 'monthly',
    priority: 0.5,
  }))

  // Product category combinations for better SEO coverage
  const productCategories = [
    '/accessories/sauna-rocks',
    '/accessories/thermometer',
    '/accessories/bucket-and-ladle',
    '/accessories/essential-oils',
    '/cold-plunge/outdoor',
    '/cold-plunge/indoor',
    '/heaters/electric',
    '/heaters/wood-burning',
    '/hot-tub/outdoor',
    '/showers/outdoor',
    '/showers/cedar'
  ]

  const categoryEntries = productCategories.map((category) => ({
    url: `${baseUrl}${category}`,
    lastModified: currentDate,
    changeFrequency: 'monthly',
    priority: 0.6,
  }))

  // Combine all entries
  return [
    ...staticSitemapEntries,
    ...productSitemapEntries,
    ...serviceAreaEntries,
    ...categoryEntries
  ]
}