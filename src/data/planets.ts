export type PlanetLayer = {
  name: string;
  radius: number;
  color?: string;
  texturePath?: string;
  depth: string;
  temperature: string;
  description: string;
};

export type CelestialBody = {
  name: string;
  color: string;
  radius: number;
  distance: number;
  speed: number;
  /** Sidereal orbital period in Earth days. Omitted for the Sun. */
  orbitalPeriod?: number;
  /** Orbital eccentricity (0 = circle). */
  eccentricity: number;
  /** Axial tilt in degrees. */
  axialTilt: number;
  description?: string;
  atmosphere?: string;
  orbitalSpeed?: string;
  texturePath?: string;
  moons?: CelestialBody[];
  layers?: PlanetLayer[];
  hasRings?: boolean;
  ringTexturePath?: string;
  ringInnerRadius?: number;
  ringOuterRadius?: number;
  pois?: PlanetPoi[];
};

export type PlanetPoi = {
  name: string;
  lat: number;
  lon: number;
};

export const EARTH_NIGHT_TEXTURE = "/textures/8k_earth_nightmap.jpg";
export const EARTH_CLOUDS_TEXTURE = "/textures/8k_earth_clouds.jpg";

// Visual (not astronomical) scale: Sun is large but usable in-frame, Earth is ~1.
export const planets: CelestialBody[] = [
  {
    name: "Sun",
    color: "#FDB813",
    radius: 6,
    distance: 0,
    speed: 0,
    eccentricity: 0,
    axialTilt: 7.25,
    description:
      "A G-type main-sequence star at the center of the system, fusing hydrogen into helium and anchoring every orbit.",
    atmosphere: "Hydrogen, Helium",
    orbitalSpeed: "828,000 km/h (galactic)",
    texturePath: "/textures/8k_sun.jpg",
  },
  {
    name: "Mercury",
    color: "#9F9B95",
    radius: 0.38,
    distance: 10,
    speed: 0.85,
    orbitalPeriod: 88,
    eccentricity: 0.2056,
    axialTilt: 0.03,
    description:
      "The smallest planet and the closest to the Sun, a cratered world of extreme temperature swings and no lasting air.",
    atmosphere: "Exosphere (O, Na, H, He)",
    orbitalSpeed: "172,800 km/h",
    texturePath: "/textures/8k_mercury.jpg",
  },
  {
    name: "Venus",
    color: "#E3BB76",
    radius: 0.95,
    distance: 14,
    speed: 0.62,
    orbitalPeriod: 225,
    eccentricity: 0.0067,
    axialTilt: 177.4,
    description:
      "A furnace world wrapped in sulfuric clouds, with surface pressure crushing enough to flatten spacecraft.",
    atmosphere: "Carbon Dioxide, Nitrogen",
    orbitalSpeed: "126,000 km/h",
    texturePath: "/textures/8k_venus_surface.jpg",
  },
  {
    name: "Earth",
    color: "#3b82f6",
    radius: 1,
    distance: 18,
    speed: 0.45,
    orbitalPeriod: 365.25,
    eccentricity: 0.0167,
    axialTilt: 23.5,
    description:
      "The only known world with liquid oceans and life, its climate balanced by a nitrogen-oxygen sky and a magnetic shield.",
    atmosphere: "Nitrogen, Oxygen",
    orbitalSpeed: "107,200 km/h",
    texturePath: "/textures/8k_earth_daymap.jpg",
    moons: [
      {
        name: "Moon",
        color: "#cfc8be",
        radius: 0.27,
        distance: 2.4,
        speed: 1.6,
        orbitalPeriod: 27.3,
        eccentricity: 0.0549,
        axialTilt: 6.68,
        description:
          "Earth's only natural satellite, tidally locked, sculpting tides and stabilizing the planet's axial tilt.",
        atmosphere: "None (trace exosphere)",
        orbitalSpeed: "3,683 km/h",
        texturePath: "/textures/8k_moon.jpg",
      },
    ],
    layers: [
      {
        name: "Inner Core",
        radius: 0.4,
        color: "#ffeb3b",
        depth: "5,150 km",
        temperature: "5,430°C",
        description:
          "A solid sphere of iron and nickel. Extreme pressure keeps it solid even though it is hotter than the surface of the Sun.",
      },
      {
        name: "Mantle",
        radius: 0.7,
        color: "#ff4500",
        depth: "2,900 km",
        temperature: "3,700°C",
        description:
          "A vast shell of slowly convecting silicate rock. Its motion drives plate tectonics and carries heat from the core toward the surface.",
      },
      {
        name: "Crust",
        radius: 1,
        texturePath: "/textures/8k_earth_daymap.jpg",
        depth: "0 - 70 km",
        temperature: "15°C",
        description:
          "Earth's rigid outer skin of basaltic and granitic rock, thin under the oceans and much thicker beneath the continents.",
      },
    ],
    pois: [
      { name: "New York", lat: 40.7128, lon: -74.006 },
      { name: "Mount Everest", lat: 27.9881, lon: 86.925 },
    ],
  },
  {
    name: "Mars",
    color: "#C1440E",
    radius: 0.53,
    distance: 23,
    speed: 0.36,
    orbitalPeriod: 687,
    eccentricity: 0.0934,
    axialTilt: 25.2,
    description:
      "A cold desert planet of rusted dust, extinct volcanoes, and polar ice, with the largest canyon in the system.",
    atmosphere: "Carbon Dioxide, Argon, Nitrogen",
    orbitalSpeed: "86,800 km/h",
    texturePath: "/textures/8k_mars.jpg",
    pois: [
      { name: "Perseverance Rover", lat: 18.4447, lon: 77.4508 },
      { name: "Olympus Mons", lat: 18.65, lon: 226.2 },
    ],
  },
  {
    name: "Jupiter",
    color: "#C88B3A",
    radius: 2.8,
    distance: 32,
    speed: 0.18,
    orbitalPeriod: 4333,
    eccentricity: 0.0489,
    axialTilt: 3.13,
    description:
      "The largest planet, a hydrogen-helium giant whose Great Red Spot is a storm older than recorded history.",
    atmosphere: "Hydrogen, Helium",
    orbitalSpeed: "47,000 km/h",
    texturePath: "/textures/8k_jupiter.jpg",
  },
  {
    name: "Saturn",
    color: "#E4D191",
    radius: 2.4,
    distance: 42,
    speed: 0.13,
    orbitalPeriod: 10759,
    eccentricity: 0.0565,
    axialTilt: 26.7,
    description:
      "A pale gas giant famous for its icy ring system, light enough that it would float in a sea large enough to hold it.",
    atmosphere: "Hydrogen, Helium",
    orbitalSpeed: "34,900 km/h",
    texturePath: "/textures/saturn.jpg",
    hasRings: true,
    ringTexturePath: "/textures/saturn_ring.png",
    ringInnerRadius: 1.2,
    ringOuterRadius: 2.2,
  },
  {
    name: "Uranus",
    color: "#7EC8E3",
    radius: 1.6,
    distance: 52,
    speed: 0.09,
    orbitalPeriod: 30687,
    eccentricity: 0.0472,
    axialTilt: 97.8,
    description:
      "An ice giant rolled onto its side, pale cyan from methane, with faint rings and a magnetic field badly askew.",
    atmosphere: "Hydrogen, Helium, Methane",
    orbitalSpeed: "24,500 km/h",
    texturePath: "/textures/8k_uranus.jpg",
  },
  {
    name: "Neptune",
    color: "#4166F5",
    radius: 1.55,
    distance: 62,
    speed: 0.07,
    orbitalPeriod: 60190,
    eccentricity: 0.0086,
    axialTilt: 28.3,
    description:
      "The farthest planet, a deep-blue ice giant where supersonic winds tear around a cold methane atmosphere.",
    atmosphere: "Hydrogen, Helium, Methane",
    orbitalSpeed: "19,400 km/h",
    texturePath: "/textures/8k_neptune.jpg",
  },
];
