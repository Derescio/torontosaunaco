import React from "react";
import Link from "next/link";
import { FaInstagram } from "react-icons/fa";
import whistlerLogo from "@/public/images/whistler_updated.png";
import Image from "next/image";

const FooterWhistler = () => {
  return (
    <div className="mt-12">
      <footer className="font-archivo tracking-wide bg-black/90 py-10 px-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Whistler Logo Column */}
          <div className="flex flex-col">
            <Image
              src={whistlerLogo}
              alt="The Whistler Sauna Co."
              width={200}
              height={70}
              className="w-[180px] h-auto object-contain"
            />
          </div>

          {/* Locations & Hours Column */}
          <div className="flex flex-col">
            <h1 className="text-white font-archivo font-semibold text-lg mb-6">
              Locations & Hours
            </h1>
            <div className="space-y-4 text-white">
              <p className="text-sm">Showroom Visit By Appointment Only.</p>
              <div className="space-y-2">
                <p className="text-sm font-archivo font-medium">
                  Whistler Showroom
                </p>
                <p className="text-sm">Whistler, British Columbia</p>
              </div>
              <div className="space-y-2 mt-4">
                <p className="text-sm font-archivo font-medium text-white">
                  The Whistler Sauna Co.
                </p>
                <p className="text-sm">Whistler, BC</p>
                <p className="text-sm">
                  <a
                    href="/quote"
                    className="hover:text-[#FFA726] transition-colors"
                  >
                    Contact Us
                  </a>
                </p>
              </div>
            </div>
          </div>

          {/* Whistler Sauna Column */}
          <div className="flex flex-col">
            <h1 className="text-white font-semibold text-lg mb-6">
              Whistler Sauna
            </h1>
            <ul className="space-y-5">
              <li>
                <Link
                  href="/about"
                  className="hover:underline hover:text-[#FFA726] transition-colors text-white"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/quote"
                  className="hover:underline hover:text-[#FFA726] transition-colors text-white"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href="/service-areas"
                  className="hover:underline hover:text-[#FFA726] transition-colors text-white"
                >
                  Service Areas
                </Link>
              </li>
            </ul>

            {/* Socials nested under Whistler Sauna */}
            <div className="mt-8">
              <h1 className="text-white font-semibold text-lg mb-6">Socials</h1>
              <ul className="space-y-5">
                <li>
                  <a
                    href="https://www.instagram.com/thewhistlersaunaco/"
                    className="hover:underline hover:text-[#FFA726] transition-colors flex items-center gap-2 text-white"
                    alt="Instagram Link"
                    aria-label="Instagram Link"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaInstagram />
                    <span>Instagram</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Company Column */}
          <div className="flex flex-col">
            <h1 className="text-white font-semibold text-lg mb-6">Company</h1>
            <ul className="space-y-5">
              <li>
                <a
                  href="/blog"
                  className="hover:underline hover:text-[#FFA726] transition-colors text-white"
                  alt="Blog Link"
                >
                  Blog
                </a>
              </li>
              <li>
                <a
                  href="/terms"
                  className="hover:underline hover:text-[#FFA726] transition-colors text-white"
                  alt="Terms Of Service Link"
                >
                  Terms Of Service
                </a>
              </li>
              <li>
                <a
                  href="/terms"
                  className="hover:underline hover:text-[#FFA726] transition-colors text-white"
                  alt="Refund Policy Link"
                >
                  Refund Policy
                </a>
              </li>
              <li>
                <a
                  href="/warranty"
                  className="hover:underline hover:text-[#FFA726] transition-colors text-white"
                  alt="Warranty Link"
                >
                  Warranty
                </a>
              </li>
            </ul>
          </div>

          {/* Find Us / Map Column */}
          <div className="flex flex-col">
            <h1 className="mb-4 text-xl font-semibold text-white">Find Us</h1>
            <div className="rounded-lg overflow-hidden w-full h-48 border-2 border-orange-300">
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
        </div>
        <div className="border-t text-center border-[#6b5f5f] pt-8 mt-8">
          <p className="text-gray-100 text-[15px]">
            &copy; {new Date().getFullYear()}{" "}
            <Link
              href="https://www.thewhistlersaunaco.com/"
              className="hover:underline mx-1 text-white"
              alt="The Whistler Sauna Co Link"
            >
              The Whistler Sauna Co.
            </Link>
            All Rights Reserved.
          </p>
        </div>
        {/* Powered by OpsedSolutions */}
        <div className="text-center text-white/70 text-[13px] mt-4">
          Powered by{" "}
          <a
            href="https://www.opsedsolutions.com/"
            className="hover:underline mx-1 text-blue-500"
          >
            OpsedSolutions
          </a>
        </div>
      </footer>
    </div>
  );
};

export default FooterWhistler;
