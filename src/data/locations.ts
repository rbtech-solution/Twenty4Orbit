export type City = {
  name: string;
  country: string;
  lat: number;
  lng: number;
  population: string;
  weather: string;
  description: string;
};

export const cities: City[] = [
  {
    name: "Tokyo",
    country: "Japan",
    lat: 35.6762,
    lng: 139.6503,
    population: "37.4 million",
    weather: "22°C, Partly Cloudy",
    description:
      "The world's largest metropolitan area, a dense megacity of neon districts, temples, and high-speed rail wrapped around Tokyo Bay.",
  },
  {
    name: "New York",
    country: "United States",
    lat: 40.7128,
    lng: -74.006,
    population: "19.9 million",
    weather: "18°C, Clear",
    description:
      "A global financial and cultural capital, packed onto islands at the mouth of the Hudson with a skyline that defines the modern city.",
  },
  {
    name: "London",
    country: "United Kingdom",
    lat: 51.5074,
    lng: -0.1278,
    population: "9.8 million",
    weather: "14°C, Light Rain",
    description:
      "A river city of layered history, from Roman walls to glass towers, still the political and commercial heart of the United Kingdom.",
  },
  {
    name: "Sydney",
    country: "Australia",
    lat: -33.8688,
    lng: 151.2093,
    population: "5.3 million",
    weather: "24°C, Sunny",
    description:
      "A harbor metropolis framed by sandstone headlands, known for its opera house, beaches, and a climate shaped by the Tasman Sea.",
  },
  {
    name: "Cairo",
    country: "Egypt",
    lat: 30.0444,
    lng: 31.2357,
    population: "22.1 million",
    weather: "31°C, Haze",
    description:
      "Africa's largest city, stretched along the Nile beside the Giza plateau, where ancient monuments sit against a vast desert metropolis.",
  },
];

export type FlightPath = {
  start: string;
  end: string;
};

export const flightPaths: FlightPath[] = [
  { start: "New York", end: "Tokyo" },
  { start: "London", end: "New York" },
  { start: "London", end: "Cairo" },
  { start: "Sydney", end: "Tokyo" },
];
