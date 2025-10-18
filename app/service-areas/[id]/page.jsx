import { cities, getCityById } from "@/lib/cities";
import { notFound } from "next/navigation";
import { MapPin, Clock, Award, CheckCircle, Phone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const city = getCityById(id);

  if (!city) {
    return {
      title: "City Not Found",
    };
  }

  return {
    title:
      city.metaTitle ||
      `${city.name} Sauna Co. | Outdoor & Backyard Saunas for Sale in ${city.name}`,
    description:
      city.metaDescription ||
      `Canadian-made cedar outdoor saunas, barrel saunas, and backyard saunas for sale in ${city.name}. Premium cedar outdoor and backyard saunas. Designed, delivered, and installed across ${city.state}.`,
    keywords: `sauna ${city.name}, outdoor sauna ${city.name}, backyard sauna ${city.name}, cedar sauna ${city.name}, barrel sauna ${city.name}, sauna installation ${city.name}`,
  };
}

export async function generateStaticParams() {
  return cities.map((city) => ({
    id: city.id,
  }));
}

export default async function CityPage({ params }) {
  const { id } = await params;
  const city = getCityById(id);

  if (!city) {
    notFound();
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* <Navbar /> */}

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative h-[400px] overflow-hidden">
          <img
            src={city.image || "/placeholder.svg"}
            alt={`${city.name}, ${city.state}`}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#FEFEFE] via-[#FEFEFE]/5 to-[#FEFEFE]/5" />
          <div className="relative h-full mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-end pb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="h-6 w-6 text-primary" />
                <span className="text-sm font-medium text-muted-foreground">
                  {city.state}
                </span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-4 text-balance">
                {city.name}
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl text-pretty leading-relaxed">
                Population: {city.population}
              </p>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                <div>
                  <h2 className="text-3xl font-bold text-foreground mb-4">
                    About Our {city.name} Services
                  </h2>
                  <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                    {city.description}
                  </p>

                  {city.localAreas && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        Areas We Serve
                      </h3>
                      <p className="text-muted-foreground">
                        From {city.localAreas.slice(0, 2).join(" to ")} and
                        surrounding communities
                      </p>
                    </div>
                  )}

                  {city.climateFeatures && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        Built for Your Climate
                      </h3>
                      <p className="text-muted-foreground">
                        {city.climateFeatures}
                      </p>
                    </div>
                  )}
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Services We Offer</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {city.services.map((service, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                          <span className="text-foreground">{service}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {city.whyChooseUs && (
                  <Card>
                    <CardHeader>
                      <CardTitle>
                        Why {city.name} Homeowners Choose Us
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {city.whyChooseUs.map((reason, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                            <span className="text-foreground">{reason}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                <Card>
                  <CardHeader>
                    <CardTitle>Local Expertise in {city.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">
                        Years of Service
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        Our team has been serving {city.name} for{" "}
                        {city.yearsServing} years, giving us deep knowledge of
                        local needs and challenges.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">
                        Fast Response
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        We pride ourselves on our {city.responseTime} average
                        response time, ensuring you get help when you need it
                        most.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">
                        Quality Guaranteed
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        Every job is backed by our satisfaction guarantee and
                        performed by certified professionals.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <Card className="bg-primary text-primary-foreground">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-4">
                      Get Service Today
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Clock className="h-5 w-5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold">Response Time</p>
                          <p className="text-sm opacity-90">
                            {city.responseTime}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Award className="h-5 w-5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold">Experience</p>
                          <p className="text-sm opacity-90">
                            {city.yearsServing} years serving {city.name}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="h-5 w-5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold">Call Now</p>
                          <p className="text-sm opacity-90">(437) 429-6623</p>
                        </div>
                      </div>
                    </div>
                    <Link
                      href="/contact"
                      className="bg-slate-700 mt-6 w-full inline-flex items-center justify-center rounded-lg bg-background text-white px-6 py-3 text-sm font-medium hover:bg-slate-500/60 hover:text-black transition-colors"
                    >
                      Request Service
                    </Link>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Service Area Coverage</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                      We serve {city.name} and surrounding communities within a
                      30-mile radius.
                    </p>
                    <Link
                      href="/service-areas"
                      className="text-sm text-primary hover:underline font-medium"
                    >
                      View All Service Areas →
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Related Cities */}
        {/* <section className="bg-muted/30 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-foreground mb-8">
              Other Cities We Serve
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {cities
                .filter((c) => c.id !== city.id)
                .slice(0, 12)
                .map((relatedCity) => (
                  <Link
                    key={relatedCity.id}
                    href={`/service-areas/${relatedCity.id}`}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {relatedCity.name}, {relatedCity.state}
                  </Link>
                ))}
            </div>
          </div>
        </section> */}
      </main>

      {/* <Footer /> */}
    </div>
  );
}
