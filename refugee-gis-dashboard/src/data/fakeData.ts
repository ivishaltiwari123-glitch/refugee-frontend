// Fake tent polygons near Syria coordinates
export const TENT_DATA = Array.from({ length: 40 }, (_, i) => ({
  id: i + 1,
  lat: 33.48 + (Math.random() * 0.06),
  lng: 36.26 + (Math.random() * 0.09),
  family: Math.floor(Math.random() * 8) + 1,
  needs: (['Water', 'Medical', 'Food', 'None', 'Water + Food', 'Medical + Water'] as const)[Math.floor(Math.random() * 6)],
  zone: (['A', 'B', 'C', 'D', 'E'] as const)[Math.floor(Math.random() * 5)],
}))

export const WATER_POINTS = [
  { id: 1, lat: 33.495, lng: 36.28, status: 'critical', dailyUsage: 2400, capacity: 3600 },
  { id: 2, lat: 33.510, lng: 36.305, status: 'ok', dailyUsage: 1800, capacity: 4000 },
  { id: 3, lat: 33.485, lng: 36.32, status: 'warning', dailyUsage: 3200, capacity: 3500 },
  { id: 4, lat: 33.520, lng: 36.295, status: 'ok', dailyUsage: 900, capacity: 2000 },
  { id: 5, lat: 33.502, lng: 36.34, status: 'ok', dailyUsage: 1200, capacity: 2800 },
]

export const LATRINES = [
  { id: 1, lat: 33.490, lng: 36.27, capacity: 85, users: 340 },
  { id: 2, lat: 33.505, lng: 36.285, capacity: 60, users: 210 },
  { id: 3, lat: 33.498, lng: 36.31, capacity: 75, users: 280 },
  { id: 4, lat: 33.515, lng: 36.325, capacity: 90, users: 190 },
  { id: 5, lat: 33.488, lng: 36.335, capacity: 55, users: 320 },
]

export const SOLAR_PANELS = [
  { id: 1, lat: 33.508, lng: 36.272, watts: 2400, status: 'active' },
  { id: 2, lat: 33.492, lng: 36.298, watts: 1800, status: 'active' },
  { id: 3, lat: 33.518, lng: 36.315, watts: 3200, status: 'maintenance' },
]

export const ROADS = [
  [[33.480, 36.260], [33.485, 36.280], [33.490, 36.295], [33.498, 36.310], [33.505, 36.330], [33.512, 36.345]],
  [[33.480, 36.280], [33.492, 36.285], [33.505, 36.285], [33.518, 36.290]],
  [[33.490, 36.295], [33.495, 36.310], [33.500, 36.325]],
]

export const DRONE_FLIGHTS = [
  { id: 'flight-47', label: 'Flight #47 — Today 11:23', area: 'North + Central', coverage: 94, images: 847 },
  { id: 'flight-46', label: 'Flight #46 — Yesterday 09:15', area: 'South Zone', coverage: 88, images: 612 },
  { id: 'flight-45', label: 'Flight #45 — 2 days ago', area: 'East + Central', coverage: 91, images: 734 },
  { id: 'flight-44', label: 'Flight #44 — 3 days ago', area: 'West Zone', coverage: 79, images: 521 },
]

export const POPULATION_HISTORY = [
  { day: 'Mon', pop: 7820 },
  { day: 'Tue', pop: 7965 },
  { day: 'Wed', pop: 8012 },
  { day: 'Thu', pop: 8180 },
  { day: 'Fri', pop: 8247 },
  { day: 'Sat', pop: 8247 },
  { day: 'Sun', pop: 8247 },
]

export const AID_DELIVERY_TIMES = [
  { route: 'WH→A', minutes: 23 },
  { route: 'WH→B', minutes: 31 },
  { route: 'WH→C', minutes: 18 },
  { route: 'WH→D', minutes: 41 },
  { route: 'WH→E', minutes: 27 },
]

export const RESOURCE_STOCK = [
  { item: 'Water', stock: 33, critical: 20 },
  { item: 'Food', stock: 55, critical: 30 },
  { item: 'Medical', stock: 88, critical: 40 },
  { item: 'Shelter', stock: 71, critical: 50 },
  { item: 'Fuel', stock: 42, critical: 25 },
]
