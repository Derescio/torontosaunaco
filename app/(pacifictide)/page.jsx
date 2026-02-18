// "use client";
// import Image from "next/image";
// import Link from "next/link";
// import PacifictideContact from "@/components/pacifictide/PacficTideContact";
// import { FaCheck, FaQuoteLeft } from "react-icons/fa";

// export default function PacificTidePage() {
//   // Sample product data - replace with real data later
//   const products = [
//     {
//       id: 1,
//       name: "Pure Cube Hudson",
//       description: "Compact outdoor sauna perfect for small spaces.",
//       image: "/images/PureCubeHudsonClear_ Web-12.jpg",
//       features: ["knotty/Clear Cedar", "Electric heater", "Quick heat up"],
//       viewMore: "/saunas/668af06648215c199c406a64",
//     },
//     {
//       id: 2,
//       name: "Studio 6 Max",
//       description:
//         "The ideal balance of space and efficiency for modern living.",
//       image: "/images/Classic 2.png",
//       features: ["Premium cedar", "Chromatherapy lighting", "Bluetooth audio"],
//       viewMore: "/saunas/studio-6",
//     },
//     {
//       id: 3,
//       name: "Indoor Pure Cube Sauna",
//       description:
//         "The Pure Cube PU550 Indoor Sauna is an attractive and stylish design",
//       image:
//         "https://res.cloudinary.com/dw4ev5whz/image/upload/v1720653426/torontosaunaco/Cubes/PU550%28Indoor%29/indoor550_dakclp.webp",
//       features: ["Hot & cold therapy", "Dual zone", "Weather resistant"],
//       viewMore: "/saunas/668af06648215c199c406a69",
//     },
//   ];

//   // Gallery images
//   const galleryImages = [
//     {
//       id: 1,
//       name: "Pure Cude Orion",
//       image:
//         "https://res.cloudinary.com/dw4ev5whz/image/upload/v1720653285/torontosaunaco/Cubes/OR6110/MS-_-Orion-PDP_900_atvbal.jpg",
//       alt: "Pacific Tide Sauna Gallery 1",
//       viewMore: "/saunas/668af06648215c199c406a66",
//     },
//     {
//       id: 2,
//       name: "Outdoor Pure Cube Sauna",
//       image:
//         "https://res.cloudinary.com/dw4ev5whz/image/upload/v1720653483/torontosaunaco/Cubes/PU570%28Indoor%29/Luxurious4-PersonIndoor570PureCubeSauna_0cf8fb6d-a9a4-4ef6-acc3-8d12cd302cd9_900x_pxeu5f.webp",
//       alt: "Pacific Tide Sauna Gallery 2",
//       viewMore: "/saunas/668af06648215c199c406a60",
//     },
//     {
//       id: 3,
//       name: "Indoor Pure Cube Sauna",
//       image:
//         "https://res.cloudinary.com/dw4ev5whz/image/upload/v1720653426/torontosaunaco/Cubes/PU550%28Indoor%29/indoor550_dakclp.webp",
//       alt: "Pacific Tide Sauna Gallery 3",
//       viewMore: "/saunas/668af06648215c199c406a69",
//     },
//     {
//       id: 4,
//       name: "Classic Studio 6",
//       image: "/images/Classic 2.png",
//       alt: "Pacific Tide Sauna Gallery 4",
//       viewMore: "/saunas/studio-6",
//     },
//     {
//       id: 5,
//       name: "8' x 6' Luna Sauna",
//       image:
//         "https://res.cloudinary.com/dw4ev5whz/image/upload/v1720654318/torontosaunaco/Lunas/luna1_tar30r.jpg",
//       alt: "Pacific Tide Sauna Gallery 5",
//       viewMore: "/saunas/668b07d348215c199c406a6c",
//     },
//     {
//       id: 6,
//       name: "The Cascade Tub 3'x7",
//       image:
//         "https://res.cloudinary.com/dw4ev5whz/image/upload/v1742229509/Cascade_Tub_1_j4lfda.png",
//       alt: "Pacific Tide Sauna Gallery 6",
//       viewMore: "/hot-tub/668af06648215c199c423a66",
//     },
//   ];
//   //console.log(galleryImages);
//   return (
//     <div className="min-h-screen bg-white mt-[2px]">
//       {/* Hero Section */}
//       <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
//         <div className="absolute inset-0 z-0">
//           <Image
//             src="/images/micah-mckerlich-gaZBqZQWSng-unsplash.jpg"
//             //src="/images/vancouver.jpg"
//             alt="Pacific Tide Sauna Background"
//             fill
//             className="object-cover"
//             priority
//           />
//           <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-blue-400/70 to-slate-500/80"></div>
//         </div>

//         <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
//           <div className="inline-block mb-6">
//             <h1 className="font-atkinson text-5xl md:text-6xl lg:text-7xl text-white font-bold mb-4 drop-shadow-2xl">
//               Pacific Tide
//             </h1>
//             <p className="text-xl md:text-2xl lg:text-3xl text-blue-100 font-light tracking-wide">
//               Sauna & Plunge
//             </p>
//           </div>

