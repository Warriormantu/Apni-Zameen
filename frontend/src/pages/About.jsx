export default function About() {
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            About Apni Zameen
          </h2>
          <p className="mt-4 text-lg text-gray-500">
            Your trusted partner in real estate since 2010
          </p>
        </div>

        <div className="mt-16">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Mission */}
            <div className="rounded-lg bg-white p-8 shadow-lg">
              <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary text-white">
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418"
                  />
                </svg>
              </div>
              <h3 className="mt-6 text-xl font-semibold text-gray-900">Our Mission</h3>
              <p className="mt-4 text-base text-gray-500">
                To provide exceptional real estate services and help our clients find their dream
                properties while ensuring transparency and trust in every transaction.
              </p>
            </div>

            {/* Vision */}
            <div className="rounded-lg bg-white p-8 shadow-lg">
              <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary text-white">
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <h3 className="mt-6 text-xl font-semibold text-gray-900">Our Vision</h3>
              <p className="mt-4 text-base text-gray-500">
                To be the most trusted and innovative real estate platform in India, transforming
                the way people buy, sell, and rent properties.
              </p>
            </div>

            {/* Values */}
            <div className="rounded-lg bg-white p-8 shadow-lg">
              <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary text-white">
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z"
                  />
                </svg>
              </div>
              <h3 className="mt-6 text-xl font-semibold text-gray-900">Our Values</h3>
              <p className="mt-4 text-base text-gray-500">
                Integrity, transparency, customer satisfaction, and innovation are the core values
                that drive our business and shape our relationships with clients.
              </p>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 text-center">
            Our Leadership Team
          </h2>
          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Team Member 1 */}
            <div className="text-center">
              <img
                className="mx-auto h-40 w-40 rounded-full"
                src="https://via.placeholder.com/150"
                alt="Team member"
              />
              <h3 className="mt-6 text-lg font-semibold text-gray-900">John Doe</h3>
              <p className="text-sm text-gray-500">Founder & CEO</p>
              <p className="mt-2 text-sm text-gray-500">
                With over 20 years of experience in real estate, John leads our company with
                vision and expertise.
              </p>
            </div>

            {/* Team Member 2 */}
            <div className="text-center">
              <img
                className="mx-auto h-40 w-40 rounded-full"
                src="https://via.placeholder.com/150"
                alt="Team member"
              />
              <h3 className="mt-6 text-lg font-semibold text-gray-900">Jane Smith</h3>
              <p className="text-sm text-gray-500">Chief Operations Officer</p>
              <p className="mt-2 text-sm text-gray-500">
                Jane oversees our day-to-day operations, ensuring smooth service delivery to our
                clients.
              </p>
            </div>

            {/* Team Member 3 */}
            <div className="text-center">
              <img
                className="mx-auto h-40 w-40 rounded-full"
                src="https://via.placeholder.com/150"
                alt="Team member"
              />
              <h3 className="mt-6 text-lg font-semibold text-gray-900">Mike Johnson</h3>
              <p className="text-sm text-gray-500">Head of Sales</p>
              <p className="mt-2 text-sm text-gray-500">
                Mike leads our sales team with his extensive knowledge of the real estate market
                and customer needs.
              </p>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-16">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="text-center">
              <p className="text-4xl font-bold text-primary">10+</p>
              <p className="mt-2 text-sm text-gray-500">Years of Experience</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-primary">1000+</p>
              <p className="mt-2 text-sm text-gray-500">Properties Sold</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-primary">5000+</p>
              <p className="mt-2 text-sm text-gray-500">Happy Clients</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-primary">50+</p>
              <p className="mt-2 text-sm text-gray-500">Cities Covered</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 