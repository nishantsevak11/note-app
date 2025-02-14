'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, Trash2, FileText, Image, Copy, Pencil } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

export function NoteCard({ note, onClick, onDelete, onFavorite }) {
  const [isHovered, setIsHovered] = useState(false);

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(note._id);
  };

  const handleFavorite = (e) => {
    e.stopPropagation();
    onFavorite(note);
  };

  const copyToClipboard = async (e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(note.content);
      toast.success('Copied to clipboard');
    } catch (error) {
      console.error('Failed to copy:', error);
      toast.error('Failed to copy to clipboard');
    }
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    onClick();
  };

  const formatDate = (date) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  return (
    <Card
      onClick={onClick}
      className="bg-[#2D2D2D] border-gray-700 p-4 cursor-pointer hover:bg-[#363636] transition-colors group relative overflow-hidden"
    >
      {/* Type Icon */}
      <div className="absolute top-2 right-2 text-gray-400">
        {note.type === 'image' ? (
          <Image className="h-4 w-4" />
        ) : (
          <FileText className="h-4 w-4" />
        )}
      </div>

      {/* Content */}
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-white line-clamp-2 pr-6">{note.title}</h3>
        </div>

        {note.type === 'image' ? (
          <div className="aspect-video relative overflow-hidden rounded-md bg-[#1E1E1E]">
            <img
              src={note.imageUrl}
              alt={note.title}
              className="object-cover w-full h-full"
            />
          </div>
        ) : (
          <p className="text-gray-400 text-sm line-clamp-3">{note.content}</p>
        )}

        <div className="flex items-center justify-between text-xs text-gray-400 pt-2">
          <span>{formatDate(note.createdAt)}</span>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-gray-400 hover:text-white"
              onClick={handleFavorite}
            >
              <Star
                className={`h-4 w-4 ${
                  note.isFavorite ? 'fill-yellow-400 text-yellow-400' : ''
                }`}
              />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-gray-400 hover:text-white"
              onClick={copyToClipboard}
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-gray-400 hover:text-white"
              onClick={handleEdit}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-gray-400 hover:text-red-400"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
