'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, Calendar, Star, Type } from 'lucide-react';

export function SortNotes({ onSort, currentSort }) {
  const sortOptions = [
    { id: 'date-desc', label: 'Latest', icon: Calendar },
    { id: 'date-asc', label: 'Oldest', icon: Calendar },
    { id: 'title-asc', label: 'Title A-Z', icon: Type },
    { id: 'title-desc', label: 'Title Z-A', icon: Type },
    { id: 'favorite', label: 'Favorites', icon: Star },
  ];

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {sortOptions.map((option) => {
        const Icon = option.icon;
        const isActive = currentSort === option.id;
        
        return (
          <Button
            key={option.id}
            variant={isActive ? "secondary" : "outline"}
            size="sm"
            onClick={() => onSort(option.id)}
            className="flex items-center gap-2"
          >
            <Icon className="h-4 w-4" />
            {option.label}
          </Button>
        );
      })}
    </div>
  );
}
