import React from "react";
import Link from "next/link";
import { FaInstagram } from "react-icons/fa";
import newLogo from "../../../public/images/Main White.png";
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
              alt="Pacific Tide Logo"
              width={200}
              height={200}
              className="w-[160px] h-[160px] object-contain"
            />
          </div>

          {/* Locations & Hours Column */}
          <div className="flex flex-col">
            <h1 className="text-white font-semibold text-lg mb-6">
              Locations & Hours
            </h1>
            <div className="space-y-4 text-white">
              <p className="text-sm">Showroom Visit By Appointment Only.</p>
              <div className="space-y-2">
                <p className="text-sm font-medium">GTA</p>
                <p className="text-sm">
                  4663 LloydTown Aurora Rd, KING ON. L7B 0E3
                </p>
              </div>
              <div className="space-y-2 mt-4">
                <p className="text-sm font-medium">Pacific Tide Sauna</p>
                <p className="text-sm">Vancouver, British Columbia</p>
                <p className="text-sm">
                  <a
                    href="tel:604-330-2308"
                    className="hover:text-[#FFA726] transition-colors"
                  >
                    604-330-2308
                  </a>
                </p>
                <p className="text-sm">
                  <a
                    href="mailto:hello@pacifictide.ca"
                    className="hover:text-[#FFA726] transition-colors"
                  >
                    hello@pacifictide.ca
                  </a>
                </p>
              </div>
            </div>
          </div>

          {/* Pacific Tide Column */}
          <div className="flex flex-col">
            <h1 className="text-white font-semibold text-lg mb-6">
              Pacific Tide
            </h1>
            <ul className="space-y-5">
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
          </div>

          {/* Socials Column */}
          <div className="flex flex-col">
            <h1 className="text-white font-semibold text-lg mb-6">Socials</h1>
            <ul className="space-y-5">
              <li>
                <a
                  href="https://www.instagram.com/pacifictidesaunas/"
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

          {/* Company Column */}
          <div className="flex flex-col">
            <h1 className="text-white font-semibold text-lg mb-6">Company</h1>
            <ul className="space-y-5">
              {/* <li>
              <Link href="/" className="hover:underline hover:text-[#FFA726]  transition-all">Our Story</Link>
            </li> */}
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
        </div>
        <div className="border-t text-center border-[#6b5f5f] pt-8 mt-8">
          <p className="text-gray-300 text-[15px]">
            &copy; {new Date().getFullYear()}{" "}
            <Link
              href="https://www.thetorontosaunaco.com/pacifictide"
              className="hover:underline mx-1 text-white"
              alt="Pacific Tide Sauna & Plunge Link"
            >
              Pacific Tide Sauna & Plunge
            </Link>
            All Rights Reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Footer;
