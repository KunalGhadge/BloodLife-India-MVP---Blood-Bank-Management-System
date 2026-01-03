import React, { useState } from 'react';
import { Droplet, Home, Users, ClipboardList, Menu, X, Package, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NavbarProps {
  currentPath: string;
  setPath: (path: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPath, setPath }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Donors', path: '/donors', icon: Users },
    { label: 'Requests', path: '/requests', icon: ClipboardList },
    { label: 'Inventory', path: '/inventory', icon: Package },
    { label: 'Documentation', path: '/documentation/index.html', icon: BookOpen },
  ];

  const isExternal = (p: string) => /^https?:\/\//.test(p);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div 
          className="flex items-center gap-2 cursor-pointer group"
          onClick={() => setPath('/')}
        >
          <motion.div
            whileHover={{ scale: 1.1, rotate: 10 }}
            className="w-10 h-10 rounded-xl bg-red-500 flex items-center justify-center shadow-lg shadow-red-500/20"
          >
            <Droplet className="text-white fill-current" size={24} />
          </motion.div>
          <span className="font-black text-xl tracking-tight hidden sm:block text-slate-900">BloodLife India</span>
        </div>

        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = !isExternal(item.path) && (currentPath === item.path || (item.path !== '/' && currentPath.startsWith(item.path)));

            // Documentation is a static project file served at /documentation/index.html — use an anchor so the browser loads it
            const isDoc = item.path.startsWith('/documentation');

            if (isExternal(item.path)) {
              return (
                <a
                  key={item.path}
                  href={item.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-slate-600 hover:bg-slate-100"
                >
                  <item.icon size={18} />
                  {item.label}
                </a>
              );
            }

            if (isDoc) {
              return (
                <a
                  key={item.path}
                  href={item.path}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-slate-600 hover:bg-slate-100"
                >
                  <item.icon size={18} />
                  {item.label}
                </a>
              );
            }

            return (
              <button
                key={item.path}
                onClick={() => setPath(item.path)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  isActive 
                    ? 'bg-red-500/10 text-red-600 font-bold' 
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <button
            className="p-2 text-slate-600"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden glass border-t border-white/10 overflow-hidden"
          >
            <div className="flex flex-col p-4 gap-2">
              {navItems.map((item) => {
                const isDoc = item.path.startsWith('/documentation');

                if (isExternal(item.path)) {
                  return (
                    <a
                      key={item.path}
                      href={item.path}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setIsMenuOpen(false)}
                      className={`flex items-center gap-3 p-3 rounded-xl text-slate-900`}
                    >
                      <item.icon size={20} />
                      {item.label}
                    </a>
                  );
                }

                if (isDoc) {
                  return (
                    <a
                      key={item.path}
                      href={item.path}
                      onClick={() => setIsMenuOpen(false)}
                      className={`flex items-center gap-3 p-3 rounded-xl text-slate-900`}
                    >
                      <item.icon size={20} />
                      {item.label}
                    </a>
                  );
                }

                return (
                  <button
                    key={item.path}
                    onClick={() => {
                      setPath(item.path);
                      setIsMenuOpen(false);
                    }}
                    className={`flex items-center gap-3 p-3 rounded-xl ${
                      currentPath === item.path ? 'bg-red-500/10 text-red-600' : 'text-slate-900'
                    }`}
                  >
                    <item.icon size={20} />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
