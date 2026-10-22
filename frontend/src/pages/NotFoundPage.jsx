import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-surface px-4 py-16">
      <div className="max-w-md text-center">
        <div className="text-6xl mb-4">🧭</div>
        <h1 className="font-playfair text-4xl font-bold text-primary">404 - Page Not Found</h1>
        <p className="mt-3 text-sm text-gray-500">
          Oops! The property, land, or page you are looking for does not exist or has been moved.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link to="/" className="btn-outline px-6 py-2.5 text-sm">
            ← Go to Home
          </Link>
          <Link to="/properties" className="btn-primary px-6 py-2.5 text-sm">
            Browse Properties
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
