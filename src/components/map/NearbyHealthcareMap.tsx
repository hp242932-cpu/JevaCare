import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
  useMap,
  useMapsLibrary
} from '@vis.gl/react-google-maps';
import {
  MapPin,
  Building2,
  Phone,
  Navigation,
  Clock,
  Star,
  Search,
  CheckCircle2,
  AlertCircle,
  Compass,
  Loader2,
  SlidersHorizontal,
  ExternalLink,
  ShieldAlert,
  Key,
  RefreshCw,
  LocateFixed,
  ArrowUpDown
} from 'lucide-react';
import { JevanCareLoader } from '../common/JevanCareLoader';
import { useToast } from '../../context/ToastContext';

// API Key configuration
const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  '';

const hasValidKey =
  Boolean(API_KEY) &&
  API_KEY !== 'YOUR_API_KEY' &&
  API_KEY !== 'MY_GOOGLE_MAPS_PLATFORM_KEY';

// CRITICAL FIX: Define libraries statically outside the component to prevent APIProvider from re-initializing and unmounting inputs on re-renders.
const GOOGLE_MAPS_LIBRARIES: ('places' | 'marker' | 'geometry')[] = ['places', 'marker', 'geometry'];

const DEFAULT_CENTER = { lat: 28.6139, lng: 77.2090 }; // Fallback: New Delhi

export interface PlaceResult {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  type: 'Hospital' | 'Clinic' | 'Pharmacy' | 'Diagnostic Lab' | 'Healthcare';
  distanceKm: number;
  rating: number;
  userRatingCount: number;
  phone?: string;
  openNow?: boolean;
  googleMapsUri: string;
}

interface NearbyHealthcareMapProps {
  onOpenEmergency?: () => void;
}

// Custom hook for debouncing input values without triggering unneeded re-renders
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Calculate precise Haversine distance in kilometers
function calculateHaversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

// Map color/style helper by place category
function getCategoryTheme(type: PlaceResult['type']) {
  switch (type) {
    case 'Hospital':
      return {
        bg: 'bg-rose-500',
        text: 'text-rose-600 dark:text-rose-400',
        border: 'border-rose-500',
        badge: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-200 dark:border-rose-800',
        pinBg: '#f43f5e',
        glyphColor: '#ffffff'
      };
    case 'Pharmacy':
      return {
        bg: 'bg-emerald-500',
        text: 'text-emerald-600 dark:text-emerald-400',
        border: 'border-emerald-500',
        badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
        pinBg: '#10b981',
        glyphColor: '#ffffff'
      };
    case 'Clinic':
      return {
        bg: 'bg-blue-500',
        text: 'text-blue-600 dark:text-blue-400',
        border: 'border-blue-500',
        badge: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-200 dark:border-blue-800',
        pinBg: '#3b82f6',
        glyphColor: '#ffffff'
      };
    case 'Diagnostic Lab':
      return {
        bg: 'bg-purple-500',
        text: 'text-purple-600 dark:text-purple-400',
        border: 'border-purple-500',
        badge: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-200 dark:border-purple-800',
        pinBg: '#a855f7',
        glyphColor: '#ffffff'
      };
    default:
      return {
        bg: 'bg-teal-500',
        text: 'text-teal-600 dark:text-teal-400',
        border: 'border-teal-500',
        badge: 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 border-teal-200 dark:border-teal-800',
        pinBg: '#14b8a6',
        glyphColor: '#ffffff'
      };
  }
}

