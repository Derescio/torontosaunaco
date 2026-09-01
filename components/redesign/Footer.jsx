import React from "react";
import Link from "next/link";
import { FaInstagram } from "react-icons/fa";
import newLogo from "@/assets/images/IMG_6773_white.png";
import Image from "next/image";

const Footer = () => {
  return (
    <div className="mt-12">
      <footer className="font-archivo tracking-wide bg-black/90 py-10 px-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Logo Column */}
          <div className="flex flex-col">
            <Image
              src={newLogo}
              alt="Toronto Sauna Logo"
              width={200}
              height={200}
              className="w-[160px] h-[160px] object-contain"
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
                <p className="text-sm font-archivo font-medium">GTA Showroom</p>
                <p className="text-sm">
                  17380 Highway 27 Schomberg Ontario. L0G 1T0
                </p>
              </div>
              <div className="space-y-2 mt-4">
                <p className="text-sm font-archivo font-medium text-white">
                  Toronto Sauna Co.
                </p>
                <p className="text-sm">Toronto, Ontario</p>
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

          {/* Toronto Sauna Column */}
          <div className="flex flex-col">
            <h1 className="text-white font-semibold text-lg mb-6">
              Toronto Sauna
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
                  href="/custom-builds"
                  className="hover:underline hover:text-[#FFA726] transition-colors text-white"
                >
                  Custom Sauna Room
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

            {/* Socials nested under Toronto Sauna */}
            <div className="mt-8">
              <h1 className="text-white font-semibold text-lg mb-6">Socials</h1>
              <ul className="space-y-5">
                <li>
                  <a
                    href="https://www.instagram.com/thetorontosaunaco/"
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
              <li>
                <a
                  href="/shipping"
                  className="hover:underline hover:text-[#FFA726] transition-colors text-white"
                  alt="Shipping Link"
                >
                  Shipping
                </a>
              </li>
            </ul>
          </div>

          {/* Find Us / Map Column */}
          <div className="flex flex-col">
            <h1 className="mb-4 text-xl font-semibold text-white">Find Us</h1>
            <div className="rounded-lg overflow-hidden w-full h-48 border-2 border-orange-300">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2869.6549743004716!2d-79.67779323821753!3d44.00785797357932!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x882adc2754c406a5%3A0x95008df80397f713!2s17380%20Hwy%2027%2C%20King%2C%20ON%20L0G%201T0!5e0!3m2!1sen!2sca!4v1784748718817!5m2!1sen!2sca"
                className="w-full h-full border-0"
                // style="border:0;"
                allowFullScreen
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                title="Map of The Toronto Sauna Co."
              ></iframe>
            </div>
          </div>
        </div>
        <div className="border-t text-center border-[#6b5f5f] pt-8 mt-8">
          <p className="text-gray-100 text-[15px]">
            &copy; {new Date().getFullYear()}{" "}
            <Link
              href="https://www.thetorontosaunaco.com/"
              className="hover:underline mx-1 text-white"
              alt="Toronto Sauna Co Link"
            >
              Toronto Sauna Co
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

export default Footer;
