import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, MapPin, User, Menu, X, LogOut, ShoppingCart } from 'lucide-react';
import LocationModal from './LocationModal';
import AuthModal from './AuthModal';
import { supabase } from '../lib/supabase';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { state: cartState } = useCart();
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('Select Location');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Get saved location from localStorage
    const savedLocation = localStorage.getItem('selectedLocation');
    if (savedLocation) {
      setSelectedLocation(savedLocation);
    }

    // Get current location on mount
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`
            );
            const data = await response.json();
            const locationString = data.display_name;
            setSelectedLocation(locationString);
            localStorage.setItem('selectedLocation', locationString);
          } catch (error) {
            console.error('Error getting location:', error);
          }
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLocationSelect = (location: { address: string; lat: number; lng: number }) => {
    setSelectedLocation(location.address);
    localStorage.setItem('selectedLocation', location.address);
    setIsLocationModalOpen(false);
    toast.success('Location updated successfully!');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('Successfully logged out!');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <>
      <nav className="bg-white shadow-md fixed w-full top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/" className="text-2xl font-bold text-blue-600">
                UC
              </Link>
              <button
                onClick={() => setIsLocationModalOpen(true)}
                className="ml-4 flex items-center hover:bg-gray-100 px-2 py-1 rounded-lg hidden sm:flex"
              >
                <MapPin className="h-5 w-5 text-gray-500" />
                <span className="ml-2 text-gray-700 max-w-[200px] truncate">
                  {selectedLocation}
                </span>
              </button>
            </div>
            
            <div className="hidden sm:flex items-center flex-1 justify-end">
              <form onSubmit={handleSearch} className="relative mx-4">
                <input
                  type="text"
                  placeholder="Search for services"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </form>
              
              <Link
                to="/cart"
                className="mr-4 flex items-center hover:bg-gray-100 px-2 py-1 rounded-lg relative"
              >
                <ShoppingCart className="h-5 w-5 text-gray-700" />
                {cartState.items.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartState.items.length}
                  </span>
                )}
              </Link>

              {user ? (
                <div className="flex items-center space-x-4">
                  <span className="text-gray-700">{user.email}</span>
                  <button
                    onClick={handleLogout}
                    className="flex items-center px-4 py-2 rounded-lg hover:bg-gray-100"
                  >
                    <LogOut className="h-5 w-5 text-gray-700 mr-2" />
                    <span className="text-gray-700">Logout</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="flex items-center px-4 py-2 rounded-lg hover:bg-gray-100"
                >
                  <User className="h-5 w-5 text-gray-700" />
                  <span className="ml-2 text-gray-700">Login</span>
                </button>
              )}
            </div>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="sm:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6 text-gray-700" />
              ) : (
                <Menu className="h-6 w-6 text-gray-700" />
              )}
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="sm:hidden bg-white border-t">
            <div className="px-4 py-2">
              <button
                onClick={() => setIsLocationModalOpen(true)}
                className="flex items-center w-full py-2"
              >
                <MapPin className="h-5 w-5 text-gray-500" />
                <span className="ml-2 text-gray-700 truncate">{selectedLocation}</span>
              </button>
              
              <form onSubmit={handleSearch} className="relative my-2">
                <input
                  type="text"
                  placeholder="Search for services"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </form>

              <Link
                to="/cart"
                className="flex items-center w-full py-2"
              >
                <ShoppingCart className="h-5 w-5 text-gray-700" />
                <span className="ml-2 text-gray-700">Cart ({cartState.items.length})</span>
              </Link>
              
              {user ? (
                <>
                  <div className="py-2 text-gray-700">{user.email}</div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full py-2"
                  >
                    <LogOut className="h-5 w-5 text-gray-700 mr-2" />
                    <span className="text-gray-700">Logout</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="flex items-center w-full py-2"
                >
                  <User className="h-5 w-5 text-gray-700" />
                  <span className="ml-2 text-gray-700">Login</span>
                </button>
              )}
            </div>
          </div>
        )}
      </nav>

      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        onSelectLocation={handleLocationSelect}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </>
  );
};

export default Navbar;