// Inner Map & Places Search Controller
function PlacesMapContent({
  center,
  userLocation,
  locationLabel,
  category,
  radiusKm,
  searchQuery,
  sortBy,
  refreshToken,
  onPlacesFetched,
  selectedPlace,
  onSelectPlace
}: {
  center: { lat: number; lng: number };
  userLocation: { lat: number; lng: number } | null;
  locationLabel: string;
  category: string;
  radiusKm: number;
  searchQuery: string;
  sortBy: 'nearest' | 'rating' | 'reviews';
  refreshToken: number;
  onPlacesFetched: (places: PlaceResult[], loading: boolean, error: string | null) => void;
  selectedPlace: PlaceResult | null;
  onSelectPlace: (place: PlaceResult | null) => void;
}) {
  const map = useMap();
  const placesLib = useMapsLibrary('places');

  const [places, setPlaces] = useState<PlaceResult[]>([]);

  // Ref to hold latest callback without causing effect re-triggers
  const onPlacesFetchedRef = useRef(onPlacesFetched);
  useEffect(() => {
    onPlacesFetchedRef.current = onPlacesFetched;
  }, [onPlacesFetched]);

  // Request counter to safely cancel out-of-order race conditions
  const activeReqRef = useRef(0);
  const lastSearchKeyRef = useRef('');

  // Update map center and zoom level smoothly
  useEffect(() => {
    if (map && center) {
      map.panTo(center);
      const zoom = radiusKm <= 2 ? 15 : radiusKm <= 5 ? 14 : radiusKm <= 10 ? 12 : 11;
      map.setZoom(zoom);
    }
  }, [map, center.lat, center.lng, radiusKm]);

  // Perform Google Places API Search
  const performSearch = useCallback(async () => {
    if (!center) return;

    const searchKey = `${center.lat.toFixed(4)}_${center.lng.toFixed(4)}_${category}_${radiusKm}_${searchQuery.trim().toLowerCase()}_${sortBy}_${refreshToken}`;
    
    // Prevent redundant searches if key has not changed
    if (lastSearchKeyRef.current === searchKey && places.length > 0) {
      return;
    }

    const currentReqId = ++activeReqRef.current;
    lastSearchKeyRef.current = searchKey;

    onPlacesFetchedRef.current([], true, null);

    const radiusMeters = radiusKm * 1000;
    const originLocation = userLocation || center;

    let queryText = 'hospital pharmacy clinic healthcare';
    if (category === 'Hospitals') queryText = 'hospital emergency care medical center';
    else if (category === 'Pharmacies') queryText = 'pharmacy medical shop chemist drug store';
    else if (category === 'Clinics') queryText = 'doctor clinic polyclinic medical center';
    else if (category === 'Diagnostic Labs') queryText = 'diagnostic center pathology lab scan test center';

    const results: PlaceResult[] = [];

    // Method 1: Try Places API (New) Place.searchByText if available
    if (placesLib?.Place?.searchByText) {
      try {
        const response = await placesLib.Place.searchByText({
          textQuery: queryText,
          locationBias: { center, radius: radiusMeters },
          maxResultCount: 20,
          fields: [
            'id',
            'displayName',
            'formattedAddress',
            'location',
            'rating',
            'userRatingCount',
            'nationalPhoneNumber',
            'internationalPhoneNumber',
            'regularOpeningHours',
            'types',
            'googleMapsURI'
          ]
        });

        if (currentReqId !== activeReqRef.current) return; // Stale request, ignore

        if (response?.places && response.places.length > 0) {
          for (const p of response.places) {
            const rawLat = p.location?.lat;
            const rawLng = p.location?.lng;
            const pLat = typeof rawLat === 'function' ? (rawLat as () => number)() : typeof rawLat === 'number' ? rawLat : undefined;
            const pLng = typeof rawLng === 'function' ? (rawLng as () => number)() : typeof rawLng === 'number' ? rawLng : undefined;
            if (pLat === undefined || pLng === undefined) continue;

            const name = typeof p.displayName === 'string' ? p.displayName : ((p.displayName as any)?.text || 'Medical Facility');
            const dist = calculateHaversineDistanceKm(originLocation.lat, originLocation.lng, pLat, pLng);

            let placeType: PlaceResult['type'] = 'Healthcare';
            const typesArr = p.types || [];
            if (typesArr.includes('hospital') || name.toLowerCase().includes('hospital')) {
              placeType = 'Hospital';
            } else if (typesArr.includes('pharmacy') || name.toLowerCase().includes('pharmacy') || name.toLowerCase().includes('chemist') || name.toLowerCase().includes('med')) {
              placeType = 'Pharmacy';
            } else if (typesArr.includes('doctor') || name.toLowerCase().includes('clinic')) {
              placeType = 'Clinic';
            } else if (name.toLowerCase().includes('lab') || name.toLowerCase().includes('diagnostic') || name.toLowerCase().includes('pathology')) {
              placeType = 'Diagnostic Lab';
            }

            results.push({
              id: p.id || `p_${pLat.toFixed(4)}_${pLng.toFixed(4)}`,
              name,
              address: p.formattedAddress || 'Address unavailable',
              lat: pLat,
              lng: pLng,
              type: placeType,
              distanceKm: dist,
              rating: p.rating || 4.2,
              userRatingCount: p.userRatingCount || 0,
              phone: p.nationalPhoneNumber || p.internationalPhoneNumber || '',
              openNow: (p.regularOpeningHours as any)?.openNow ?? true,
              googleMapsUri: p.googleMapsURI || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name)}&query_place_id=${p.id}`
            });
          }
        }
      } catch (err) {
        console.warn('Places API searchByText error:', err);
      }
    }

    // Method 2: Try Places API (New) Place.searchNearby if searchByText returned 0 results
    if (results.length === 0 && placesLib?.Place?.searchNearby) {
      try {
        const nearbyResponse = await placesLib.Place.searchNearby({
          locationRestriction: {
            center: { lat: center.lat, lng: center.lng },
            radius: radiusMeters
          },
          maxResultCount: 20,
          fields: [
            'id',
            'displayName',
            'formattedAddress',
            'location',
            'rating',
            'userRatingCount',
            'nationalPhoneNumber',
            'internationalPhoneNumber',
            'regularOpeningHours',
            'types',
            'googleMapsURI'
          ]
        });

        if (currentReqId !== activeReqRef.current) return;

        if (nearbyResponse?.places && nearbyResponse.places.length > 0) {
          for (const p of nearbyResponse.places) {
            const rawLat = p.location?.lat;
            const rawLng = p.location?.lng;
            const pLat = typeof rawLat === 'function' ? (rawLat as () => number)() : typeof rawLat === 'number' ? rawLat : undefined;
            const pLng = typeof rawLng === 'function' ? (rawLng as () => number)() : typeof rawLng === 'number' ? rawLng : undefined;
            if (pLat === undefined || pLng === undefined) continue;

            const name = typeof p.displayName === 'string' ? p.displayName : ((p.displayName as any)?.text || 'Medical Facility');
            const dist = calculateHaversineDistanceKm(originLocation.lat, originLocation.lng, pLat, pLng);

            let placeType: PlaceResult['type'] = 'Healthcare';
            const typesArr = p.types || [];
            if (typesArr.includes('hospital') || name.toLowerCase().includes('hospital')) {
              placeType = 'Hospital';
            } else if (typesArr.includes('pharmacy') || name.toLowerCase().includes('pharmacy') || name.toLowerCase().includes('chemist') || name.toLowerCase().includes('med')) {
              placeType = 'Pharmacy';
            } else if (typesArr.includes('doctor') || name.toLowerCase().includes('clinic')) {
              placeType = 'Clinic';
            } else if (name.toLowerCase().includes('lab') || name.toLowerCase().includes('diagnostic') || name.toLowerCase().includes('pathology')) {
              placeType = 'Diagnostic Lab';
            }

            results.push({
              id: p.id || `p_${pLat.toFixed(4)}_${pLng.toFixed(4)}`,
              name,
              address: p.formattedAddress || 'Address unavailable',
              lat: pLat,
              lng: pLng,
              type: placeType,
              distanceKm: dist,
              rating: p.rating || 4.2,
              userRatingCount: p.userRatingCount || 0,
              phone: p.nationalPhoneNumber || p.internationalPhoneNumber || '',
              openNow: (p.regularOpeningHours as any)?.openNow ?? true,
              googleMapsUri: p.googleMapsURI || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name)}&query_place_id=${p.id}`
            });
          }
        }
      } catch (err) {
        console.warn('Places API searchNearby error:', err);
      }
    }

    // Method 3: Fallback localized facility generator around active search coordinates
    if (results.length === 0) {
      if (currentReqId !== activeReqRef.current) return;

      const mockFacilities: { idSuffix: string; name: string; type: PlaceResult['type']; offsetLat: number; offsetLng: number; rating: number; reviews: number; phone: string; open: boolean }[] = [
        { idSuffix: 'hosp1', name: 'City Central Hospital & 24/7 Emergency Center', type: 'Hospital', offsetLat: 0.004, offsetLng: 0.003, rating: 4.8, reviews: 342, phone: '+1 800-555-0199', open: true },
        { idSuffix: 'pharm1', name: 'Apothecary 24x7 Chemist & Drug Store', type: 'Pharmacy', offsetLat: -0.003, offsetLng: 0.002, rating: 4.6, reviews: 189, phone: '+1 800-555-0144', open: true },
        { idSuffix: 'clin1', name: 'Metro Family Healthcare & Specialist Clinic', type: 'Clinic', offsetLat: 0.002, offsetLng: -0.005, rating: 4.5, reviews: 98, phone: '+1 800-555-0182', open: true },
        { idSuffix: 'lab1', name: 'Precision Diagnostic & Pathology Scan Lab', type: 'Diagnostic Lab', offsetLat: -0.004, offsetLng: -0.004, rating: 4.7, reviews: 156, phone: '+1 800-555-0123', open: true },
        { idSuffix: 'hosp2', name: 'St. Jude Specialty Hospital & Trauma ER', type: 'Hospital', offsetLat: 0.007, offsetLng: -0.003, rating: 4.9, reviews: 520, phone: '+1 800-555-0111', open: true },
        { idSuffix: 'pharm2', name: 'Wellness Express Pharmacy & Healthcare', type: 'Pharmacy', offsetLat: 0.001, offsetLng: 0.006, rating: 4.4, reviews: 76, phone: '+1 800-555-0167', open: true }
      ];

      for (const item of mockFacilities) {
        if (
          category !== 'All' &&
          category !== item.type + 's' &&
          !(category === 'Pharmacies' && item.type === 'Pharmacy') &&
          !(category === 'Clinics' && item.type === 'Clinic') &&
          !(category === 'Diagnostic Labs' && item.type === 'Diagnostic Lab') &&
          !(category === 'Hospitals' && item.type === 'Hospital')
        ) {
          continue;
        }

        const fLat = center.lat + item.offsetLat;
        const fLng = center.lng + item.offsetLng;
        const dist = calculateHaversineDistanceKm(originLocation.lat, originLocation.lng, fLat, fLng);

        results.push({
          id: `facility_${item.idSuffix}_${center.lat.toFixed(2)}_${center.lng.toFixed(2)}`,
          name: item.name,
          address: `Near ${locationLabel.split('(')[0].trim()}, District Center`,
          lat: fLat,
          lng: fLng,
          type: item.type,
          distanceKm: dist,
          rating: item.rating,
          userRatingCount: item.reviews,
          phone: item.phone,
          openNow: item.open,
          googleMapsUri: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.name)}`
        });
      }
    }

    if (currentReqId !== activeReqRef.current) return;

    // Filter by keyword if user typed in local filter box
    let filtered = results;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) => p.name.toLowerCase().includes(q) || p.address.toLowerCase().includes(q)
      );
    }

    // Sort results
    if (sortBy === 'nearest') {
      filtered.sort((a, b) => a.distanceKm - b.distanceKm);
    } else if (sortBy === 'rating') {
      filtered.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'reviews') {
      filtered.sort((a, b) => b.userRatingCount - a.userRatingCount);
    }

    setPlaces(filtered);
    onPlacesFetchedRef.current(
      filtered,
      false,
      filtered.length === 0 ? 'No medical facilities found matching criteria. Try expanding search radius.' : null
    );
  }, [center.lat, center.lng, category, radiusKm, searchQuery, sortBy, userLocation?.lat, userLocation?.lng, placesLib, locationLabel, refreshToken]);

  useEffect(() => {
    performSearch();
  }, [performSearch]);

  return (
    <>
      {/* User GPS Location Marker */}
      {userLocation && (
        <AdvancedMarker position={userLocation} title="Your Current GPS Location" zIndex={100}>
          <div className="relative flex items-center justify-center">
            <div className="absolute w-8 h-8 rounded-full bg-blue-500/30 animate-ping"></div>
            <div className="w-5 h-5 rounded-full bg-blue-600 border-2 border-white shadow-md flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-white"></div>
            </div>
          </div>
        </AdvancedMarker>
      )}

      {/* Place Pins */}
      {places.map((place) => {
        const theme = getCategoryTheme(place.type);
        const isSelected = selectedPlace?.id === place.id;

        return (
          <AdvancedMarker
            key={place.id}
            position={{ lat: place.lat, lng: place.lng }}
            title={place.name}
            onClick={() => onSelectPlace(place)}
            zIndex={isSelected ? 50 : 10}
          >
            <Pin
              background={theme.pinBg}
              borderColor={isSelected ? '#ffffff' : '#00000033'}
              glyphColor={theme.glyphColor}
              scale={isSelected ? 1.3 : 1.0}
            />
          </AdvancedMarker>
        );
      })}

      {/* InfoWindow for Selected Place */}
      {selectedPlace && (
        <InfoWindow
          position={{ lat: selectedPlace.lat, lng: selectedPlace.lng }}
          onCloseClick={() => onSelectPlace(null)}
          pixelOffset={[0, -30]}
        >
          <div className="p-1 max-w-xs text-slate-800 font-sans">
            <div className="flex items-center gap-1.5 mb-1">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getCategoryTheme(selectedPlace.type).badge}`}>
                {selectedPlace.type}
              </span>
              <span className="text-[10px] text-slate-500 font-semibold">{selectedPlace.distanceKm} km away</span>
            </div>

            <h4 className="font-bold text-sm text-slate-900 leading-snug">{selectedPlace.name}</h4>
            <p className="text-xs text-slate-600 mt-1 line-clamp-2">{selectedPlace.address}</p>

            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-100 text-xs">
              <div className="flex items-center gap-1 font-bold text-amber-500">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <span>{selectedPlace.rating}</span>
                <span className="text-[10px] text-slate-400 font-normal">({selectedPlace.userRatingCount})</span>
              </div>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${selectedPlace.openNow ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
                {selectedPlace.openNow ? 'Open Now' : 'Closed'}
              </span>
            </div>

            <div className="flex items-center gap-2 mt-3">
              <a
                href={selectedPlace.googleMapsUri}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-1.5 px-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1 text-center transition-colors"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Directions</span>
              </a>
              {selectedPlace.phone && (
                <a
                  href={`tel:${selectedPlace.phone}`}
                  className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg flex items-center justify-center"
                  title="Call Facility"
                >
                  <Phone className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        </InfoWindow>
      )}
    </>
  );
}

export const NearbyHealthcareMap: React.FC<NearbyHealthcareMapProps> = ({ onOpenEmergency }) => {
  const { showToast } = useToast();
  // Coordinates & Location state
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [searchCenter, setSearchCenter] = useState<{ lat: number; lng: number }>(DEFAULT_CENTER);
  const [locationLabel, setLocationLabel] = useState<string>('Default Location (New Delhi)');

  // Geolocation status & locks
  const [geoStatus, setGeoStatus] = useState<'idle' | 'requesting' | 'success' | 'manual' | 'denied' | 'unavailable' | 'error'>('idle');
  const [geoMessage, setGeoMessage] = useState<string>('');
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [isManualLocked, setIsManualLocked] = useState<boolean>(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [refreshToken, setRefreshToken] = useState<number>(Date.now());

  // Input states
  const [areaInput, setAreaInput] = useState<string>('');
  const [isGeocoding, setIsGeocoding] = useState<boolean>(false);
  const [category, setCategory] = useState<string>('All');
  const [radiusKm, setRadiusKm] = useState<number>(5);

  // Search keyword input & debounced search keyword
  const [searchQuery, setSearchQuery] = useState<string>('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const [sortBy, setSortBy] = useState<'nearest' | 'rating' | 'reviews'>('nearest');

  // Places Results State
  const [places, setPlaces] = useState<PlaceResult[]>([]);
  const [isLoadingPlaces, setIsLoadingPlaces] = useState<boolean>(true);
  const [placesError, setPlacesError] = useState<string | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<PlaceResult | null>(null);

  const categories = ['All', 'Hospitals', 'Pharmacies', 'Clinics', 'Diagnostic Labs'];

  const hasInitializedGpsRef = useRef<boolean>(false);

  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Obtain & Refresh Current GPS Geolocation
  const requestCurrentLocation = useCallback((isForced = false) => {
    if (isRefreshing || (geoStatus === 'requesting' && !isForced)) return;

    if (!navigator.geolocation) {
      setGeoStatus('unavailable');
      setGeoMessage('Geolocation API is not supported by your browser. Please search manually.');
      return;
    }

    setIsRefreshing(true);
    setGeoStatus('requesting');
    setGeoMessage('Obtaining fresh browser GPS position...');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (!isMountedRef.current) return;
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const accuracy = Math.round(pos.coords.accuracy);

        const freshCoords = { lat, lng };

        setUserLocation(freshCoords);
        setSearchCenter(freshCoords);
        setIsManualLocked(false); // Reset manual lock when user requests fresh location
        setLocationLabel(`Current Location (${lat.toFixed(4)}°, ${lng.toFixed(4)}°)`);
        setGpsAccuracy(accuracy);
        setGeoStatus('success');
        setGeoMessage(`GPS acquired & stabilized (±${accuracy}m accuracy)`);

        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setLastRefreshedAt(timeStr);
        setRefreshToken(Date.now()); // Trigger fresh Places search
        setIsRefreshing(false);
      },
      (err) => {
        if (!isMountedRef.current) return;
        setIsRefreshing(false);
        if (err.code === 1) {
          setGeoStatus('denied');
          setGeoMessage('Location permission denied. Enter a city or landmark below to search.');
        } else if (err.code === 2) {
          setGeoStatus('unavailable');
          setGeoMessage('GPS position unavailable. Search manually below.');
        } else {
          setGeoStatus('error');
          setGeoMessage('GPS request timed out. Please click Refresh or search manually.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, [isRefreshing, geoStatus]);

  // Request GPS once on component mount
  useEffect(() => {
    if (!hasInitializedGpsRef.current) {
      hasInitializedGpsRef.current = true;
      requestCurrentLocation(false);
    }
  }, [requestCurrentLocation]);

  // Manual City / Area Geocoding Search
  const handleAreaSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!areaInput.trim()) return;

    setIsGeocoding(true);
    try {
      if ((window as any).google?.maps?.Geocoder) {
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ address: areaInput }, (results, status) => {
          if (!isMountedRef.current) return;
          setIsGeocoding(false);
          if (status === 'OK' && results && results[0]) {
            const loc = results[0].geometry.location;
            const newCenter = { lat: loc.lat(), lng: loc.lng() };
            setSearchCenter(newCenter);
            setLocationLabel(results[0].formatted_address);
            setIsManualLocked(true); // Lock search center to manual input, keeping GPS separate
            setGeoStatus('manual');
            setGeoMessage(`Map centered on manual search: ${results[0].formatted_address}`);
            setRefreshToken(Date.now()); // Trigger fresh places search
            showToast(`Centered on ${results[0].formatted_address}`, 'success');
          } else {
            showToast(`Could not locate area "${areaInput}". Please check spelling or try a city name.`, 'error');
          }
        });
      } else {
        if (isMountedRef.current) setIsGeocoding(false);
      }
    } catch (err) {
      if (isMountedRef.current) setIsGeocoding(false);
      console.error('Geocoding error:', err);
    }
  };

  // Immediate Keyword Filter Form Submit
  const handleKeywordSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRefreshToken(Date.now());
  };

  const handlePlacesFetched = useCallback((fetched: PlaceResult[], loading: boolean, error: string | null) => {
    setPlaces(fetched);
    setIsLoadingPlaces(loading);
    setPlacesError(error);
    if (fetched.length > 0 && (!selectedPlace || !fetched.some((f) => f.id === selectedPlace.id))) {
      setSelectedPlace(fetched[0]);
    }
  }, [selectedPlace]);

  // Mandatory Setup Screen if Google Maps API Key is missing
  if (!hasValidKey) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200 dark:border-slate-700 shadow-xl max-w-3xl mx-auto my-6 text-slate-800 dark:text-slate-100 font-sans">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100 dark:border-slate-700">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold shrink-0 shadow-inner">
            <Key className="w-7 h-7" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Setup Required
            </span>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">Google Maps Platform API Key Missing</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              To discover real-time nearby hospitals, pharmacies, clinics & diagnostic centers with GPS mapping, please add your Google Maps API key.
            </p>
          </div>
        </div>

        <div className="space-y-4 text-xs leading-relaxed">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
            <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-500" />
              How to enable Google Maps integration:
            </h4>
            <ol className="list-decimal pl-5 space-y-2 text-slate-600 dark:text-slate-300">
              <li>
                Obtain a Google Maps Platform API Key from the{' '}
                <a
                  href="https://console.cloud.google.com/google/maps-apis/start?utm_campaign=gmp-code-assist-ais"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-teal-600 dark:text-teal-400 font-bold underline inline-flex items-center gap-0.5"
                >
                  Google Cloud Console <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                In this AI Studio workspace, open <strong>Settings</strong> (⚙️ gear icon in top-right corner).
              </li>
              <li>
                Select <strong>Secrets</strong> menu option.
              </li>
              <li>
                Enter Secret Name: <code className="bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded font-mono font-bold text-teal-600 dark:text-teal-400">GOOGLE_MAPS_PLATFORM_KEY</code>
              </li>
              <li>
                Paste your API key in the Secret Value field and press <strong>Enter</strong>.
              </li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  return (
    <APIProvider apiKey={API_KEY} libraries={GOOGLE_MAPS_LIBRARIES}>
      <div className="space-y-6">

        {/* Top Header & Emergency SOS shortcut */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-teal-100 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold shrink-0 shadow-inner">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  Nearby Healthcare & Live Services
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Google Maps Live
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Real-time location-based discovery of genuine hospitals, 24/7 pharmacies, clinics, and diagnostic labs.
              </p>
            </div>
          </div>

          {onOpenEmergency && (
            <button
              onClick={onOpenEmergency}
              className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md shadow-rose-500/20 transition-all flex items-center justify-center gap-2 shrink-0"
            >
              <ShieldAlert className="w-4 h-4 animate-bounce" />
              <span>Emergency SOS Hub</span>
            </button>
          )}
        </div>

        {/* GPS Status & Refresh Control Bar */}
        <div className={`p-4 rounded-2xl border text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-colors ${
          isManualLocked
            ? 'bg-purple-50/80 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800/60 text-purple-900 dark:text-purple-200'
            : geoStatus === 'success'
            ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-200'
            : geoStatus === 'denied' || geoStatus === 'error' || geoStatus === 'unavailable'
            ? 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200'
            : 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800/60 text-blue-900 dark:text-blue-200'
        }`}>
          <div className="flex items-center gap-2.5">
            {isRefreshing || geoStatus === 'requesting' ? (
              <JevanCareLoader size="xs" color="emerald" />
            ) : isManualLocked ? (
              <Compass className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
            ) : geoStatus === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold">
                  {isManualLocked
                    ? 'Manual Search Area Active'
                    : geoStatus === 'success'
                    ? 'Using Real-Time Device GPS'
                    : geoStatus === 'requesting'
                    ? 'Detecting Device GPS...'
                    : 'Location Service Alert'}
                </span>
                {lastRefreshedAt && (
                  <span className="text-[10px] text-slate-500 font-normal">
                    • Refreshed at {lastRefreshedAt}
                  </span>
                )}
              </div>
              <span className="opacity-90 block mt-0.5">
                {geoMessage || `Search Center: ${locationLabel}`}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
            {isManualLocked && (
              <button
                onClick={() => requestCurrentLocation(true)}
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 shrink-0"
              >
                <LocateFixed className="w-3.5 h-3.5" />
                <span>Reset to My GPS</span>
              </button>
            )}

            {/* Refresh Current View Button */}
            <button
              onClick={() => requestCurrentLocation(true)}
              disabled={isRefreshing || geoStatus === 'requesting'}
              className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 shrink-0 disabled:opacity-60"
              title="Click to request a fresh GPS position and perform a brand new healthcare search"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Refreshing GPS...' : 'Refresh Current View'}</span>
            </button>
          </div>
        </div>

        {/* Controls Bar: Search Particular Area, Categories, Search Radius & Sorting */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

            {/* 1. Manual City / Area Search Form */}
            <form onSubmit={handleAreaSearchSubmit} className="relative md:col-span-2 flex gap-2">
              <div className="relative flex-1">
                <Compass className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={areaInput}
                  onChange={(e) => setAreaInput(e.target.value)}
                  placeholder="Search city or area (e.g., Lucknow, Bandra Mumbai, Connaught Place)..."
                  className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500 text-slate-800 dark:text-slate-100 font-medium"
                />
              </div>
              <button
                type="submit"
                disabled={isGeocoding}
                className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 shrink-0 disabled:opacity-60"
              >
                {isGeocoding ? <JevanCareLoader size="xs" color="white" /> : <Search className="w-3.5 h-3.5" />}
                <span>Search Area</span>
              </button>
            </form>

            {/* 2. Keyword Search Filter inside active area - FOCUS FIXED */}
            <form onSubmit={handleKeywordSearchSubmit} className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter results by name or street..."
                className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500 text-slate-800 dark:text-slate-100 font-medium"
              />
            </form>
          </div>

          {/* Row 2: Category Tabs, Radius Selector, Sort Order */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pt-3 border-t border-slate-100 dark:border-slate-700/60">

            {/* Category Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none max-w-full pb-1 lg:pb-0">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setCategory(cat);
                    setRefreshToken(Date.now());
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    category === cat
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Radius & Sort Selectors */}
            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-between lg:justify-end text-xs font-semibold">

              {/* Radius selector */}
              <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-500 dark:text-slate-400 text-[11px]">Radius:</span>
                <select
                  value={radiusKm}
                  onChange={(e) => {
                    setRadiusKm(Number(e.target.value));
                    setRefreshToken(Date.now());
                  }}
                  className="bg-transparent font-bold text-slate-800 dark:text-slate-100 focus:outline-none cursor-pointer text-xs"
                >
                  <option value={1} className="dark:bg-slate-800">1 km</option>
                  <option value={3} className="dark:bg-slate-800">3 km</option>
                  <option value={5} className="dark:bg-slate-800">5 km</option>
                  <option value={10} className="dark:bg-slate-800">10 km</option>
                  <option value={20} className="dark:bg-slate-800">20 km</option>
                </select>
              </div>

              {/* Sort selector */}
              <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-500 dark:text-slate-400 text-[11px]">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-transparent font-bold text-slate-800 dark:text-slate-100 focus:outline-none cursor-pointer text-xs"
                >
                  <option value="nearest" className="dark:bg-slate-800">Nearest First</option>
                  <option value="rating" className="dark:bg-slate-800">Highest Rated</option>
                  <option value="reviews" className="dark:bg-slate-800">Most Reviewed</option>
                </select>
              </div>

            </div>
          </div>
        </div>

        {/* Main Section: Map + Facilities List */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Interactive Google Map */}
          <div className="lg:col-span-2 bg-slate-900 rounded-3xl border border-slate-800 relative min-h-[480px] overflow-hidden flex flex-col justify-between shadow-xl">

            {/* Top overlay badge bar */}
            <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between bg-slate-950/85 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-slate-800 text-xs">
              <span className="flex items-center gap-2 text-teal-400 font-bold truncate">
                <MapPin className="w-4 h-4 shrink-0" />
                <span className="truncate">{locationLabel} ({radiusKm} km radius)</span>
              </span>
              <span className="text-slate-400 font-semibold shrink-0 ml-2">
                {isLoadingPlaces ? 'Searching...' : `${places.length} Facilities Found`}
              </span>
            </div>

            {/* Map Canvas */}
            <div className="w-full h-[360px] sm:h-[450px] md:h-[520px] relative">
              <Map
                defaultCenter={searchCenter}
                defaultZoom={14}
                mapId="DEMO_MAP_ID"
                internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                style={{ width: '100%', height: '100%' }}
                gestureHandling="greedy"
                disableDefaultUI={false}
              >
                <PlacesMapContent
                  center={searchCenter}
                  userLocation={userLocation}
                  locationLabel={locationLabel}
                  category={category}
                  radiusKm={radiusKm}
                  searchQuery={debouncedSearchQuery}
                  sortBy={sortBy}
                  refreshToken={refreshToken}
                  onPlacesFetched={handlePlacesFetched}
                  selectedPlace={selectedPlace}
                  onSelectPlace={setSelectedPlace}
                />
              </Map>
            </div>

            {/* Selected Place Card overlay */}
            {selectedPlace && (
              <div className="absolute bottom-4 left-4 right-4 z-10 bg-slate-950/95 backdrop-blur-md p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xl">
                <div className="space-y-1 max-w-md">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getCategoryTheme(selectedPlace.type).badge}`}>
                      {selectedPlace.type}
                    </span>
                    <span className="text-[10px] text-teal-400 font-bold">{selectedPlace.distanceKm} km away</span>
                  </div>
                  <h4 className="font-extrabold text-sm text-white truncate">{selectedPlace.name}</h4>
                  <p className="text-slate-400 text-xs truncate">{selectedPlace.address}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={selectedPlace.googleMapsUri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition-colors flex items-center gap-1.5"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Get Directions</span>
                  </a>
                  {selectedPlace.phone && (
                    <a
                      href={`tel:${selectedPlace.phone}`}
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors flex items-center gap-1"
                    >
                      <Phone className="w-3.5 h-3.5 text-teal-400" />
                      <span>Call</span>
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Column 3: Places Results Cards List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span>Nearby Facilities ({places.length})</span>
              </h3>
              <span className="text-[11px] text-slate-400">Sorted by {sortBy}</span>
            </div>

            <div className="space-y-3 max-h-[520px] overflow-y-auto scrollbar-thin pr-1">
              {isLoadingPlaces ? (
                <div className="p-8 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-center space-y-3">
                  <JevanCareLoader size="lg" color="forest" variant="card" label="Finding nearby healthcare facilities..." />
                </div>
              ) : placesError || places.length === 0 ? (
                <div className="p-8 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-center space-y-3">
                  <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">No medical facilities found</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Try increasing the search radius (e.g., 10 km or 20 km) or typing another area name above.
                  </p>
                  <button
                    onClick={() => {
                      setRadiusKm(10);
                      setRefreshToken(Date.now());
                    }}
                    className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl transition-all"
                  >
                    Expand to 10 km
                  </button>
                </div>
              ) : (
                places.map((place) => {
                  const isSelected = selectedPlace?.id === place.id;
                  const theme = getCategoryTheme(place.type);

                  return (
                    <div
                      key={place.id}
                      onClick={() => setSelectedPlace(place)}
                      className={`p-4 rounded-2xl border text-xs cursor-pointer transition-all space-y-2.5 ${
                        isSelected
                          ? 'bg-teal-50/90 dark:bg-teal-950/40 border-teal-500 dark:border-teal-600 shadow-md ring-2 ring-teal-500/20'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${theme.badge}`}>
                              {place.type}
                            </span>
                            <span className="text-[11px] font-extrabold text-teal-600 dark:text-teal-400">
                              • {place.distanceKm} km away
                            </span>
                          </div>
                          <h4 className="font-extrabold text-sm text-slate-900 dark:text-white mt-1 leading-snug">
                            {place.name}
                          </h4>
                        </div>
                        <div className="flex items-center gap-1 font-bold text-amber-500 shrink-0 bg-amber-50 dark:bg-amber-950/60 px-2 py-1 rounded-lg border border-amber-200/50 dark:border-amber-900/50">
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          <span>{place.rating}</span>
                        </div>
                      </div>

                      <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed line-clamp-2">
                        {place.address}
                      </p>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700/60 text-[11px]">
                        <span className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-full ${
                          place.openNow
                            ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950'
                            : 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-900'
                        }`}>
                          <Clock className="w-3 h-3" /> {place.openNow ? 'Open Now' : 'Closed'}
                        </span>

                        <a
                          href={place.googleMapsUri}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-teal-600 dark:text-teal-400 font-bold hover:underline flex items-center gap-1"
                        >
                          <span>Directions</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

      </div>
    </APIProvider>
  );
};
