import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-white border-t">
      <div className="container mx-auto max-w-7xl px-4 py-6">
        <div className="flex justify-center items-center">
          <p className="text-sm text-gray-600">
            © {new Date().getFullYear()} My Green Loop. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}