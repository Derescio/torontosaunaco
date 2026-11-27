import { render, screen } from "@testing-library/react";
import SiteImage, { imageFor } from "./SiteImage";
import { cloudinaryLoader } from "./CloudinaryImage";
import About from "../../content/redesign/About.json";
import imageMap from "../../content/image-map.json";

const hero = About.sections[0].blocks.find((b) => b.type === "image");
const hash = hero.src.match(/([0-9a-f]{32})/)[1];

describe("cloudinaryLoader", () => {
  it("asks Cloudinary for the width, auto format and quality", () => {
    expect(cloudinaryLoader({ src: "https://res.cloudinary.com/c/image/upload/v1/redesign/x.jpg", width: 640 })).toBe(
      "https://res.cloudinary.com/c/image/upload/f_auto,q_auto,w_640/v1/redesign/x.jpg"
    );
    expect(cloudinaryLoader({ src: "https://res.cloudinary.com/c/image/upload/redesign/x.jpg", width: 320, quality: 60 })).toBe(
      "https://res.cloudinary.com/c/image/upload/f_auto,q_60,w_320/redesign/x.jpg"
    );
  });
});

describe("SiteImage", () => {
  it("resolves a design image through the map", () => {
    expect(imageFor(hero.src)).toEqual({ ...imageMap[hash], hash });
    expect(imageMap[hash].url).toMatch(/^https:\/\/res\.cloudinary\.com\//);
  });

  it("throws for an image that isn't uploaded", () => {
    expect(() => imageFor("./assets/ffffffffffffffffffffffffffffffff.jpg")).toThrow(/no Cloudinary image/);
  });

  it("renders a Cloudinary-sized image with the map's dimensions", () => {
    render(<SiteImage src={hero.src} alt={hero.alt} sizes="50vw" />);
    const img = screen.getByAltText(hero.alt);
    expect(img).toHaveAttribute("width", String(imageMap[hash].width));
    expect(img).toHaveAttribute("height", String(imageMap[hash].height));
    expect(img.getAttribute("src")).toMatch(/res\.cloudinary\.com\/.*\/upload\/f_auto,q_auto,w_\d+\//);
  });

  it("requires sizes", () => {
    expect(() => render(<SiteImage src={hero.src} alt="x" />)).toThrow(/sizes/);
  });
});
