import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import BeforeAfterSlider from "@/components/custom-builds/BeforeAfterSlider";
import CustomBuildsQuoteForm from "@/components/custom-builds/CustomBuildsQuoteForm";
import { BEFORE_AFTER_PAIRS } from "@/lib/customBuilds/beforeAfter";

const PROCESS_STEPS = [
  {
    number: "1",
    title: "Consult",
    description: "We talk through your space, goals, and budget.",
  },
  {
    number: "2",
    title: "Design",
    description: "We map out the framing, layout, and finish.",
  },
  {
    number: "3",
    title: "Build",
    description: "Our contractors bring the plan to life, on-site.",
  },
  {
    number: "4",
    title: "Install",
    description: "Heater, materials, and finishing touches go in.",
  },
  {
    number: "5",
    title: "Walkthrough",
    description: "We hand it over and show you how to enjoy it.",
  },
];

const TRUST_ITEMS = [
  {
    title: "Framed to your space",
    description:
      "We design and construct the room itself — not a kit dropped in place — so the sauna fits the basement, gym, spa, or amenity room you already have.",
  },
  {
    title: "Home and commercial",
    description:
      "Private retreats and high-traffic wellness rooms get the same premium cedar, with a build that holds up under daily use.",
  },
  {
    title: "Built for Ontario",
    description:
      "From framing to final finish, every custom room is specified for Canadian climates and finished with the same cedar we use across our collection.",
  },
];

