import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="theme-shell flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="aiq-heading mb-4 text-4xl font-bold">404</h1>
        <p className="aiq-muted mb-4 text-xl">Oops! Page not found</p>
        <a href="/" className="aiq-accent underline">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
