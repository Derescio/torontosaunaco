// The 17 service-area city pages, in the hub's card order. Each design file's `route` gives the slug.
// Literal imports so the bundler includes every file; cities.test.js checks this matches content/redesign/City*.json.
import Toronto from "../../content/redesign/CityToronto.json";
import Mississauga from "../../content/redesign/CityMississauga.json";
import Markham from "../../content/redesign/CityMarkham.json";
import Aurora from "../../content/redesign/CityAurora.json";
import RichmondHill from "../../content/redesign/CityRichmondHill.json";
import Vaughan from "../../content/redesign/CityVaughan.json";
import KingTownship from "../../content/redesign/CityKingTownship.json";
import KingCity from "../../content/redesign/CityKingCity.json";
import Brooklin from "../../content/redesign/CityBrooklin.json";
import Whitby from "../../content/redesign/CityWhitby.json";
import PrinceEdwardCounty from "../../content/redesign/CityPrinceEdwardCounty.json";
import NiagaraOnTheLake from "../../content/redesign/CityNiagaraOnTheLake.json";
import Oakville from "../../content/redesign/CityOakville.json";
import Burlington from "../../content/redesign/CityBurlington.json";
import Muskoka from "../../content/redesign/CityMuskoka.json";
import Haliburton from "../../content/redesign/CityHaliburton.json";
import Collingwood from "../../content/redesign/CityCollingwood.json";

const PAGES = [
  Toronto,
  Mississauga,
  Markham,
  Aurora,
  RichmondHill,
  Vaughan,
  KingTownship,
  KingCity,
  Brooklin,
  Whitby,
  PrinceEdwardCounty,
  NiagaraOnTheLake,
  Oakville,
  Burlington,
  Muskoka,
  Haliburton,
  Collingwood,
];

const PREFIX = "/service-areas/";

export const CITIES = PAGES.map((page) => ({ slug: page.route.slice(PREFIX.length), route: page.route, page }));

const BY_SLUG = new Map(CITIES.map((city) => [city.slug, city]));

export function getCity(slug) {
  return BY_SLUG.get(slug);
}
