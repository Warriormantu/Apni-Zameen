import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default Leaflet marker icons in Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Demo fallback properties if none are passed
const defaultDemoProperties = [
  {
    id: 1,
    title: '2 BHK Apartment',
    price: 4500000,
    location: { lat: 28.6139, lng: 77.209, address: 'Connaught Place, New Delhi' },
    city: 'New Delhi',
  },
  {
    id: 2,
    title: 'Residential Plot',
    price: 3000000,
    location: { lat: 28.5355, lng: 77.391, address: 'Sector 62, Noida' },
    city: 'Noida',
  },
];

const CITY_COORDS = {
  'New Delhi': [28.6139, 77.209],
  'Delhi': [28.6139, 77.209],
  'Noida': [28.5355, 77.391],
  'Mumbai': [19.076, 72.8777],
  'Bengaluru': [12.9716, 77.5946],
  'Gurugram': [28.4595, 77.0266],
  'Gurgaon': [28.4595, 77.0266],
};

const HOTSPOT_SUGGESTIONS = [
  { label: 'DLF Phase 2', query: 'DLF Phase 2 Gurgaon' },
  { label: 'Cyber City', query: 'Cyber City Gurugram' },
  { label: 'Sector 84', query: 'Sector 84 Gurgaon' },
  { label: 'Golf Course Rd', query: 'Golf Course Road Gurgaon' },
  { label: 'Noida Sec 62', query: 'Sector 62 Noida' },
];