const CustomBuildsContent = () => {
  return (
    <div>
      <section className="relative flex min-h-[70vh] items-center overflow-hidden md:min-h-[85vh]">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/IMG-20260827-WA0061.jpg"
            alt="Custom indoor cedar sauna built into a finished room"
            fill
            className="object-cover object-[center_60%]"
            priority
            sizes="100vw"
          />
        </div>
        <div className="absolute inset-0 z-10 bg-black/55" />

        <div className="relative z-20 mx-auto w-full max-w-7xl px-4 py-24 md:px-8">
          <div className="max-w-2xl text-left">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-[#eeb35a]">
              Custom Builds
            </p>
            <h1 className="mb-6 font-archivo text-4xl font-light tracking-wide text-white md:text-5xl lg:text-6xl">
              Custom Sauna Rooms, Built Into Your Space
            </h1>
            <p className="mb-8 max-w-xl font-atkinson text-lg font-light text-gray-200 md:text-xl">
              Not a kit. A room, framed and finished — designed around your
              home, your gym, or your business, from the ground up.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                href="#quote"
                className="inline-block rounded-lg border-2 border-[#8B7355] bg-[#BF9774]/80 px-8 py-4 text-center text-lg font-medium text-white transition-colors hover:bg-[#7A6345]"
              >
                Request a Quote
              </a>
              <a
                href="#process"
                className="inline-block rounded-lg border-2 border-white/80 px-8 py-4 text-center text-lg font-medium text-white transition-colors hover:bg-white hover:text-black"
              >
                Schedule a Consultation
              </a>
            </div>
          </div>
        </div>
      </section>

      <div className="-mb-12 bg-[#0E0C0A] pb-12 text-[#F3EFE7]">
        <section className="border-y border-[#2C2620] bg-[#17140F] py-16 md:py-20">
          <div className="mx-auto grid max-w-7xl items-start gap-10 px-4 md:grid-cols-2 md:px-8">
            <h2 className="max-w-sm font-playfair text-3xl font-medium tracking-tight text-[#F3EFE7] md:text-4xl">
              This isn&apos;t off-the-shelf.
            </h2>
            <p className="max-w-xl text-lg leading-relaxed text-[#A89C8E]">
              Our signature saunas are ready to place and enjoy. A custom build
              is different — we design and construct{" "}
              <strong className="font-semibold text-[#F3EFE7]">
                the room itself
              </strong>
              , framed and finished to fit the exact space you have, residential
              or commercial. If you&apos;re picturing a sauna built into a
              basement, a gym, a spa, or a condo amenity room rather than a
              standalone unit in your backyard, this is where you start.
            </p>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4 md:px-8">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#D9A97D]">
                Two Paths
              </p>
              <h2 className="font-playfair text-3xl font-medium tracking-tight text-[#F3EFE7] md:text-4xl">
                Built for where you live and work
              </h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <article className="rounded-sm border border-[#2C2620] bg-[#1C1813] p-8 transition-all duration-300 hover:-translate-y-1 hover:border-[#8B5A3C]">
                <p className="text-sm font-semibold uppercase tracking-wider text-[#D9A97D]">
                  Residential
                </p>
                <h3 className="mt-3 font-playfair text-2xl font-medium text-[#F3EFE7]">
                  At Home
                </h3>
                <p className="mt-4 text-[#A89C8E]">
                  Turn an unused basement, garage, or spare room into a private
                  sauna — framed, insulated, and finished to match the rest of
                  your home. Designed around your space, not the other way
                  around.
                </p>
                <Link
                  href="/custom-builds?type=residential#quote"
                  className="mt-6 inline-block border-b border-[#8B5A3C] pb-1 text-sm font-semibold text-[#D9A97D] transition-colors hover:text-[#e8bd97]"
                >
                  Request a residential quote
                </Link>
              </article>
              <article className="rounded-sm border border-[#2C2620] bg-[#1C1813] p-8 transition-all duration-300 hover:-translate-y-1 hover:border-[#8B5A3C]">
                <p className="text-sm font-semibold uppercase tracking-wider text-[#D9A97D]">
                  Commercial
                </p>
                <h3 className="mt-3 font-playfair text-2xl font-medium text-[#F3EFE7]">
                  For Business
                </h3>
                <p className="mt-4 text-[#A89C8E]">
                  Gyms, spas, condos, and wellness studios trust us to deliver
                  sauna rooms built for daily use — durable materials, efficient
                  timelines, and a build that holds up under real traffic.
                </p>
                <Link
                  href="/custom-builds?type=commercial#quote"
                  className="mt-6 inline-block border-b border-[#8B5A3C] pb-1 text-sm font-semibold text-[#D9A97D] transition-colors hover:text-[#e8bd97]"
                >
                  Request a commercial quote
                </Link>
              </article>
            </div>
          </div>
        </section>

        <section
          id="process"
          className="scroll-mt-28 border-y border-[#2C2620] bg-[#17140F] py-16 md:py-24"
        >
          <div className="mx-auto max-w-7xl px-4 md:px-8">
            <div className="mx-auto mb-14 max-w-2xl text-center">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#D9A97D]">
                The Process
              </p>
              <h2 className="font-playfair text-3xl font-medium tracking-tight text-[#F3EFE7] md:text-4xl">
                From consultation to completion
              </h2>
            </div>
            <ol className="relative grid gap-8 md:grid-cols-5">
              <li
                aria-hidden="true"
                className="pointer-events-none absolute left-[10%] right-[10%] top-5 hidden h-px bg-[#2C2620] md:block"
              />
              {PROCESS_STEPS.map((step) => (
                <li key={step.number} className="relative text-center">
                  <div className="relative z-[1] mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full border border-[#D9A97D] bg-[#17140F] font-playfair text-[#D9A97D]">
                    {step.number}
                  </div>
                  <h3 className="mb-2 font-semibold text-[#F3EFE7]">
                    {step.title}
                  </h3>
                  <p className="text-sm text-[#A89C8E]">{step.description}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section
          id="before-after"
          className="scroll-mt-28 py-16 md:py-24"
        >
          <div className="mx-auto max-w-7xl px-4 md:px-8">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#D9A97D]">
                Before &amp; After
              </p>
              <h2 className="font-playfair text-3xl font-medium tracking-tight text-[#F3EFE7] md:text-4xl">
                See the room transform
              </h2>
              <p className="mt-4 text-[#A89C8E]">
                Drag the slider. The same space, before we framed it and after
                we finished it.
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
              {BEFORE_AFTER_PAIRS.map((pair) => (
                <figure key={pair.id} className="space-y-4">
                  <div className="overflow-hidden rounded-xl border border-[#2C2620] bg-[#1C1813]">
                    <BeforeAfterSlider
                      beforeSrc={pair.beforeSrc}
                      afterSrc={pair.afterSrc}
                      beforeAlt={pair.beforeAlt}
                      afterAlt={pair.afterAlt}
                    />
                  </div>
                  {pair.title ? (
                    <figcaption className="text-center font-playfair text-lg italic text-[#A89C8E]">
                      {pair.title}
                    </figcaption>
                  ) : null}
                </figure>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-[#2C2620] bg-[#17140F] py-16 md:py-20">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 md:grid-cols-3 md:px-8">
            {TRUST_ITEMS.map((item) => (
              <article key={item.title}>
                <h3 className="mb-3 font-playfair text-xl font-medium text-[#F3EFE7]">
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed text-[#A89C8E]">
                  {item.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section id="quote" className="scroll-mt-28 py-16 md:py-24">
          <div className="mx-auto grid max-w-7xl gap-12 px-4 md:grid-cols-2 md:px-8">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#D9A97D]">
                Get Started
              </p>
              <h2 className="font-playfair text-3xl font-medium tracking-tight text-[#F3EFE7] md:text-4xl">
                Ready to build your custom sauna room?
              </h2>
              <p className="mt-4 max-w-md text-[#A89C8E]">
                Tell us about your space — including rough dimensions — and
                we&apos;ll follow up with a plan and quote. Whether it&apos;s a
                private retreat at home or a wellness space for your business,
                we&apos;ll design and build it around you.
              </p>
              <div className="mt-8 space-y-2">
                <p>
                  <a
                    href="mailto:sales@thetorontosaunaco.com"
                    className="text-[#D9A97D] hover:underline"
                  >
                    sales@thetorontosaunaco.com
                  </a>
                </p>
                <p>
                  <a
                    href="tel:+14374296623"
                    className="text-[#D9A97D] hover:underline"
                  >
                    (437) 429-6623
                  </a>
                </p>
              </div>
            </div>

            <div className="rounded-sm border border-[#2C2620] bg-[#1C1813] p-6 md:p-10">
              <Suspense
                fallback={
                  <p className="text-center text-[#A89C8E]">Loading form...</p>
                }
              >
                <CustomBuildsQuoteForm />
              </Suspense>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default CustomBuildsContent;
