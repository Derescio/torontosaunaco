"use client";
import { cities, serviceAreasByRegion, getCitiesByRegion } from "@/lib/cities";
import Link from "next/link";
import { MapPin, Clock, Award, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useState, useMemo } from "react";

export default function ServiceAreasPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCities = useMemo(() => {
    if (!searchTerm) return cities;

    return cities.filter(
      (city) =>
        city.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        city.state.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-primary/5 to-background py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground text-balance mb-6">
                Our Service Areas
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto text-pretty leading-relaxed">
                We proudly serve all cities across Ontario and Canada, bringing
                professional sauna installation and expertise to your community.
              </p>
            </div>
          </div>
        </section>

        {/* Search Section */}
        <section className="py-8 bg-muted/30">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <input
                type="text"
                placeholder="Search for your city or state..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            {searchTerm && (
              <p className="text-sm text-muted-foreground mt-2">
                {filteredCities.length}{" "}
                {filteredCities.length === 1 ? "city" : "cities"} found
              </p>
            )}
          </div>
        </section>

        {/* Cities Grid */}
        <section className="py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {filteredCities.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">
                  No cities found matching "{searchTerm}"
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Try searching for a different city or state
                </p>
              </div>
            ) : searchTerm ? (
              // Show filtered results in grid
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCities.map((city) => (
                  <Link key={city.id} href={`/service-areas/${city.id}`}>
                    <Card className="h-full hover:shadow-lg transition-shadow duration-300 group">
                      <div className="aspect-video relative overflow-hidden rounded-t-lg">
                        <img
                          src={city.image || "/placeholder.svg"}
                          alt={`${city.name}, ${city.state}`}
                          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                              {city.name}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {city.state} • {city.region}
                            </p>
                          </div>
                          <MapPin className="h-5 w-5 text-primary flex-shrink-0" />
                        </div>

                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2 leading-relaxed">
                          {city.description}
                        </p>

                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            <span>{city.responseTime}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Award className="h-3.5 w-3.5" />
                            <span>{city.yearsServing} years</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              // Show organized by regions when no search
              <div className="space-y-12">
                {Object.entries(serviceAreasByRegion).map(
                  ([regionKey, regionCities]) => (
                    <div key={regionKey}>
                      <h2 className="text-2xl font-bold text-foreground mb-6 capitalize">
                        {regionKey === "core"
                          ? "Core Service Areas"
                          : regionKey === "extended"
                            ? "Extended Service Areas"
                            : regionKey === "cottageCountry"
                              ? "Cottage Country + Regions"
                              : "National Service Areas"}
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {regionCities.map((city) => (
                          <Link
                            key={city.id}
                            href={`/service-areas/${city.id}`}
                          >
                            <Card className="h-full hover:shadow-lg transition-shadow duration-300 group">
                              <div className="aspect-video relative overflow-hidden rounded-t-lg">
                                <img
                                  src={city.image || "/placeholder.svg"}
                                  alt={`${city.name}, ${city.state}`}
                                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                                />
                              </div>
                              <CardContent className="p-6">
                                <div className="flex items-start justify-between mb-3">
                                  <div>
                                    <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                                      {city.name}
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                      {city.state}
                                    </p>
                                  </div>
                                  <MapPin className="h-5 w-5 text-primary flex-shrink-0" />
                                </div>

                                <p className="text-sm text-muted-foreground mb-4 line-clamp-2 leading-relaxed">
                                  {city.description}
                                </p>

                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-3.5 w-3.5" />
                                    <span>{city.responseTime}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Award className="h-3.5 w-3.5" />
                                    <span>{city.yearsServing} years</span>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* CTA Section */}
      <section className="bg-primary/5 py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4 text-balance">
            Don't See Your City?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 text-pretty leading-relaxed">
            We're constantly expanding our service areas. Contact us to see if
            we can help you.
          </p>
          <Link
            href="/quote"
            className="bg-slate-400 inline-flex items-center justify-center rounded-lg bg-primary px-8 py-3 text-sm font-medium text-primary-foreground hover:bg-slate-300 transition-colors"
          >
            Contact Us
          </Link>
        </div>
      </section>
    </div>
  );
}
