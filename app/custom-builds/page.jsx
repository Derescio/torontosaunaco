import CustomBuildsContent from "@/components/custom-builds/CustomBuildsContent";

export const metadata = {
  title:
    "Custom Sauna Builds | Indoor & Commercial Sauna Rooms | Toronto Sauna Co.",
  description:
    "Custom sauna rooms framed and finished for your home, gym, spa, or condo. Not a kit — a room built into your space across the GTA and Ontario.",
  keywords:
    "custom sauna Toronto, custom sauna room, indoor sauna build, commercial sauna Ontario, basement sauna, gym sauna, spa sauna",
  metadataBase: new URL("https://www.thetorontosaunaco.com"),
  alternates: {
    canonical: "https://www.thetorontosaunaco.com/custom-builds",
  },
  openGraph: {
    title: "Custom Sauna Builds | Toronto Sauna Co.",
    description:
      "Custom sauna rooms framed and finished for your home, gym, spa, or condo. Not a kit — a room built into your space.",
    url: "https://www.thetorontosaunaco.com/custom-builds",
    siteName: "Toronto Sauna Co.",
    images: [
      {
        url: "/images/Indoor/Indoor_570_1.png",
        width: 1200,
        height: 630,
        alt: "Custom indoor cedar sauna room by Toronto Sauna Co.",
      },
    ],
    locale: "en_CA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Custom Sauna Builds | Toronto Sauna Co.",
    description:
      "Custom sauna rooms framed and finished for your home, gym, spa, or condo.",
    images: [
      {
        url: "/images/Indoor/Indoor_570_1.png",
        width: 1200,
        height: 630,
        alt: "Custom indoor cedar sauna room by Toronto Sauna Co.",
      },
    ],
  },
};

const CustomBuildsPage = () => {
  return <CustomBuildsContent />;
};

export default CustomBuildsPage;
