import { Link, useLocation } from 'react-router-dom'

const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'Dataset', path: '/dataset' },
  { name: 'Statistics', path: '/statistics' },
  { name: 'About', path: '/about' },
]

export default function Navbar() {
  const location = useLocation()

  return (
    <nav className="border-b border-gray-200 bg-white sticky top-0 z-50">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link to="/" className="font-semibold text-gray-900 text-sm md:text-base hover:text-gray-700 transition-colors">
              FAST '26: SpecFS
            </Link>
            <div className="flex items-center gap-4 md:gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-sm font-medium transition-colors ${
                    location.pathname === link.path
                      ? 'text-gray-900'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
