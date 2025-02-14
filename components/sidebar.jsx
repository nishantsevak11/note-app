'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { signOut, useSession } from 'next-auth/react';
import { 
  FileText, 
  Star, 
  LogOut, 
  User,
  Menu,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function Sidebar({ activeFilter, onFilterChange }) {
  const [isMounted, setIsMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = useSession();

  // Prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  const SidebarContent = () => (
    <div className="h-full flex flex-col bg-[#2D2D2D] text-white">
      {/* Menu Items */}
      <div className="flex-1 p-4">
        <nav className="space-y-2">
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start",
              activeFilter === 'all' ? "bg-purple-600 text-white hover:bg-purple-700" : "text-gray-400 hover:text-white"
            )}
            onClick={() => {
              onFilterChange('all');
              setIsOpen(false);
            }}
          >
            <FileText className="h-4 w-4 mr-2" />
            All Notes
          </Button>

          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start",
              activeFilter === 'favorites' ? "bg-purple-600 text-white hover:bg-purple-700" : "text-gray-400 hover:text-white"
            )}
            onClick={() => {
              onFilterChange('favorites');
              setIsOpen(false);
            }}
          >
            <Star className="h-4 w-4 mr-2" />
            Favorites
          </Button>
        </nav>
      </div>

      {/* User Section */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <User className="h-4 w-4 text-gray-400" />
            <span className="ml-2 text-sm text-gray-400">
              {session?.user?.email || 'User'}
            </span>
          </div>
          <Button
            variant="ghost"
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="text-gray-400 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Trigger */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden fixed left-4 top-4 z-40"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 bg-[#2D2D2D] w-[300px]">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div className="hidden md:block w-[300px] border-r border-gray-700">
        <SidebarContent />
      </div>
    </>
  );
}
