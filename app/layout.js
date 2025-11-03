import "../assets/styles/globals.css";
import "photoswipe/dist/photoswipe.css";
import StoreProvider from "@/redux/provider/StoreProvider";
import AuthProvider from "@/components/AuthProvider";
import { Toaster } from "react-hot-toast";
import ScrollToTop from "@/components/ScrollToTop";
import ConditionalNavAndFooter from "@/components/pacifictide/ConditionalNavAndFooter";
// import { GoogleTagManager } from "@next/third-parties/google";
import { PostHogProvider } from "./providers";

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
        </head>
        <body>
          <StoreProvider>
            <PostHogProvider>
              <Toaster position="top-center" />
              <ScrollToTop />
              <ConditionalNavAndFooter>
                <main>{children}</main>
              </ConditionalNavAndFooter>
            </PostHogProvider>
          </StoreProvider>
        </body>
      </html>
    </AuthProvider>
  );
};

export default MainLayout;