//           <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto mb-8 leading-relaxed">
//             Transform your backyard into a coastal wellness retreat with premium
//             sauna and cold plunge solutions designed for the Canadian lifestyle.
//           </p>

//           <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
//             <Link
//               href="/quote"
//               className="bg-[#eeb35a] hover:bg-orange-300 text-white font-semibold px-8 py-4 rounded-lg text-lg transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
//             >
//               Request a Quote
//             </Link>
//             <Link
//               href="#products"
//               className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white font-semibold px-8 py-4 rounded-lg text-lg border-2 border-white transition-all"
//             >
//               View Products
//             </Link>
//           </div>
//         </div>
//       </section>

//       {/* Partnership Section */}
//       <section className="py-20 bg-gradient-to-b from-blue-50 to-white">
//         <div className="container mx-auto px-4 max-w-6xl">
//           <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
//             <div className="flex items-start gap-8 mb-8">
//               <div className="hidden md:block">
//                 <FaQuoteLeft className="text-6xl text-blue-500 opacity-20" />
//               </div>
//               <div className="flex-1">
//                 <h2 className="font-atkinson text-3xl md:text-4xl font-bold text-gray-900 mb-6">
//                   In Partnership with The Toronto Sauna Co.
//                 </h2>
//                 <p className="text-lg text-gray-700 leading-relaxed mb-6">
//                   Pacific Tide Sauna & Plunge brings West Coast energy to
//                   outdoor sauna living. We serve Vancouver, Whistler, Squamish,
//                   North Vancouver, West Vancouver and the full Sea to Sky
//                   region, while also supporting homeowners and properties across
//                   the rest of British Columbia. Our cedar saunas are
//                   Canadian-made and built to thrive in coastal and mountain
//                   climates. Panoramic outdoor saunas that frame the views.
//                   Classic cedar barrels that feel right at home in the forest.
//                   Custom backyard sauna setups that turn unused space into your
//                   own personal retreat. Pacific Tide is powered by The Toronto
//                   Sauna Co., one of Canada’s most trusted sauna companies. That
//                   means you get a true West Coast brand with national build
//                   quality and support. Same craftsmanship, same attention to
//                   detail, all customized for BC living. Whether you are looking
//                   for a backyard sauna for sale or planning a complete outdoor
//                   wellness space, we make the process easy. Local guidance.
//                   Professional installation. Daily heat and cold therapy that
//                   feels like the coast. Bring the best part of BC home.
//                 </p>
//                 <p className="text-lg text-gray-700 leading-relaxed mb-6">
//                   Our partnership ensures every Pacific Tide product is built
//                   with the highest standards of Canadian-made excellence,
//                   featuring premium Western Red Cedar and state-of-the-art
//                   heating systems designed to withstand Canadian winters.
//                 </p>
//                 <div className="grid md:grid-cols-2 gap-6 mt-8">
//                   <div className="flex items-center gap-3">
//                     <div className="bg-blue-100 p-2 rounded-lg">
//                       <FaCheck className="text-blue-600 text-xl" />
//                     </div>
//                     <span className="text-gray-700 font-medium">
//                       Locally manufactured in Ontario
//                     </span>
//                   </div>
//                   <div className="flex items-center gap-3">
//                     <div className="bg-blue-100 p-2 rounded-lg">
//                       <FaCheck className="text-blue-600 text-xl" />
//                     </div>
//                     <span className="text-gray-700 font-medium">
//                       Premium Western Red Cedar
//                     </span>
//                   </div>
//                   <div className="flex items-center gap-3">
//                     <div className="bg-blue-100 p-2 rounded-lg">
//                       <FaCheck className="text-blue-600 text-xl" />
//                     </div>
//                     <span className="text-gray-700 font-medium">
//                       Full installation support
//                     </span>
//                   </div>
//                   <div className="flex items-center gap-3">
//                     <div className="bg-blue-100 p-2 rounded-lg">
//                       <FaCheck className="text-blue-600 text-xl" />
//                     </div>
//                     <span className="text-gray-700 font-medium">
//                       Comprehensive warranty
//                     </span>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Product Models Section */}
//       <section id="products" className="py-20 bg-white">
//         <div className="container mx-auto px-4 max-w-7xl">
//           <div className="text-center mb-16">
//             <h2 className="font-atkinson text-4xl md:text-5xl font-bold text-gray-900 mb-4">
//               Our Premium Models
//             </h2>
//             <p className="text-xl text-gray-600 max-w-2xl mx-auto">
//               Discover our range of coastal-inspired sauna and cold plunge
//               solutions
//             </p>
//           </div>

