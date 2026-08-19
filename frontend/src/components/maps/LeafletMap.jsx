import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import toast from 'react-hot-toast';
import { FiCrosshair, FiSearch, FiMapPin, FiNavigation } from 'react-icons/fi';
import EmptyState from '../ui/EmptyState';

// Fix Leaflet's default icon paths in bundled environments
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Icon 1: USER Marker (GREEN)
const userIcon = L.divIcon({
  className: 'custom-user-marker',
  html: `<div style="background-color: #10B981; width: 26px; height: 26px; border-radius: 50%; border: 3.5px solid white; box-shadow: 0 0 14px rgba(16,185,129,0.7); position: relative;">
          <div style="position: absolute; width: 44px; height: 44px; background-color: rgba(16, 185, 129, 0.25); border-radius: 50%; top: -12.5px; left: -12.5px; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
         </div>`,
  iconSize: [26, 26],
  iconAnchor: [13, 13]
});

// Custom Icon 2: DONATION Marker (BLUE)
const donationIcon = L.divIcon({
  className: 'custom-donation-marker',
  html: `<div style="background-color: #3B82F6; color: white; width: 34px; height: 34px; border-radius: 50%; border: 2.5px solid white; display: flex; align-items: center; justify-content: center; font-size: 16px; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.45);">
          🍲
         </div>`,
  iconSize: [34, 34],
  iconAnchor: [17, 17]
});

// Custom Icon 3: Verified FoodBridge NGO Marker (GREEN)
const verifiedNgoIcon = L.divIcon({
  className: 'custom-verified-ngo-marker',
  html: `<div style="background-color: #10B981; color: white; width: 34px; height: 34px; border-radius: 50%; border: 2.5px solid white; display: flex; align-items: center; justify-content: center; font-size: 16px; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.45);">
          🏢
         </div>`,
  iconSize: [34, 34],
  iconAnchor: [17, 17]
});

// Custom Icon 4: External OSM Organization Marker (ORANGE)
const osmNgoIcon = L.divIcon({
  className: 'custom-osm-ngo-marker',
  html: `<div style="background-color: #F59E0B; color: white; width: 34px; height: 34px; border-radius: 50%; border: 2.5px solid white; display: flex; align-items: center; justify-content: center; font-size: 16px; box-shadow: 0 4px 12px rgba(245, 158, 11, 0.45);">
          🤝
         </div>`,
  iconSize: [34, 34],
  iconAnchor: [17, 17]
});

const DEFAULT_CENTER = [28.6139, 77.2090]; // Default city center (Delhi)