const formatPriceShort = (price) => {
  if (!price) return '—';
  if (typeof price === 'string') return price;
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(1)} Cr`;
  if (price >= 100000) return `₹${(price / 100000).toFixed(0)} L`;
  return `₹${price.toLocaleString()}`;
};

// MapController handles smooth flyTo, bounds fitting, and tile resize
function MapController({ selectedLocation, bounds }) {
  const map = useMap();

  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);
    return () => clearTimeout(timer);
  }, [map]);

  useEffect(() => {
    if (selectedLocation) {
      map.flyTo(
        [selectedLocation.lat, selectedLocation.lon],
        14,
        { duration: 1.2 }
      );
    } else if (bounds && bounds.length > 0) {
      if (bounds.length === 1) {
        map.setView(bounds[0], 13);
      } else {
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
      }
    }
  }, [map, selectedLocation, bounds]);

  return null;
}

export default function PropertyMap({
  properties = [],
  onSelectProperty,
  selectedId,
  hoveredId,
  showSearch = true,
  height = '100%',
}) {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mapLayer, setMapLayer] = useState('street'); // 'street' or 'satellite'
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [locatingUser, setLocatingUser] = useState(false);

  // Use provided properties or fallback to demo properties
  const activeProperties = properties.length > 0 ? properties : defaultDemoProperties;

  // Compute map bounds from active properties
  const bounds = useMemo(() => {
    const list = [];
    activeProperties.forEach((prop) => {
      let lat = prop.location?.lat || prop.position?.[0];
      let lng = prop.location?.lng || prop.position?.[1];
      if (!lat || !lng || (lat === 0 && lng === 0)) {
        const fallback = CITY_COORDS[prop.city] || CITY_COORDS['Delhi'];
        lat = fallback[0];
        lng = fallback[1];
      }
      list.push([lat, lng]);
    });
    return list;
  }, [activeProperties]);

  const defaultCenter = bounds.length > 0 ? bounds[0] : [28.6139, 77.209];

  // OpenStreetMap Nominatim address search
  const performSearch = useCallback(async (searchQuery) => {
    const address = searchQuery.trim();
    if (!address) return;

    setLoading(true);
    setError('');

    try {
      const url = new URL('https://nominatim.openstreetmap.org/search');
      url.searchParams.set('q', address);
      url.searchParams.set('format', 'jsonv2');
      url.searchParams.set('limit', '1');
      url.searchParams.set('countrycodes', 'in');

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Address search failed. Try again.');
      }

      const results = await response.json();
      if (results.length === 0) {
        setError('Location nahi mili. Dusra address try karo.');
        return;
      }

      setLocation({
        lat: Number(results[0].lat),
        lon: Number(results[0].lon),
        name: results[0].display_name,
      });
    } catch {
      setError('Search nahi ho paya. Internet connection check karo.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    performSearch(query);
  };

  const handleHotspotClick = (hotspotQuery) => {
    setQuery(hotspotQuery);
    performSearch(hotspotQuery);
  };

  // GPS Geolocation (Locate Me)
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      setError('Aapke browser me geolocation supported nahi hai.');
      return;
    }
    setLocatingUser(true);
    setError('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        setLocation({
          lat,
          lon,
          name: 'Your Current Location (GPS)',
        });
        setQuery('My Location');
        setLocatingUser(false);
      },
      (err) => {
        setLocatingUser(false);
        setError('Location access denied ya unavailable hai.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Searched location red pin icon
  const searchLocationIcon = useMemo(() => {
    return L.divIcon({
      className: 'az-search-pin',
      html: `
        <div style="
          background: #DC2626;
          color: #FFFFFF;
          padding: 5px 10px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
          box-shadow: 0 4px 14px rgba(220, 38, 38, 0.5);
          border: 2px solid #FFFFFF;
          white-space: nowrap;
          transform: translate(-50%, -100%);
          display: inline-flex;
          align-items: center;
          gap: 4px;
        ">
          📍 ${query || 'Searched Location'}
        </div>
      `,
      iconSize: [80, 26],
      iconAnchor: [40, 26],
    });
  }, [query]);

  return (
    <div
      className={`flex flex-col w-full relative transition-all duration-300 ${
        isFullscreen
          ? 'fixed inset-0 z-50 bg-white h-screen'
          : 'h-full'
      }`}
    >
      {/* ── Address Search bar & Hotspots (Step 6 enhanced) ── */}
      {showSearch && (
        <div className="p-2.5 bg-white border-b border-surface-border z-10 shadow-sm">
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-1.5">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search Noida, Sector 62, Bandra..."
              className="flex-1 rounded-lg border border-surface-border bg-surface px-3 py-1.5 text-xs text-primary focus:outline-none focus:border-amber"
              aria-label="Search address"
            />
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-primary hover:bg-primary-light text-white font-semibold px-3 py-1.5 text-xs transition disabled:opacity-60 shrink-0"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
            <button
              type="button"
              onClick={handleLocateMe}
              title="Use my current location"
              disabled={locatingUser}
              className="rounded-lg border border-surface-border bg-surface hover:bg-amber-light hover:text-amber-dark text-gray-600 px-2.5 py-1.5 text-xs font-medium transition shrink-0 flex items-center gap-1"
            >
              {locatingUser ? '⏳' : '🎯'}
              <span className="hidden sm:inline">Near Me</span>
            </button>
          </form>

          {/* Quick Hotspots Chips */}
          <div className="flex flex-wrap items-center gap-1 mt-2 text-[11px] overflow-x-auto pb-0.5 scrollbar-hide">
            <span className="text-gray-400 font-medium mr-0.5">Quick Fly:</span>
            {HOTSPOT_SUGGESTIONS.map((spot) => (
              <button
                key={spot.label}
                type="button"
                onClick={() => handleHotspotClick(spot.query)}
                className="rounded-md border border-gray-200 bg-gray-50 px-2 py-0.5 text-gray-600 hover:border-amber hover:text-amber-dark transition"
              >
                📍 {spot.label}
              </button>
            ))}
          </div>

          {error && (
            <p role="alert" className="text-[11px] text-red-600 mt-1.5 font-medium">
              ⚠️ {error}
            </p>
          )}

          {location && (
            <div className="flex items-center justify-between text-[11px] text-gray-500 mt-1.5 pt-1 border-t border-gray-100">
              <span className="truncate max-w-[280px]">Found: {location.name}</span>
              <button
                type="button"
                onClick={() => {
                  setLocation(null);
                  setQuery('');
                }}
                className="text-gray-400 hover:text-red-500 text-[10px] ml-1 font-semibold"
              >
                ✕ Clear
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── React Leaflet MapContainer ── */}
      <div className="flex-1 w-full relative min-h-[350px]">
        {/* Floating Controls: Layer Switcher & Fullscreen Button */}
        <div className="absolute top-3 right-3 z-[1000] flex items-center gap-1.5 bg-white/95 backdrop-blur-sm p-1 rounded-xl shadow-lg border border-gray-200 text-xs">
          <button
            type="button"
            onClick={() => setMapLayer('street')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition ${
              mapLayer === 'street'
                ? 'bg-primary text-white shadow-sm'
                : 'text-gray-600 hover:text-primary'
            }`}
          >
            🗺️ Streets
          </button>
          <button
            type="button"
            onClick={() => setMapLayer('satellite')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition ${
              mapLayer === 'satellite'
                ? 'bg-primary text-white shadow-sm'
                : 'text-gray-600 hover:text-primary'
            }`}
          >
            🛰️ Satellite
          </button>
          <button
            type="button"
            onClick={() => setMapLayer('hybrid')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition ${
              mapLayer === 'hybrid'
                ? 'bg-primary text-white shadow-sm'
                : 'text-gray-600 hover:text-primary'
            }`}
          >
            🏷️ Hybrid
          </button>
          <div className="h-4 w-px bg-gray-200 mx-0.5" />
          <a
            href={
              location
                ? `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${location.lat},${location.lon}`
                : defaultCenter
                ? `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${defaultCenter[0]},${defaultCenter[1]}`
                : 'https://www.google.com/maps'
            }
            target="_blank"
            rel="noopener noreferrer"
            title="Open in Google Street View (360° Panorama)"
            className="px-2 py-1 rounded-lg font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition flex items-center gap-1 border border-emerald-200 text-[11px]"
          >
            🧭 360°
          </a>
          <button
            type="button"
            onClick={() => setIsFullscreen((prev) => !prev)}
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Map'}
            className="p-1 rounded-lg text-gray-500 hover:text-primary transition text-sm font-bold"
          >
            {isFullscreen ? '✕' : '⛶'}
          </button>
        </div>

        {/* Floating Property Counter Badge */}
        <div className="absolute bottom-3 left-3 z-[1000] bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-md border border-gray-200 text-xs font-semibold text-primary pointer-events-none">
          🏡 {activeProperties.length} Properties in View
        </div>

        <MapContainer
          center={defaultCenter}
          zoom={11}
          scrollWheelZoom={true}
          style={{ height: height, width: '100%', minHeight: '350px' }}
        >
          {/* Tile Layer: Switchable between Streets (OpenStreetMap), Satellite (Esri), & Hybrid (Esri + Labels) */}
          {mapLayer === 'street' && (
            <TileLayer
              key="street-osm"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'
              url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
              maxZoom={19}
            />
          )}

          {mapLayer === 'satellite' && (
            <TileLayer
              key="satellite-esri"
              attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              maxZoom={18}
            />
          )}

          {mapLayer === 'hybrid' && (
            <>
              <TileLayer
                key="hybrid-base-esri"
                attribution='Tiles &copy; Esri'
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                maxZoom={18}
              />
              <TileLayer
                key="hybrid-overlay-esri"
                attribution='&copy; Esri'
                url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
                maxZoom={18}
              />
            </>
          )}

          {/* MapController with flyTo and bounds */}
          <MapController selectedLocation={location} bounds={location ? null : bounds} />

          {/* Real Property Markers with Interactive Highlight */}
          {activeProperties.map((property) => {
            let lat = property.location?.lat || property.position?.[0];
            let lng = property.location?.lng || property.position?.[1];

            if (!lat || !lng || (lat === 0 && lng === 0)) {
              const fallback = CITY_COORDS[property.city] || CITY_COORDS['Delhi'];
              lat = fallback[0];
              lng = fallback[1];
            }

            const isSelected = selectedId === property._id;
            const isHovered = hoveredId === property._id;
            const priceText = formatPriceShort(property.price);

            const customIcon = L.divIcon({
              className: 'az-map-pin-container',
              html: `
                <div style="
                  background: ${isSelected || isHovered ? '#D97706' : '#1E3A8A'};
                  color: #FFFFFF;
                  padding: 4px 8px;
                  border-radius: 12px;
                  font-size: 11px;
                  font-weight: 700;
                  box-shadow: ${isHovered || isSelected ? '0 0 16px rgba(217, 119, 6, 0.8)' : '0 4px 10px rgba(0,0,0,0.25)'};
                  border: ${isHovered || isSelected ? '2px solid #FDE68A' : '2px solid #FFFFFF'};
                  white-space: nowrap;
                  cursor: pointer;
                  transform: translate(-50%, -50%) ${isHovered ? 'scale(1.15)' : 'scale(1)'};
                  transition: transform 0.2s ease, box-shadow 0.2s ease;
                  display: inline-block;
                ">
                  ${priceText}
                </div>
              `,
              iconSize: [60, 24],
              iconAnchor: [30, 12],
            });

            const imageUrl =
              property.images?.[0]?.url ||
              property.images?.[0] ||
              'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&q=80';

            return (
              <Marker
                key={property._id || property.id}
                position={[lat, lng]}
                icon={customIcon}
                eventHandlers={{
                  click: () => onSelectProperty?.(property),
                }}
              >
                <Popup>
                  <div style={{ width: '210px', fontFamily: 'Inter, sans-serif' }}>
                    <img
                      src={imageUrl}
                      alt={property.title}
                      style={{
                        width: '100%',
                        height: '95px',
                        objectFit: 'cover',
                        borderRadius: '8px',
                        marginBottom: '6px',
                      }}
                    />
                    <h4
                      style={{
                        fontSize: '12px',
                        fontWeight: 700,
                        color: '#1E3A8A',
                        margin: '0 0 2px 0',
                        lineHeight: 1.2,
                      }}
                    >
                      {property.title}
                    </h4>
                    <p style={{ fontSize: '11px', color: '#6B7280', margin: '0 0 4px 0' }}>
                      {property.city || ''} {property.location?.address ? `• ${property.location.address}` : ''}
                    </p>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginTop: '6px',
                        paddingTop: '4px',
                        borderTop: '1px solid #F3F4F6',
                      }}
                    >
                      <span style={{ fontSize: '13px', fontWeight: 800, color: '#D97706' }}>
                        {formatPriceShort(property.price)}
                      </span>
                      {property._id && (
                        <a
                          href={`/properties/${property._id}`}
                          style={{
                            fontSize: '11px',
                            color: '#1E3A8A',
                            fontWeight: 600,
                            textDecoration: 'none',
                            padding: '3px 8px',
                            background: '#EEF2FF',
                            borderRadius: '6px',
                          }}
                        >
                          View Details →
                        </a>
                      )}
                    </div>

                    {/* Direct 360° Google Street View Link */}
                    <a
                      href={`https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${lat},${lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px',
                        marginTop: '6px',
                        padding: '4px 8px',
                        fontSize: '10.5px',
                        fontWeight: 600,
                        color: '#065F46',
                        background: '#ECFDF5',
                        border: '1px solid #A7F3D0',
                        borderRadius: '6px',
                        textDecoration: 'none',
                      }}
                    >
                      🧭 360° Street View ↗
                    </a>
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {/* Searched location pin */}
          {location && (
            <Marker position={[location.lat, location.lon]} icon={searchLocationIcon}>
              <Popup>
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px' }}>
                  <strong style={{ color: '#DC2626' }}>📍 Found Location</strong>
                  <p style={{ margin: '4px 0 0 0', color: '#4B5563' }}>{location.name}</p>
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>
    </div>
  );
}
