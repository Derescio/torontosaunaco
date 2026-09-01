const CLOUDINARY_UPLOAD =
  "https://res.cloudinary.com/dw4ev5whz/image/upload";

export function customBuildCompareSrc(versionedPath) {
  return `${CLOUDINARY_UPLOAD}/f_auto,q_auto,c_limit,w_1400/${versionedPath}`;
}

export const BEFORE_AFTER_PAIRS = [
  {
    id: "green-floor",
    title: "Custom Build, Toronto, ON",
    beforeSrc: customBuildCompareSrc(
      "v1788118999/torontosaunaco/custom_Builds/Green_Floor_Start_dxabea.jpg",
    ),
    afterSrc: customBuildCompareSrc(
      "v1788118999/torontosaunaco/custom_Builds/Green_Floor_Finish_nitfh1.jpg",
    ),
    beforeAlt:
      "Custom sauna room during construction, with greenboard walls and a waterproofed floor",
    afterAlt:
      "Finished custom cedar sauna room with benches and a dark tile floor",
  },
  {
    id: "glass-front",
    title: "Custom Build, King City, ON",
    beforeSrc: customBuildCompareSrc(
      "v1788119000/torontosaunaco/custom_Builds/IMG-20260830-WA0008_fimttf.jpg",
    ),
    afterSrc: customBuildCompareSrc(
      "v1788119001/torontosaunaco/custom_Builds/IMG-20260830-WA0007_zwjnzc.jpg",
    ),
    beforeAlt:
      "Framed sauna alcove during construction, with insulation and building materials still in place",
    afterAlt:
      "Finished glass-front cedar sauna with benches, heater, and warm lighting",
  },
  {
    id: "kids-room",
    title: "Custom Build, King City, ON",
    beforeSrc: customBuildCompareSrc(
      "v1788118999/torontosaunaco/custom_Builds/Kids_Room_Start_lqnuqz.jpg",
    ),
    afterSrc: customBuildCompareSrc(
      "v1788119000/torontosaunaco/custom_Builds/Kids_Room_Finish_fwigs8.jpg",
    ),
    beforeAlt:
      "Cluttered basement playroom and storage area before the custom sauna build",
    afterAlt:
      "Finished custom cedar sauna room built into the former playroom",
  },
];
