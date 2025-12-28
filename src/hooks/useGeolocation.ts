import { useCallback, useEffect, useState } from "react";

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  loading: boolean;
  error: string | null;
  permissionState: PermissionState | null;
  address: string | null;
}

export const useGeolocation = (requestOnMount = true) => {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    loading: true,
    error: null,
    permissionState: null,
    address: null,
  });

  // Reverse geocode to get address
  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const mapboxToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxToken}&types=locality,place,neighborhood`
      );
      const data = await response.json();
      if (data.features && data.features.length > 0) {
        return data.features[0].place_name;
      }
      return null;
    } catch {
      return null;
    }
  };

  const requestPermission = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    // Check if geolocation is supported
    if (!navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: "Geolocation is not supported by your browser",
      }));
      return;
    }

    // Check permission status if available
    if (navigator.permissions) {
      try {
        const permission = await navigator.permissions.query({
          name: "geolocation",
        });
        setState((prev) => ({ ...prev, permissionState: permission.state }));

        permission.onchange = () => {
          setState((prev) => ({ ...prev, permissionState: permission.state }));
        };
      } catch {
        // Permissions API not fully supported
      }
    }

    // Request location
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        const address = await reverseGeocode(latitude, longitude);
        setState({
          latitude,
          longitude,
          accuracy,
          loading: false,
          error: null,
          permissionState: "granted",
          address,
        });
      },
      (error) => {
        let errorMessage = "Unable to get your location";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location permission denied";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information unavailable";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out";
            break;
        }
        setState((prev) => ({
          ...prev,
          loading: false,
          error: errorMessage,
          permissionState: "denied",
        }));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes cache
      }
    );
  }, []);

  // Watch position for real-time updates
  useEffect(() => {
    let watchId: number;

    if (state.permissionState === "granted") {
      watchId = navigator.geolocation.watchPosition(
        async (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          // Only update address if position changed significantly (100m)
          const shouldUpdateAddress =
            !state.latitude ||
            !state.longitude ||
            Math.abs(latitude - state.latitude) > 0.001 ||
            Math.abs(longitude - state.longitude) > 0.001;

          const address = shouldUpdateAddress
            ? await reverseGeocode(latitude, longitude)
            : state.address;

          setState((prev) => ({
            ...prev,
            latitude,
            longitude,
            accuracy,
            address: address || prev.address,
          }));
        },
        () => {}, // Ignore watch errors
        {
          enableHighAccuracy: false,
          timeout: 30000,
          maximumAge: 60000,
        }
      );
    }

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [state.permissionState]);

  // Request on mount if enabled
  useEffect(() => {
    if (requestOnMount) {
      requestPermission();
    }
  }, [requestOnMount, requestPermission]);

  return {
    ...state,
    requestPermission,
  };
};
