import type { Incident } from "../services/api";

const CACHE_KEY = "rescue_incidents_cache";
const CACHE_TIMESTAMP_KEY = "rescue_incidents_timestamp";
const CACHE_LOCATION_KEY = "rescue_incidents_location";
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

export const incidentCache = {
  get(lat: number, lng: number): Incident[] | null {
    try {
      const cachedData = localStorage.getItem(CACHE_KEY);
      const cachedTimestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
      const cachedLocation = localStorage.getItem(CACHE_LOCATION_KEY);

      if (!cachedData || !cachedTimestamp || !cachedLocation) {
        return null;
      }

      const timestamp = parseInt(cachedTimestamp, 10);
      const location = JSON.parse(cachedLocation);

      // Check if cache is expired
      if (Date.now() - timestamp > CACHE_DURATION_MS) {
        this.clear();
        return null;
      }

      // Check if location is roughly the same (within ~1km)
      const latDiff = Math.abs(location.lat - lat);
      const lngDiff = Math.abs(location.lng - lng);
      if (latDiff > 0.01 || lngDiff > 0.01) {
        return null;
      }

      return JSON.parse(cachedData);
    } catch (error) {
      console.error("Error reading incident cache:", error);
      return null;
    }
  },

  set(incidents: Incident[], lat: number, lng: number): void {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(incidents));
      localStorage.setItem(CACHE_TIMESTAMP_KEY, String(Date.now()));
      localStorage.setItem(CACHE_LOCATION_KEY, JSON.stringify({ lat, lng }));
    } catch (error) {
      console.error("Error writing incident cache:", error);
    }
  },

  update(incidents: Incident[]): void {
    try {
      const cachedLocation = localStorage.getItem(CACHE_LOCATION_KEY);
      if (cachedLocation) {
        localStorage.setItem(CACHE_KEY, JSON.stringify(incidents));
        localStorage.setItem(CACHE_TIMESTAMP_KEY, String(Date.now()));
      }
    } catch (error) {
      console.error("Error updating incident cache:", error);
    }
  },

  clear(): void {
    try {
      localStorage.removeItem(CACHE_KEY);
      localStorage.removeItem(CACHE_TIMESTAMP_KEY);
      localStorage.removeItem(CACHE_LOCATION_KEY);
    } catch (error) {
      console.error("Error clearing incident cache:", error);
    }
  },
};
