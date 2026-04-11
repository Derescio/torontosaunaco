import "../assets/styles/globals.css";
import "photoswipe/dist/photoswipe.css";
import StoreProvider from "@/redux/provider/StoreProvider";
import AuthProvider from "@/components/AuthProvider";
import { Toaster } from "react-hot-toast";
import ScrollToTop from "@/components/ScrollToTop";
import ConditionalNavAndFooter from "@/components/pacifictide/ConditionalNavAndFooter";
// import { GoogleTagManager } from "@next/third-parties/google";
import { PHProvider } from "./providers";
import PostHogPageView from "../components/PostHogPageViews";
import Script from "next/script";

// Create Meta Data
export const metadata = {
  title:
    "Toronto Sauna Co. | Sauna for Sale| outdoor sauna for sale | custome sauna Toronto",
  description:
    "Explore premium outdoor and indoor saunas for your home, crafted from high-quality cedar wood. Proudly made in Canada, our cedar barrel and cube saunas, sauna kits, and backyard wellness solutions provide relaxation, health benefits, and timeless luxury. Elevate your space today—cold plunges available!",
};

const MainLayout = ({ children }) => {
  return (
    <AuthProvider>
      <html lang="en" suppressHydrationWarning>
        {/* <GoogleTagManager gtmId="AW-16622832527" /> */}
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link
            rel="preconnect"
            href="https://fonts.gstatic.com"
            crossOrigin="true"
          />
          <link rel="preconnect" href="https://res.cloudinary.com" />
          <link rel="dns-prefetch" href="https://res.cloudinary.com" />
          <link rel="preconnect" href="https://gz7g5ew6dp.ufs.sh" />
          <link rel="dns-prefetch" href="https://gz7g5ew6dp.ufs.sh" />
          <link
            href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Roboto:wght@400;700&display=swap"
            rel="stylesheet"
          />
          <link
            href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible+Next:ital,wght@0,200..800;1,200..800&family=Nunito:ital,wght@0,200..1000;1,200..1000&family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Rubik:ital,wght@0,300..900;1,300..900&display=swap"
            rel="stylesheet"
          ></link>
          <link
            href="https://fonts.googleapis.com/css2?family=Archivo+Narrow:ital,wght@0,400..700;1,400..700&display=swap"
            rel="stylesheet"
          ></link>
          <link href="https://fonts.googleapis.com/css2?family=ABeeZee:ital@0;1&family=Abyssinica+SIL&family=Akaya+Kanadaka&family=Anton&family=Kavivanar&family=Libre+Baskerville:ital,wght@0,400..700;1,400..700&display=swap"
          rel="stylesheet"
          ></link>
           <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-16622832527"
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'AW-16622832527');
          `}
        </Script>
        </head>
        <body>
          <StoreProvider>
            <PHProvider>
              <Toaster position="top-center" />
              <ScrollToTop />
              <PostHogPageView />
              <ConditionalNavAndFooter>
                <main>{children}</main>
              </ConditionalNavAndFooter>
            </PHProvider>
          </StoreProvider>
        </body>
      </html>
    </AuthProvider>
  );
};

export default MainLayout;
