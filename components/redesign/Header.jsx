"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { FaBars, FaTimes, FaChevronDown, FaShoppingBag } from "react-icons/fa";
import { signOut, useSession } from "next-auth/react";
import newLogo from "@/assets/images/IMG_6773_white.png";
import defaultImage from "@/assets/images/profile.png";
import { useSelector } from "react-redux";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [saunasDropdownOpen, setSaunasDropdownOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const { cartItems } = useSelector((state) => state.cart);
  const cartCount = cartItems?.length || 0;
  const { data: session } = useSession();
  const profileImage = session?.user?.image || defaultImage;

  const handleDesktopHover = (open) => {
    setSaunasDropdownOpen(open);
  };

  const closeDropdown = () => {
    setSaunasDropdownOpen(false);
    setMenuOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".dropdown")) {
        setSaunasDropdownOpen(false);
      }
      if (!e.target.closest(".profile-dropdown")) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 bg-black/90 shadow-lg shadow-white/10 z-50">
      <div className="container mx-auto px-4">
        {/* Desktop Header */}
        <div className="hidden lg:flex items-center justify-between py-4">
          {/* Logo on the left */}
          <div className="flex-shrink-0 w-[120px]">
            <Link href="/">
              <Image
                src={newLogo}
                alt="Toronto Sauna Co"
                width={120}
                // height={120}
                // fill
                priority
                className="object-contain"
              />
            </Link>
          </div>

          {/* Navigation links in the center */}
          <nav className="flex-1 flex justify-center items-center gap-6">
            <Link
              href="/"
              className="text-white hover:text-[#FFA726] transition-colors font-medium"
            >
              Home
            </Link>

            {/* Saunas Dropdown */}
            <div
              className="relative dropdown"
              onMouseEnter={() => handleDesktopHover(true)}
              onMouseLeave={() => handleDesktopHover(false)}
            >
              <button className="flex items-center gap-2 text-white hover:text-[#FFA726] transition-colors font-medium">
                <Link href="/saunas">Saunas</Link>
                <FaChevronDown className="text-xs" />
              </button>
              {saunasDropdownOpen && (
                <ul className="absolute top-full left-0 mt-0.75 w-48 bg-white shadow-lg rounded-lg py-2 z-50">
                  <DropdownItem
                    href="/best-sellers"
                    label="Best Sellers"
                    onClick={closeDropdown}
                  />
                  <DropdownItem
                    href="/saunas/studio-6"
                    label="Studio Six Collection"
                    onClick={closeDropdown}
                  />
                  <DropdownItem
                    href="/saunas/cube"
                    label="Cube Saunas"
                    onClick={closeDropdown}
                  />
                  <DropdownItem
                    href="/saunas/barell"
                    label="Barrel Sauna"
                    onClick={closeDropdown}
                  />
                  <DropdownItem
                    href="/saunas/indoor"
                    label="Indoor Saunas"
                    onClick={closeDropdown}
                  />
                  <DropdownItem
                    href="/saunas/luna"
                    label="Luna Saunas"
                    onClick={closeDropdown}
                  />

                  <DropdownItem
                    href="/saunas/canadian-timber"
                    label="Canadian Timber"
                    onClick={closeDropdown}
                  />
                  <DropdownItem
                    href="/showers"
                    label="Outdoor Showers"
                    onClick={closeDropdown}
                  />
                </ul>
              )}
            </div>

            <Link
              href="/cold-plunge"
              className="text-white hover:text-[#FFA726] transition-colors font-medium"
            >
              Hot and Cold Tubs
            </Link>

            <Link
              href="/heaters"
              className="text-white hover:text-[#FFA726] transition-colors font-medium"
            >
              Heaters
            </Link>

            <Link
              href="/quote"
              className="text-white hover:text-[#FFA726] transition-colors font-medium"
            >
              Contact
            </Link>

            <Link
              href="/accessories"
              className="text-white hover:text-[#FFA726] transition-colors font-medium"
            >
              Accessories
            </Link>
          </nav>

          {/* Cart and Profile on the right */}
          <div className="flex items-center gap-4 w-[120px] justify-end">
            {/* Cart Icon */}
            <Link
              href="/cart"
              className="relative text-white hover:text-[#FFA726] transition-colors"
            >
              <FaShoppingBag className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#4E7302] text-white text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center border-2 border-black">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Profile Menu */}
            <div className="relative profile-dropdown">
              <button
                type="button"
                className="relative flex rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
                id="user-menu-button"
                aria-expanded={isProfileMenuOpen}
                aria-haspopup="true"
                onClick={() => setIsProfileMenuOpen((prev) => !prev)}
              >
                <span className="sr-only">Open user menu</span>
                <Image
                  className="h-8 w-8 rounded-full"
                  src={profileImage}
                  alt="Profile"
                  width={32}
                  height={32}
                />
              </button>

              {/* Profile Dropdown Menu */}
              {isProfileMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg py-2 z-50"
                  role="menu"
                  aria-orientation="vertical"
                  aria-labelledby="user-menu-button"
                  onClick={() => setIsProfileMenuOpen(false)}
                >
                  {session ? (
                    <>
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {session.user?.name || "User"}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {session.user?.email}
                        </p>
                      </div>
                      <Link
                        href="/orders"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        role="menuitem"
                      >
                        View Orders
                      </Link>
                      <button
                        onClick={() => signOut()}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        role="menuitem"
                      >
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/signin"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors font-bold"
                        role="menuitem"
                      >
                        Sign In
                      </Link>
                      {session?.user?.id && (
                        <>
                          <Link
                            href="/orders"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                            role="menuitem"
                          >
                            View Orders
                          </Link>
                        </>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between py-4">
          {/* Hamburger menu on the left */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-white text-2xl"
            aria-label="Toggle menu"
          >
            {menuOpen ? <FaTimes /> : <FaBars />}
          </button>

          {/* Logo in the middle */}
          <div className="flex-1 flex justify-center">
            <Link href="/">
              <Image
                src={newLogo}
                alt="Toronto Sauna Co"
                width={100}
                height={100}
                priority
                className="object-contain"
              />
            </Link>
          </div>

          {/* Cart and Profile Icons on the right for mobile */}
          <div className="flex items-center gap-3">
            <Link
              href="/cart"
              className="relative text-white hover:text-[#FFA726] transition-colors"
            >
              <FaShoppingBag className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#4E7302] text-white text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center border-2 border-black">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Mobile Profile Button */}
            <div className="relative profile-dropdown">
              <button
                type="button"
                className="relative flex rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white"
                aria-expanded={isProfileMenuOpen}
                aria-haspopup="true"
                onClick={() => setIsProfileMenuOpen((prev) => !prev)}
              >
                <span className="sr-only">Open user menu</span>
                <Image
                  className="h-7 w-7 rounded-full"
                  src={profileImage}
                  alt="Profile"
                  width={28}
                  height={28}
                />
              </button>

              {/* Mobile Profile Dropdown Menu */}
              {isProfileMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-lg py-2 z-50"
                  role="menu"
                  aria-orientation="vertical"
                  onClick={() => setIsProfileMenuOpen(false)}
                >
                  {session ? (
                    <>
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {session.user?.name || "User"}
                        </p>
                      </div>
                      <Link
                        href="/orders"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        role="menuitem"
                      >
                        View Orders
                      </Link>
                      <button
                        onClick={() => signOut()}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        role="menuitem"
                      >
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/signin"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors font-bold"
                        role="menuitem"
                      >
                        Sign In
                      </Link>
                      <Link
                        href="/orders"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        role="menuitem"
                      >
                        View Orders
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <nav
          className={`lg:hidden fixed top-0 left-0 h-screen w-64 bg-white shadow-xl transform transition-transform duration-300 z-50 ${
            menuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="p-6">
            <div className="flex justify-between items-center mb-8">
              <Image
                src={newLogo}
                alt="Toronto Sauna Co"
                width={100}
                height={100}
                className="object-contain"
              />
              <button
                onClick={() => setMenuOpen(false)}
                className="text-gray-800 text-2xl"
                aria-label="Close menu"
              >
                <FaTimes />
              </button>
            </div>

            <ul className="space-y-4">
              <li>
                <Link
                  href="/"
                  onClick={closeDropdown}
                  className="text-gray-800 hover:text-[#FFA726] transition-colors font-medium block py-2"
                >
                  Home
                </Link>
              </li>

              <li className="dropdown">
                <button
                  onClick={() => setSaunasDropdownOpen(!saunasDropdownOpen)}
                  className="flex items-center justify-between w-full text-gray-800 hover:text-[#FFA726] transition-colors font-medium py-2"
                >
                  Saunas
                  <FaChevronDown
                    className={`transition-transform ${
                      saunasDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {saunasDropdownOpen && (
                  <ul className="pl-4 mt-2 space-y-2">
                    <DropdownItem
                      href="/best-sellers"
                      label="Best Sellers"
                      onClick={closeDropdown}
                    />
                    <DropdownItem
                      href="/saunas/studio-6"
                      label="Studio Six Collection"
                      onClick={closeDropdown}
                    />
                    <DropdownItem
                      href="/saunas/cube"
                      label="Cube Saunas"
                      onClick={closeDropdown}
                    />
                    <DropdownItem
                      href="/saunas/barell"
                      label="Barrel Sauna"
                      onClick={closeDropdown}
                    />
                    <DropdownItem
                      href="/saunas/indoor"
                      label="Indoor Saunas"
                      onClick={closeDropdown}
                    />
                    <DropdownItem
                      href="/saunas/luna"
                      label="Luna Saunas"
                      onClick={closeDropdown}
                    />

                    <DropdownItem
                      href="/saunas/canadian-timber"
                      label="Canadian Timber"
                      onClick={closeDropdown}
                    />
                    <DropdownItem
                      href="/showers"
                      label="Outdoor Showers"
                      onClick={closeDropdown}
                    />
                    <hr className="my-2 border-gray-400" />
                    <Link
                      href="/saunas"
                      className="ml-4 text-gray-800 hover:text-[#FFA726] transition-colors font-medium block py-2"
                    >
                      View All Saunas
                    </Link>
                  </ul>
                )}
              </li>

              <li>
                <Link
                  href="/cold-plunge"
                  onClick={closeDropdown}
                  className="text-gray-800 hover:text-[#FFA726] transition-colors font-medium block py-2"
                >
                  Hot and Cold Tubs
                </Link>
              </li>

              <li>
                <Link
                  href="/heaters"
                  onClick={closeDropdown}
                  className="text-gray-800 hover:text-[#FFA726] transition-colors font-medium block py-2"
                >
                  Heaters
                </Link>
              </li>

              <li>
                <Link
                  href="/quote"
                  onClick={closeDropdown}
                  className="text-gray-800 hover:text-[#FFA726] transition-colors font-medium block py-2"
                >
                  Contact
                </Link>
              </li>

              <li>
                <Link
                  href="/accessories"
                  onClick={closeDropdown}
                  className="text-gray-800 hover:text-[#FFA726] transition-colors font-medium block py-2"
                >
                  Accessories
                </Link>
              </li>

              {/* Cart Link in Mobile Menu */}
              <li>
                <Link
                  href="/cart"
                  onClick={closeDropdown}
                  className="flex items-center gap-2 text-gray-800 hover:text-[#FFA726] transition-colors font-medium py-2"
                >
                  <FaShoppingBag className="w-5 h-5" />
                  Cart
                  {cartCount > 0 && (
                    <span className="bg-[#4E7302] text-white text-xs font-semibold rounded-full px-2 py-0.5">
                      {cartCount}
                    </span>
                  )}
                </Link>
              </li>

              {/* View Orders in Mobile Menu */}
              <li>
                <Link
                  href="/orders"
                  onClick={closeDropdown}
                  className="text-gray-800 hover:text-[#FFA726] transition-colors font-medium block py-2"
                >
                  View Orders
                </Link>
              </li>

              {/* Sign In / Sign Out in Mobile Menu */}
              {session ? (
                <li>
                  <button
                    onClick={() => {
                      signOut();
                      closeDropdown();
                    }}
                    className="text-gray-800 hover:text-[#FFA726] transition-colors font-medium block py-2 w-full text-left"
                  >
                    Sign Out
                  </button>
                </li>
              ) : (
                <li>
                  <Link
                    href="/signin"
                    onClick={closeDropdown}
                    className="text-gray-800 hover:text-[#FFA726] transition-colors font-bold block py-2"
                  >
                    Sign In
                  </Link>
                </li>
              )}
            </ul>
          </div>
        </nav>

        {/* Mobile Menu Overlay */}
        {menuOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setMenuOpen(false)}
          />
        )}
      </div>
    </header>
  );
};

// Dropdown Item Component
function DropdownItem({ href, label, onClick }) {
  return (
    <li>
      <Link
        href={href}
        onClick={onClick}
        className="block px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-[#FFA726] transition-colors"
      >
        {label}
      </Link>
    </li>
  );
}

export default Header;
