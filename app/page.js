import Contact from "@/components/Contact";
//import Hero from "@/components/Hero";
import Carousel2 from "@/components/Carousel2";
import HompageInfo from "@/components/HompageInfo";
//import WoodTypes from "@/components/WoodTypes";
import Image from "next/image";
import LCL from "@/public/images/Leisurecraft logo 3.jpg";
import HL from "@/public/images/humm_logo.jpg";
import HarL from "@/public/images/Harvia.jpg";
import HomePageImage from "@/components/HomePageImage";
import BlogPage from "./blog/page";
import newLogo from "@/public/images/Main Black.png";
import Link from "next/link";
import Hero from "@/components/redesign/Hero";
import InfoSection from "@/components/redesign/InfoSection";
import Signature from "@/components/redesign/Signature";
//import Signature_New from "@/components/redesign/Signature_New";
import WoodTypes from "@/components/redesign/WoodTypes";

// SEO Metadata for Homepage
export const metadata = {
  title: "Toronto Sauna Co. | Premium Cedar Saunas in Ontario, Canada",
  description:
    "Discover premium outdoor & indoor cedar saunas in Toronto. Barrel, cube & custom sauna kits proudly made in Canada. Cold plunges available. Free consultation!",
  keywords:
    "sauna toronto, outdoor sauna, cedar sauna, barrel sauna, cube sauna, indoor sauna, sauna ontario, sauna canada, cold plunge toronto, backyard sauna",
  authors: [{ name: "Toronto Sauna Co." }],
  creator: "Toronto Sauna Co.",
  publisher: "Toronto Sauna Co.",
  metadataBase: new URL("https://www.thetorontosaunaco.com"),
  alternates: {
    canonical: "https://www.thetorontosaunaco.com",
  },
  openGraph: {
    title: "Toronto Sauna Co. | Premium Cedar Saunas in Ontario",
    description:
      "Discover premium outdoor & indoor cedar saunas. Barrel, cube & custom sauna kits made in Canada. Free consultation available.",
    url: "https://www.thetorontosaunaco.com",
    siteName: "Toronto Sauna Co.",
    images: [
      {
        url: "https://klgko4j9xb.ufs.sh/f/QU3WlvTtWXxINXUnmbY6EFDuZUGftA81BP9QXmlCKO5vzsew",
        width: 1200,
        height: 630,
        alt: "Toronto Sauna Co. - Premium Cedar Saunas",
      },
    ],
    locale: "en_CA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Toronto Sauna Co. | Premium Cedar Saunas in Ontario",
    description:
      "Discover premium outdoor & indoor cedar saunas. Barrel, cube & custom sauna kits made in Canada.",
    images: [
      "https://klgko4j9xb.ufs.sh/f/QU3WlvTtWXxINXUnmbY6EFDuZUGftA81BP9QXmlCKO5vzsew",
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

const HomePage = () => {
  return (
    <div className="">
      {/* <Hero /> */}
      <Hero />
      <Signature />
      <InfoSection />
      {/* <HompageInfo /> */}
      {/* <h1 className=" mt-6 text-3xl text-center text-[#4E7302] font-archivo font-light mb-1">
        Popular Saunas
      </h1> */}
      <h2 className="mt-4 text-2xl text-center md:text-4xl lg:text-5xl font-light text-black mb-4 font-archivo">
        Popular Saunas
      </h2>
      <Carousel2 />
      <WoodTypes />

      <BlogPage />
      <HomePageImage />
      <h2 className="mt-10 text-2xl text-center md:text-4xl lg:text-5xl font-light text-black mb-4  font-archivo ">
        Ready to Build Your Dream Sauna?
      </h2>
      <Contact />
      {/* <div className="flex flex-col items-center"> */}
      <div className="grid grid-cols-3 md:flex md:flex-row justify-center items-center gap-8 max-w-2xl mx-auto w-full">
        <div className="col-span-1">
          <Image
            src={LCL}
            alt="Logo"
            width={150}
            height={150}
            className="mx-auto"
            priority
          />
        </div>
        <div className="col-span-1">
          <Image
            src={HL}
            alt="Logo"
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
              alt="Logo"
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
            alt="Logo"
            width={150}
            height={150}
            className="mx-auto"
            priority
          />
        </div>
      </div>
      {/* </div> */}
    </div>
  );
};

export default HomePage;
