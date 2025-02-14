'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Home, Star, Search, Settings, Menu, X, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Layout({ children }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const navigation = [
    {
      name: 'Home',
      href: '/',
      icon: Home,
      current: pathname === '/',
    },
    {
      name: 'Favorites',
      href: '/favorites',
      icon: Star,
      current: pathname === '/favorites',
    },
  ];

  return (
    <div className="min-h-screen bg-[#1C1C1C] text-white">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </Button>
      </div>

      {/* Sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-[#2D2D2D] px-6 pb-4">
          <div className="flex h-16 shrink-0 items-center">
            <h1 className="text-xl font-bold">AI Notes</h1>
          </div>
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navigation.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={`
                          group flex gap-x-3 rounded-md p-2 text-sm leading-6
                          ${item.current
                            ? 'bg-[#3D3D3D] text-white'
                            : 'text-gray-400 hover:text-white hover:bg-[#3D3D3D]'
                          }
                        `}
                      >
                        <item.icon
                          className={`h-6 w-6 shrink-0 ${item.current ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}
                          aria-hidden="true"
                        />
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            </ul>
          </nav>
          {/* User Profile */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-[#3D3D3D] cursor-pointer transition-colors">
              <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                U
              </div>
              <span className="flex-1 truncate">User Name</span>
              <Settings className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sidebar */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          {/* Background overlay */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => setIsMenuOpen(false)}
          />
          
          {/* Sidebar panel */}
          <div className="fixed inset-y-0 left-0 w-64 bg-[#2D2D2D] p-6">
            <div className="flex h-16 shrink-0 items-center">
              <h1 className="text-xl font-bold">AI Notes</h1>
            </div>
            <nav className="mt-6">
              <ul role="list" className="-mx-2 space-y-1">
                {navigation.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      onClick={() => setIsMenuOpen(false)}
                      className={`
                        group flex gap-x-3 rounded-md p-2 text-sm leading-6
                        ${item.current
                          ? 'bg-[#3D3D3D] text-white'
                          : 'text-gray-400 hover:text-white hover:bg-[#3D3D3D]'
                        }
                      `}
                    >
                      <item.icon
                        className={`h-6 w-6 shrink-0 ${item.current ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}
                        aria-hidden="true"
                      />
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            {/* User Profile */}
            <div className="absolute bottom-4 left-4 right-4">
              <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-[#3D3D3D] cursor-pointer transition-colors">
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                  U
                </div>
                <span className="flex-1 truncate">User Name</span>
                <Settings className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="lg:pl-64">
        <main className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
          {/* Mobile Header */}
          <div className="md:hidden flex items-center justify-between p-4 bg-[#2D2D2D]">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2">
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                AI
              </div>
              <span className="text-lg font-semibold">AI Notes</span>
            </div>
            <div className="w-6" /> {/* Spacer */}
          </div>

          {/* Content */}
          <div className="p-4">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
