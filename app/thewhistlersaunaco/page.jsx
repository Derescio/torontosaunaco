import Carousel2 from "@/components/Carousel2";
import Image from "next/image";
import LCL from "@/public/images/Leisurecraft logo 3.jpg";
import HL from "@/public/images/humm_logo.jpg";
import HarL from "@/public/images/Harvia.jpg";
import newLogo from "@/public/images/Main Black.png";
import Link from "next/link";
import {
  HeroWhistler,
  ContactWhistler,
  HomePageImageWhistler,
} from "@/components/whistler";
import WoodTypes from "@/components/whistler/WoodTypes";
import InfoSection from "@/components/redesign/InfoSection";
import Signature from "@/components/redesign/Signature";

// SEO Metadata for Whistler Landing Page
export const metadata = {
  title: "The Whistler Sauna Co. | Premium Cedar Saunas in BC, Canada",
  description:
    "Discover premium outdoor & indoor cedar saunas in Whistler and British Columbia. Barrel, cube & custom sauna kits proudly made in Canada. Cold plunges available. Free consultation!",
  keywords:
    "whistler sauna, bc sauna, vancouver sauna, outdoor sauna bc, barrel sauna whistler, cube sauna vancouver, indoor sauna british columbia, sauna canada, cold plunge vancouver, backyard sauna bc, squamish sauna",
  authors: [{ name: "The Whistler Sauna Co." }],
  creator: "The Whistler Sauna Co.",
  publisher: "The Whistler Sauna Co.",
  metadataBase: new URL("https://www.thewhistlersaunaco.com"),
  alternates: {
    canonical: "https://www.thewhistlersaunaco.com",
  },
  openGraph: {
    title: "The Whistler Sauna Co. | Premium Cedar Saunas in BC",
    description:
      "Discover premium outdoor & indoor cedar saunas in Whistler and BC. Barrel, cube & custom sauna kits made in Canada. Free consultation available.",
    url: "https://www.thewhistlersaunaco.com",
    siteName: "The Whistler Sauna Co.",
    images: [
      {
        url: "https://klgko4j9xb.ufs.sh/f/QU3WlvTtWXxINXUnmbY6EFDuZUGftA81BP9QXmlCKO5vzsew",
        width: 1200,
        height: 630,
        alt: "The Whistler Sauna Co. - Premium Cedar Saunas in British Columbia",
      },
    ],
    locale: "en_CA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Whistler Sauna Co. | Premium Cedar Saunas in BC",
    description:
      "Discover premium outdoor & indoor cedar saunas in Whistler and BC. Barrel, cube & custom sauna kits made in Canada.",
    images: [
      "https://klgko4j9xb.ufs.sh/f/QU3WlvTtWXxIKHBPF5JCIZtVTnlc4dX3YxhzgQfs85b0DSaU",
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const WhistlerPage = () => {
  return (
    <div className="">
      <HeroWhistler />
      <Signature />
      <InfoSection />
      <h2 className="mt-4 text-2xl text-center md:text-4xl lg:text-5xl font-light text-black mb-4 font-archivo">
        Popular Saunas
      </h2>
      <Carousel2 />
      <WoodTypes />

      <HomePageImageWhistler />
      <h2 className="mt-10 text-2xl text-center md:text-4xl lg:text-5xl font-light text-black mb-4 font-archivo">
        Ready to Build Your Dream Sauna?
      </h2>
      <ContactWhistler />
      <div className="grid grid-cols-3 md:flex md:flex-row justify-center items-center gap-8 max-w-2xl mx-auto w-full">
        <div className="col-span-1">
          <Image
            src={LCL}
            alt="Leisurecraft Logo"
            width={150}
            height={150}
            className="mx-auto"
            priority
          />
        </div>
        <div className="col-span-1">
          <Image
            src={HL}
            alt="Huum Logo"
            width={150}
            height={150}
            className="mx-auto"
            priority
          />
        </div>
        <Link href="/pacifictide">
          <div className="col-span-1">
            <Image
              src={newLogo}
              alt="Pacific Tide Logo"
              width={150}
              height={150}
              className="mx-auto"
              priority
            />
          </div>
        </Link>
        <div className="col-span-2 mt-8 md:mt-0">
          <Image
            src={HarL}
            alt="Harvia Logo"
            width={150}
            height={150}
            className="mx-auto"
            priority
          />
        </div>
      </div>
    </div>
  );
};

export default WhistlerPage;
