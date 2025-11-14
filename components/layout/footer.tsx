import Link from 'next/link'
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t bg-slate-50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* About Section */}
          <div>
            <div className="mb-4 flex items-center space-x-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-900">
                <span className="text-xl font-bold text-white">✝</span>
              </div>
              <span className="text-lg font-bold text-blue-900">TPC Ministries</span>
            </div>
            <p className="text-sm text-slate-600">
              Transforming lives through Christ across Kenya, South Africa, and Grenada.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-slate-900">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-sm text-slate-600 hover:text-blue-900">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/missions" className="text-sm text-slate-600 hover:text-blue-900">
                  Our Missions
                </Link>
              </li>
              <li>
                <Link href="/teachings" className="text-sm text-slate-600 hover:text-blue-900">
                  Teachings
                </Link>
              </li>
              <li>
                <Link href="/give" className="text-sm text-slate-600 hover:text-blue-900">
                  Give
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-slate-900">Contact Us</h3>
            <ul className="space-y-2">
              <li className="flex items-start space-x-2 text-sm text-slate-600">
                <Mail className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span>info@tpcministries.org</span>
              </li>
              <li className="flex items-start space-x-2 text-sm text-slate-600">
                <Phone className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-start space-x-2 text-sm text-slate-600">
                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span>Global Ministry Headquarters</span>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-slate-900">Connect With Us</h3>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-slate-600 transition-colors hover:text-blue-900"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-slate-600 transition-colors hover:text-blue-900"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-slate-600 transition-colors hover:text-blue-900"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-slate-600 transition-colors hover:text-blue-900"
                aria-label="YouTube"
              >
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 border-t pt-8">
          <div className="flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0">
            <p className="text-sm text-slate-600">
              © {currentYear} TPC Ministries. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <Link href="/privacy" className="text-sm text-slate-600 hover:text-blue-900">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-sm text-slate-600 hover:text-blue-900">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
