import React from 'react';
import { Link } from 'react-router-dom';

const Navbar: React.FC = () => {
  return (
    <nav className="bg-white shadow">
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-lg font-bold">Attrition Analytics</span>
            </div>
            <div className="ml-6 flex space-x-4 items-center">
              <Link to="/" className="px-3 py-2 rounded-md text-gray-700 hover:text-gray-900">
                Dashboard
              </Link>
              <Link to="/advanced" className="px-3 py-2 rounded-md text-gray-700 hover:text-gray-900">
                Advanced Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
