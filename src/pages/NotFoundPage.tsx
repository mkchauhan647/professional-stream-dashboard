import { Link } from 'react-router-dom';

function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center">
      <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
      <p className="mb-4">Oops! The page you're looking for doesn't exist.</p>
      <Link to="/" className="text-blue-500 underline">Back to Home</Link>
    </div>
  );
}

export default NotFoundPage;
