import { Link } from "wouter";
import { Separator } from "@/components/ui/separator";
import { Instagram, Facebook, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white border-t">
      <div className="container mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/catalog">
                  <a className="text-sm text-gray-600 hover:text-green-700">Catalog</a>
                </Link>
              </li>
              <li>
                <Link href="/admin/inventory">
                  <a className="text-sm text-gray-600 hover:text-green-700">Dashboard</a>
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">Contact</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>Sunnyvale, CA</li>
              <li>Open: Mon-Sat 9am-5pm</li>
              <li>Phone: (555) 123-4567</li>
              <li>Email: info@mygreenloop.co</li>
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h3 className="font-semibold mb-4">Follow Us</h3>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-gray-600 hover:text-green-700"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-gray-600 hover:text-green-700"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="mailto:info@mygreenloop.co"
                className="text-gray-600 hover:text-green-700"
                aria-label="Email"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-600">
            © {new Date().getFullYear()} My Green Loop. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="#">
              <a className="text-sm text-gray-600 hover:text-green-700">Privacy Policy</a>
            </Link>
            <Link href="#">
              <a className="text-sm text-gray-600 hover:text-green-700">Terms of Service</a>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}