//           <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
//             {products.map((product) => (
//               <div
//                 key={product.id}
//                 className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group"
//               >
//                 <div className="relative h-64 overflow-hidden">
//                   <Image
//                     src={product.image}
//                     alt={product.name}
//                     fill
//                     className="object-cover group-hover:scale-110 transition-transform duration-500"
//                   />
//                   {/* Create a view more vutton on the bottom right hand corner of the image */}
//                   <div className="absolute bottom-0 right-0">
//                     <Link
//                       href={product.viewMore}
//                       className="bg-[#eeb35a] hover:bg-orange-600 text-black font-semibold py-2 px-4 rounded-lg transition-colors"
//                     >
//                       View More
//                     </Link>
//                   </div>
//                   {/* <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div> */}
//                 </div>
//                 <div className="p-6">
//                   <h3 className="font-atkinson text-2xl font-bold text-gray-900 mb-2">
//                     {product.name}
//                   </h3>
//                   <p className="text-gray-600 mb-4">{product.description}</p>
//                   <ul className="space-y-2 mb-6">
//                     {product.features.map((feature, idx) => (
//                       <li
//                         key={idx}
//                         className="flex items-center gap-2 text-gray-700"
//                       >
//                         <div className="bg-orange-100 rounded-full p-1">
//                           <FaCheck className="text-orange-600 text-xs" />
//                         </div>
//                         <span className="text-sm">{feature}</span>
//                       </li>
//                     ))}
//                   </ul>
//                   <Link
//                     href="/quote"
//                     className="block w-full text-center bg-[#eeb35a] hover:bg-orange-600 text-black font-semibold py-3 rounded-lg transition-colors"
//                   >
//                     Request Information
//                   </Link>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* Gallery Section */}
//       <section className="py-20 bg-gradient-to-b from-white via-blue-50 to-white">
//         <div className="container mx-auto px-4 max-w-7xl">
//           <div className="text-center mb-16">
//             <h2 className="font-atkinson text-4xl md:text-5xl font-bold text-gray-900 mb-4">
//               Explore Our Gallery
//             </h2>
//             <p className="text-xl text-gray-600 max-w-2xl mx-auto">
//               See Pacific Tide saunas and cold plunges in beautiful Canadian
//               backyards
//             </p>
//           </div>

//           <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
//             {galleryImages.map((imageiterator) => (
//               <div
//                 key={imageiterator.id}
//                 className="relative h-64 md:h-80 rounded-xl overflow-hidden group cursor-pointer shadow-lg hover:shadow-2xl transition-all"
//               >
//                 <Image
//                   src={imageiterator.image}
//                   alt={imageiterator.alt}
//                   fill
//                   className="object-cover group-hover:scale-110 transition-transform duration-500"
//                 />
//                 <div className="absolute inset-0 bg-blue-900/0 group-hover:bg-blue-900/20 transition-colors"></div>
//                 {/* Product name - centered on small screens above button, bottom-left on larger screens */}
//                 {/* <div className="absolute bottom-16 left-1/2 -translate-x-1/2 md:translate-x-0 md:left-2 md:bottom-2">
//                   <div className="bg-white/80 p-2 rounded-lg">
//                     <h3 className="text-black text-lg md:text-xl font-bold text-center md:text-left drop-shadow-lg">
//                       {imageiterator.name}
//                     </h3>
//                   </div>
//                 </div> */}
//                 {/* View More button - always visible on small screens, appears on hover for larger screens */}
//                 <div className="absolute bottom-4 right-4 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
//                   <Link
//                     href={imageiterator.viewMore}
//                     className="bg-[#eeb35a] hover:bg-orange-600 text-black font-semibold py-2 px-3 md:py-2 md:px-4 text-sm md:text-base rounded-lg transition-colors shadow-lg"
//                   >
//                     View More
//                   </Link>
//                 </div>
//                 <div className="absolute bottom-[-2] left-0">
//                   <div className="bg-white/80 p-2 rounded-lg">
//                     <h1 className="text-black text-lg md:text-xl font-bold text-center md:text-left drop-shadow-lg">
//                       {imageiterator.name}
//                     </h1>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>

//           <div className="text-center mt-12">
//             <Link
//               href="/quote"
//               className="inline-block bg-[#eeb35a] hover:bg-orange-400 text-black font-semibold px-8 py-4 rounded-lg text-lg transition-all shadow-lg hover:shadow-xl"
//             >
//               Get Your Custom Quote
//             </Link>
//           </div>
//         </div>
//       </section>

//       <PacifictideContact />

//       {/* CTA Section */}
//       {/* <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-800">
//         <div className="container mx-auto px-4 max-w-4xl text-center">
//           <h2 className="font-atkinson text-4xl md:text-5xl font-bold text-white mb-6">
//             Ready to Transform Your Backyard?
//           </h2>
//           <p className="text-xl text-blue-100 mb-8">
//             Experience the perfect balance of heat and cold therapy with Pacific
//             Tide
//           </p>
//           <div className="flex flex-col sm:flex-row gap-4 justify-center">
//             <Link
//               href="/quote"
//               className="bg-white hover:bg-gray-100 text-blue-600 font-semibold px-8 py-4 rounded-lg text-lg transition-all shadow-lg hover:shadow-xl"
//             >
//               Schedule a Consultation
//             </Link>
//             <Link
//               href="/service-areas"
//               className="bg-transparent hover:bg-white/10 border-2 border-white text-white font-semibold px-8 py-4 rounded-lg text-lg transition-all"
//             >
//               Check Service Areas
//             </Link>
//           </div>
//         </div>
//       </section> */}
//     </div>
//   );
// }
