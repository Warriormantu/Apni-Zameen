import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import axios from 'axios'

export default function Home() {
  const [featuredProperties, setFeaturedProperties] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFeaturedProperties = async () => {
      try {
        const response = await axios.get('http://localhost/apni-zameen-api/properties')
        setFeaturedProperties(response.data.slice(0, 3)) // Get first 3 properties
        setLoading(false)
      } catch (error) {
        console.error('Error fetching properties:', error)
        setLoading(false)
      }
    }

    fetchFeaturedProperties()
  }, [])

  return (
    <div className="bg-white">
      {/* Hero section */}
      <div className="relative isolate overflow-hidden bg-gradient-to-b from-blue-100/20">
        <div className="mx-auto max-w-7xl pb-24 pt-10 sm:pb-32 lg:grid lg:grid-cols-2 lg:gap-x-8 lg:px-8 lg:py-40">
          <div className="px-6 lg:px-0 lg:pt-4">
            <div className="mx-auto max-w-2xl">
              <div className="max-w-lg">
                <h1 className="mt-10 text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                  Find Your Dream Home
                </h1>
                <p className="mt-6 text-lg leading-8 text-gray-600">
                  Discover the perfect property that matches your lifestyle. From cozy apartments to luxurious villas,
                  we have everything you need.
                </p>
                <div className="mt-10 flex items-center gap-x-6">
                  <Link
                    to="/properties"
                    className="rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                  >
                    Browse Properties
                  </Link>
                  <Link to="/contact" className="text-sm font-semibold leading-6 text-gray-900">
                    Contact Us <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Properties section */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-24 sm:py-32">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Featured Properties</h2>
          <p className="mt-2 text-lg leading-8 text-gray-600">
            Explore our handpicked selection of premium properties.
          </p>
        </div>
        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {loading ? (
            <div className="col-span-3 text-center">Loading properties...</div>
          ) : (
            featuredProperties.map((property) => (
              <article key={property.id} className="flex flex-col items-start">
                <div className="relative w-full">
                  <img
                    src={property.image_url || 'https://via.placeholder.com/400x300'}
                    alt={property.title}
                    className="aspect-[16/9] w-full rounded-2xl bg-gray-100 object-cover sm:aspect-[2/1] lg:aspect-[3/2]"
                  />
                  <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-gray-900/10" />
                </div>
                <div className="max-w-xl">
                  <div className="mt-8 flex items-center gap-x-4 text-xs">
                    <time dateTime={property.created_at} className="text-gray-500">
                      {new Date(property.created_at).toLocaleDateString()}
                    </time>
                    <span className="relative z-10 rounded-full bg-gray-50 px-3 py-1.5 font-medium text-gray-600">
                      {property.property_type}
                    </span>
                  </div>
                  <div className="group relative">
                    <h3 className="mt-3 text-lg font-semibold leading-6 text-gray-900 group-hover:text-gray-600">
                      <Link to={`/properties/${property.id}`}>
                        <span className="absolute inset-0" />
                        {property.title}
                      </Link>
                    </h3>
                    <p className="mt-5 line-clamp-3 text-sm leading-6 text-gray-600">{property.description}</p>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-lg font-semibold text-blue-600">₹{property.price.toLocaleString()}</div>
                    <div className="text-sm text-gray-500">{property.city}, {property.state}</div>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </div>
  )
} 