import { Link } from 'react-router-dom';

export default function PropertyCard({ property }) {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <Link to={`/properties/${property.id}`}>
        <div className="relative h-48">
          <img
            src={property.primary_image || '/placeholder-property.jpg'}
            alt={property.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded text-sm font-semibold text-gray-800">
            {property.status}
          </div>
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{property.title}</h3>
          <p className="text-xl font-bold text-indigo-600 mb-2">{formatPrice(property.price)}</p>
          <div className="flex items-center text-gray-600 mb-2">
            <span className="mr-4">
              <i className="fas fa-map-marker-alt mr-1"></i>
              {property.city}
            </span>
            <span className="mr-4">
              <i className="fas fa-home mr-1"></i>
              {property.property_type}
            </span>
          </div>
          <div className="flex items-center text-gray-600">
            {property.bedrooms && (
              <span className="mr-4">
                <i className="fas fa-bed mr-1"></i>
                {property.bedrooms} beds
              </span>
            )}
            {property.bathrooms && (
              <span className="mr-4">
                <i className="fas fa-bath mr-1"></i>
                {property.bathrooms} baths
              </span>
            )}
            {property.area && (
              <span>
                <i className="fas fa-ruler-combined mr-1"></i>
                {property.area} sq.ft
              </span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
} 