const isValidCoord = (lat, lng) => {
  return (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    !isNaN(lat) &&
    !isNaN(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180 &&
    (lat !== 0 || lng !== 0)
  );
};

const normalizePos = (pos) => {
  if (!pos) return null;
  if (Array.isArray(pos) && pos.length >= 2) {
    const lat = Number(pos[0]);
    const lng = Number(pos[1]);
    return isValidCoord(lat, lng) ? [lat, lng] : null;
  }
  if (typeof pos === 'object') {
    const lat = Number(pos.latitude ?? pos.lat);
    const lng = Number(pos.longitude ?? pos.lng);
    return isValidCoord(lat, lng) ? [lat, lng] : null;
  }
  return null;
};

const LeafletMap = ({
  center,
  zoom = 13,
  markers = [],
  polylinePoints = [],
  userLocation: propUserLocation = null,
  selectedDonation = null,
  selectedNgo = null,
  tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  className = '',
  onLocationSelect,
  onUserLocationChange,
  onMapCreated
}) => {
  const containerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layerGroupRef = useRef(null);
  const markerMapRef = useRef(new Map());
  const hasNotifiedGeoError = useRef(false);

  const [userLocation, setUserLocation] = useState(normalizePos(propUserLocation));
  const [hasError, setHasError] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  // Sync propUserLocation if passed
  useEffect(() => {
    const norm = normalizePos(propUserLocation);
    if (norm) setUserLocation(norm);
  }, [propUserLocation]);

  // 1. Detect User Location via Browser Geolocation API
  useEffect(() => {
    if (!('geolocation' in navigator)) {
      if (!hasNotifiedGeoError.current) {
        hasNotifiedGeoError.current = true;
        toast.error('Geolocation is not supported by your browser.');
      }
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const coords = [pos.coords.latitude, pos.coords.longitude];
        if (isValidCoord(coords[0], coords[1])) {
          setUserLocation(coords);
          if (onUserLocationChange) onUserLocationChange(coords);
        }
      },
      (err) => {
        console.warn('Geolocation error:', err.message);
        if (!hasNotifiedGeoError.current) {
          hasNotifiedGeoError.current = true;
          toast.error('Location permission denied.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );

    return () => {
      try {
        navigator.geolocation.clearWatch(watchId);
      } catch (e) {
        // ignore
      }
    };
  }, []);

  // Extract explicit user marker from markers array if userLocation state is null
  const explicitUserMarker = (markers || []).find(
    (m) => m && (m.type === 'user' || m.iconType === 'user' || m.id === 'user-current-location' || m.id === 'user-location')
  );
  const effectiveUserLocation = userLocation || normalizePos(explicitUserMarker?.position);

  // Determine initial center
  const initialCenter =
    effectiveUserLocation ||
    normalizePos(center) ||
    (markers.length > 0 ? normalizePos(markers[0].position) : null) ||
    DEFAULT_CENTER;

  // Initialize Map Instance (Clean Teardown to prevent "Map container is already initialized" error)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (container._leaflet_id) {
      delete container._leaflet_id;
    }

    try {
      const map = L.map(container, {
        center: initialCenter,
        zoom,
        scrollWheelZoom: false
      });

      L.tileLayer(tileUrl, {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      const layerGroup = L.layerGroup().addTo(map);
      layerGroupRef.current = layerGroup;
      mapInstanceRef.current = map;

      if (onMapCreated) {
        onMapCreated({
          map,
          focusMarker: (id, pos) => {
            const m = markerMapRef.current.get(id);
            const normPos = normalizePos(pos);
            if (normPos) {
              map.flyTo(normPos, 15, { duration: 1.2 });
            }
            if (m) {
              m.openPopup();
            }
          }
        });
      }

      const timer = setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 250);

      if (onLocationSelect) {
        map.on('click', (e) => {
          onLocationSelect({ lat: e.latlng.lat, lng: e.latlng.lng });
        });
      }

      return () => {
        clearTimeout(timer);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.off();
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }
        if (container._leaflet_id) {
          delete container._leaflet_id;
        }
        layerGroupRef.current = null;
        markerMapRef.current.clear();
      };
    } catch (err) {
      console.error('Leaflet initialization error:', err);
      setHasError(true);
    }
  }, [tileUrl]);

  // Render Markers, Route Polyline, and Fit Bounds dynamically
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;
    if (!map || !layerGroup) return;

    // Clear previous layers & markers to prevent duplicates
    layerGroup.clearLayers();
    markerMapRef.current.clear();

    const bounds = [];

    // A. Render EXACTLY ONE GREEN USER MARKER
    if (effectiveUserLocation) {
      const userMarker = L.marker(effectiveUserLocation, { icon: userIcon });
      userMarker.bindPopup(`
        <div style="font-family: system-ui, sans-serif; padding: 4px; min-width: 140px;">
          <div style="font-weight: 800; color: #10B981; font-size: 14px; display: flex; items: center; gap: 4px;">
            <span>📍</span> <span>You are here</span>
          </div>
          <div style="font-size: 11px; color: #64748B; margin-top: 4px;">Current Geolocation</div>
        </div>
      `, { maxWidth: 220 });

      userMarker.addTo(layerGroup);
      markerMapRef.current.set('user-location', userMarker);
      bounds.push(effectiveUserLocation);
    }

    // B. Render Other Markers (Blue Donation Markers & Red NGO Markers)
    (markers || []).forEach((m, idx) => {
      const pos = normalizePos(m.position);
      if (!pos) return;

      const isUserType = m.type === 'user' || m.iconType === 'user' || m.id === 'user-current-location' || m.id === 'user-location';
      if (isUserType) return; // Already handled by single user marker logic above

      const isNgoMarker = m.type === 'ngo' || m.iconType === 'ngo' || m.isNgo || m.role === 'ngo';
      const isOsm = m.source === 'osm' || (m.id && String(m.id).startsWith('osm_'));
      const isMongo = m.source === 'mongodb' || (!isOsm && isNgoMarker);

      let iconToUse = donationIcon;
      if (isNgoMarker) {
        iconToUse = isOsm ? osmNgoIcon : verifiedNgoIcon;
      }
      if (m.icon) iconToUse = m.icon;

      const marker = L.marker(pos, { icon: iconToUse });

      // Build Detailed Popups
      if (m.popupHtml) {
        marker.bindPopup(m.popupHtml, { maxWidth: 280 });
      } else if (isNgoMarker) {
        const name = m.ngoName || m.name || 'NGO Partner';
        const dist = m.distance ? `${m.distance} km away` : 'Nearby area';
        const status = m.verificationStatus || (m.isVerified || m.verified ? 'Verified Partner' : 'OSM Nearby');
        const statusColor = status.includes('Verified') ? '#059669' : '#0284C7';
        const origLat = effectiveUserLocation ? effectiveUserLocation[0] : 28.6139;
        const origLng = effectiveUserLocation ? effectiveUserLocation[1] : 77.2090;
        const gmapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${origLat},${origLng}&destination=${pos[0]},${pos[1]}`;

        marker.bindPopup(`
          <div style="font-family: system-ui, sans-serif; padding: 4px; max-width: 220px;">
            <div style="font-weight: 800; color: #1E293B; font-size: 14px;">${name}</div>
            <div style="font-size: 11px; color: #64748B; margin-top: 3px;">Distance: ${dist}</div>
            <div style="font-size: 11px; font-weight: 700; color: ${statusColor}; margin-top: 2px;">${status}</div>
            <a href="${gmapsUrl}" target="_blank" rel="noopener noreferrer" style="display: block; margin-top: 8px; text-align: center; background-color: #EF4444; color: white; border-radius: 8px; padding: 6px 12px; font-size: 11px; font-weight: 700; text-decoration: none;">Get Directions</a>
          </div>
        `, { maxWidth: 260 });
      } else {
        // Donation Marker
        const name = m.foodName || m.name || m.title || 'Food Donation';
        const qty = m.quantity ? `${m.quantity} ${m.unit || 'servings'}` : 'Surplus Food';
        const expiry = m.expiryTime ? new Date(m.expiryTime).toLocaleDateString() : null;
        const detailsUrl = m.detailsUrl || (m.id ? `/donor/donations/${m.id}` : null);

        marker.bindPopup(`
          <div style="font-family: system-ui, sans-serif; padding: 4px; max-width: 220px;">
            <div style="font-weight: 800; color: #1E293B; font-size: 14px;">${name}</div>
            <div style="font-size: 12px; font-weight: 700; color: #3B82F6; margin-top: 3px;">Quantity: ${qty}</div>
            ${expiry ? `<div style="font-size: 11px; color: #64748B; margin-top: 2px;">Expires: ${expiry}</div>` : ''}
            ${detailsUrl ? `<a href="${detailsUrl}" style="display: block; margin-top: 8px; text-align: center; background-color: #3B82F6; color: white; border-radius: 8px; padding: 6px 12px; font-size: 11px; font-weight: 700; text-decoration: none;">View Details</a>` : ''}
          </div>
        `, { maxWidth: 260 });
      }

      marker.addTo(layerGroup);
      const markerKey = m.id || `marker-${idx}`;
      markerMapRef.current.set(markerKey, marker);
      bounds.push(pos);
    });

    // C. Render Route Polylines cleanly without duplicates
    const finalPolylinePoints = [];

    if (Array.isArray(polylinePoints) && polylinePoints.length >= 2) {
      polylinePoints.forEach((pt) => {
        const norm = normalizePos(pt);
        if (norm) finalPolylinePoints.push(norm);
      });
    } else if (effectiveUserLocation) {
      if (selectedNgo) {
        const ngoPos = normalizePos(selectedNgo.location || [selectedNgo.lat, selectedNgo.lng]);
        if (ngoPos) finalPolylinePoints.push(effectiveUserLocation, ngoPos);
      } else if (selectedDonation) {
        const donPos = normalizePos(selectedDonation.location || [selectedDonation.latitude, selectedDonation.longitude]);
        if (donPos) finalPolylinePoints.push(effectiveUserLocation, donPos);
      }
    }

    if (finalPolylinePoints.length >= 2) {
      const polyline = L.polyline(finalPolylinePoints, {
        color: '#3B82F6',
        weight: 4,
        opacity: 0.85,
        dashArray: '6, 8'
      });
      polyline.addTo(layerGroup);
      finalPolylinePoints.forEach((pt) => bounds.push(pt));
    }

    // D. Fit Map Bounds so User Location, Donations, and NGOs are all visible
    if (bounds.length > 1) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    } else if (bounds.length === 1) {
      map.setView(bounds[0], zoom);
    } else if (initialCenter) {
      map.setView(initialCenter, zoom);
    }

    map.invalidateSize();
  }, [
    JSON.stringify(effectiveUserLocation),
    markers.length,
    JSON.stringify(markers.map((m) => m.position || m.id)),
    JSON.stringify(polylinePoints),
    JSON.stringify(selectedDonation),
    JSON.stringify(selectedNgo)
  ]);

  // "Locate Me" Floating Button Click Handler
  const handleLocateMe = () => {
    const map = mapInstanceRef.current;
    if (effectiveUserLocation) {
      if (map) map.flyTo(effectiveUserLocation, 15, { duration: 1.2 });
      toast.success('Centered on your location');
    } else if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = [pos.coords.latitude, pos.coords.longitude];
          setUserLocation(coords);
          if (map) map.flyTo(coords, 15, { duration: 1.2 });
          toast.success('Centered on your location');
        },
        () => {
          toast.error('Location permission denied.');
          setShowSearch(true);
        }
      );
    } else {
      toast.error('Location permission denied.');
      setShowSearch(true);
    }
  };

  // Manual Address Search Handler
  const handleManualSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lon = parseFloat(data[0].lon);
          const coords = [lat, lon];
          setUserLocation(coords);
          if (mapInstanceRef.current) {
            mapInstanceRef.current.flyTo(coords, 14, { duration: 1.2 });
          }
          toast.success(`Location set to ${data[0].display_name.split(',')[0]}`);
          setShowSearch(false);
        } else {
          toast.error('Location not found');
        }
      })
      .catch(() => toast.error('Address search failed'));
  };

  if (hasError) {
    return <EmptyState title="Map Unavailable" description="Unable to load interactive map at this time." />;
  }

  return (
    <div className={`relative h-[440px] w-full rounded-[24px] overflow-hidden border border-[#89D7B7] shadow-card ${className}`}>
      <div ref={containerRef} className="h-full w-full" />

      {/* Floating Controls Overlay */}
      <div className="absolute top-4 right-4 z-[1000] flex flex-col items-end gap-2">
        <button
          type="button"
          onClick={handleLocateMe}
          className="flex items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-xs font-bold text-slate-800 shadow-lg border border-slate-200 transition-all hover:bg-slate-50 hover:scale-105 active:scale-95 cursor-pointer"
          title="Recenter map on your location"
        >
          <FiCrosshair className="h-4 w-4 text-emerald-600" />
          <span>Locate Me</span>
        </button>

        <button
          type="button"
          onClick={() => setShowSearch(!showSearch)}
          className="flex items-center gap-1.5 rounded-full bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-lg border border-slate-200 transition-all hover:bg-slate-50 cursor-pointer"
        >
          <FiSearch className="h-3.5 w-3.5 text-slate-500" />
          <span>Search</span>
        </button>
      </div>

      {/* Manual Location Search Modal Overlay */}
      {showSearch && (
        <div className="absolute top-16 right-4 z-[1000] w-72 rounded-2xl bg-white p-3 shadow-xl border border-slate-200">
          <form onSubmit={handleManualSearch} className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search city/address..."
              className="flex-1 rounded-xl border border-slate-200 px-3 py-1.5 text-xs text-slate-800 outline-none focus:border-[#428475]"
            />
            <button
              type="submit"
              className="rounded-xl bg-[#428475] px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-[#1A312C]"
            >
              Go
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default LeafletMap;
