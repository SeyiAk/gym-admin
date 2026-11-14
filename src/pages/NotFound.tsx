import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-page text-center">
      <p className="text-7xl font-bold text-appPrimary">404</p>
      <p className="text-2xl font-bold text-white">Page not found</p>
      <p className="text-lg text-muted">The page you're looking for doesn't exist or was moved.</p>
      <Button asChild className="mt-2">
        <Link to="/overview">Back to dashboard</Link>
      </Button>
    </div>
  );
}
