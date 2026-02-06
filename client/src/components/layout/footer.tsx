import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-white border-t">
      <div className="container mx-auto max-w-7xl px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-sm text-gray-600">
            © {new Date().getFullYear()} My Green Loop. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center md:justify-end items-center space-x-6 text-sm">
            <Link href="/resources" className="text-gray-600 hover:text-green-600 transition-colors">
              Resources
            </Link>
            <span className="text-gray-400">|</span>
            <Link href="/reviews" className="text-gray-600 hover:text-green-600 transition-colors">
              Customer Reviews
            </Link>
            <span className="text-gray-400">|</span>
            <Link href="/feedback" className="text-gray-600 hover:text-green-600 transition-colors">
              Share Feedback
            </Link>
            <span className="text-gray-400">|</span>
            <Link href="/privacy-policy" className="text-gray-600 hover:text-green-600 transition-colors">
              Privacy Policy
            </Link>
            <span className="text-gray-400">|</span>
            <Link href="/terms-of-service" className="text-gray-600 hover:text-green-600 transition-colors">
              Terms of Service
            </Link>
            <span className="text-gray-400">|</span>
            <span className="text-gray-600">Contact: wolfetechnologies8@gmail.com</span>
          </div>
        </div>
      </div>
    </footer>
  );
}