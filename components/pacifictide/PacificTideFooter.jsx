import React from "react";
import Link from "next/link";
import { FaInstagram } from "react-icons/fa";
import newLogo from "../../public/images/Main Black.png";
import Image from "next/image";

const Footer = () => {
  return (
    <div className="mt-12">
      <footer className="font-sans tracking-wide bg-slate-100 py-10 px-10">
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
            <h1 className="text-[#101010] font-semibold text-lg mb-6">
              Locations & Hours
            </h1>
            <div className="space-y-4 text-gray-700">
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
            <h1 className="text-[#101010] font-semibold text-lg mb-6">
              Pacific Tide
            </h1>
            <ul className="space-y-5">
              <li>
                <Link
                  href="/quote"
                  className="hover:underline hover:text-[#FFA726] transition-colors"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href="/service-areas"
                  className="hover:underline hover:text-[#FFA726] transition-colors"
                >
                  Service Areas
                </Link>
              </li>
            </ul>
          </div>

          {/* Socials Column */}
          <div className="flex flex-col">
            <h1 className="text-[#101010] font-semibold text-lg mb-6">
              Socials
            </h1>
            <ul className="space-y-5">
              <li>
                <a
                  href="https://www.instagram.com/pacifictidesaunas/"
                  className="hover:underline hover:text-[#FFA726] transition-colors flex items-center gap-2"
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
            <h1 className="text-[#101010] font-semibold text-lg mb-6">
              Company
            </h1>
            <ul className="space-y-5">
              {/* <li>
              <Link href="/" className="hover:underline hover:text-[#FFA726]  transition-all">Our Story</Link>
            </li> */}
              <li>
                <a
                  href="/blog"
                  className="hover:underline hover:text-[#FFA726] transition-colors"
                  alt="Blog Link"
                >
                  Blog
                </a>
              </li>
              <li>
                <a
                  href="/terms"
                  className="hover:underline hover:text-[#FFA726] transition-colors"
                  alt="Terms Of Service Link"
                >
                  Terms Of Service
                </a>
              </li>
              <li>
                <a
                  href="/terms"
                  className="hover:underline hover:text-[#FFA726] transition-colors"
                  alt="Refund Policy Link"
                >
                  Refund Policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        <p className="text-gray-500 text-sm mt-4">
          The Toronto Sauna Company warrants our saunas against defects in
          materials and workmanship under normal/residential use for a period of
          (1) year, as applicable, from the date of receipt of the product by
          the original end-user purchaser. This warranty does not apply to
          normal wear and tear and/or natural weather conditions. This warranty
          does not cover regular required maintenance of the sauna, (eg.
          Tightening bands on the barrels, cleaning or staining the sauna) refer
          to your sauna assembly manual for maintenance guidelines. This
          warranty does not cover misuse or negligence and the manufacturer and
          associated retailers are not liable for any injury or damage caused by
          the product. The Toronto Sauna Company will either repair the Product
          at no charge, using new or refurbished replacement parts. How long
          does the coverage last? The Warranty Period for Physical Goods
          purchased from The Toronto Sauna Company is 365 days from the date of
          purchase. A replacement Physical Good or part assumes the remaining
          warranty of the original Physical Good or 365 days from the date of
          replacement or repair, whichever is longer. Any costs associated with
          electricians or plumbers is solely the responsibility of the customer.
          The Toronto Sauna Company does not absorb any of these costs.
        </p>
        <div className="border-t text-center border-[#6b5f5f] pt-8 mt-8">
          <p className="text-gray-300 text-[15px]">
            &copy; {new Date().getFullYear()}{" "}
            <Link
              href="https://www.thetorontosaunaco.com/"
              className="hover:underline mx-1"
              alt="Toronto Sauna Co Link"
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
