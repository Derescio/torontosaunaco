import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FaPhone, FaEnvelope } from "react-icons/fa";

const HomePageImageWhistler = () => {
  return (
    <div className="relative w-full h-[800px] md:h-[600px] lg:h-[700px]">
      {/* Background Image */}
      <Image
        src="https://res.cloudinary.com/dw4ev5whz/image/upload/v1762113337/torontosaunaco/IMG_1529_oscb6b.jpg"
        alt="Sauna in the mountains"
        fill
        style={{ objectFit: "cover" }}
        priority
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-70">
        <div className="relative h-full w-full px-6 py-12 overflow-visible">
          <div className="h-full max-w-[1800px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Left Column - Main Content */}
            <div className="text-left md:max-w-xl lg:pl-8">
              <h1 className="text-white text-3xl md:text-5xl font-bold font-atkinson mb-4">
                Discover the Ultimate Sauna Experience
              </h1>
              <p className="text-white text-lg md:text-xl mb-8 font-nunito">
                Unwind in handcrafted cedar saunas built for relaxation, health,
                and wellness. Explore our premium outdoor and indoor sauna
                collections in beautiful British Columbia.
              </p>

              {/* Call-to-Action Buttons */}
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link href="/saunas">
                  <Button
                    variant="none"
                    className="border-white text-black px-6 py-3 bg-[#eeb35a] rounded-lg font-semibold hover:bg-white hover:text-black transition w-full sm:w-auto"
                  >
                    View Saunas
                  </Button>
                </Link>
                <Link href="/quote">
                  <Button
                    variant="outline"
                    className="border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-black transition w-full sm:w-auto"
                  >
                    Request a Quote
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Column - Business Info */}
            <div className="mt-[-14px] md:justify-self-end md:max-w-md lg:pr-8 relative z-10 mb-8 md:mb-0">
              <div className="text-white flex flex-col items-start gap-4 bg-black bg-opacity-40 p-8 rounded-lg w-full">
                <h2 className="text-2xl font-bold">The Whistler Sauna Co.</h2>

                <div className="md:space-y-2 w-full">
                  <div className="flex items-center space-y-2">
                    {/* Whistler Map */}
                    <div className="rounded-lg overflow-hidden w-full h-50 md:h-70 border-2 border-orange-300">
                      <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d81744.86726396952!2d-122.99890385!3d50.1163196!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x5487224d00dc570d%3A0x1c8d2c7d7b4f7f0!2sWhistler%2C%20BC!5e0!3m2!1sen!2sca!4v1747678349536!5m2!1sen!2sca"
                        className="w-full h-full border-0"
                        loading="lazy"
                        allowFullScreen
                        referrerPolicy="no-referrer-when-downgrade"
                        title="Map of The Whistler Sauna Co."
                      ></iframe>
                    </div>
                  </div>

                  <div className="flex items-center mb-1">
                    <FaPhone className="text-[#eeb35a] text-xl flex-shrink-0" />
                    <a
                      href="tel:+17787701958"
                      className="text-white hover:text-[#eeb35a] transition-colors ml-3"
                    >
                      (778) 770-1958
                    </a>
                  </div>

                  <div className="flex items-center gap-3 mt-1">
                    <FaEnvelope className="text-[#eeb35a] text-xl flex-shrink-0" />
                    <Link href="mailto:thewhistlersaunaco@gmail.com">
                      <p>thewhistlersaunaco@gmail.com</p>
                    </Link>
                  </div>
                </div>

                {/* <Link href="/consultation" className="w-full mt-2">
                  <Button
                    variant="none"
                    className="bg-[#eeb35a] text-black px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-black transition w-full"
                  >
                    Schedule Appointment
                  </Button>
                </Link> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePageImageWhistler;
