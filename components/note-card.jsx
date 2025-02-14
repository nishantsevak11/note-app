'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, Trash2, Copy, Pencil, FileImage } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns/formatDistanceToNow';
import { toast } from 'sonner';
import CreateNoteDialog from './create-note-dialog';

export function NoteCard({ note, onClick, onDelete, onFavorite }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleDelete = async (e) => {
    e.stopPropagation();
    try {
      await onDelete(note._id);
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const handleFavorite = async (e) => {
    e.stopPropagation();
    try {
      await onFavorite(note);
    } catch (error) {
      console.error('Error updating favorite status:', error);
    }
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    setIsDialogOpen(true);
  };

  const copyToClipboard = async (e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(note.content);
      toast.success('Content copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy content');
    }
  };

  const formatDate = (date) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  return (
    <>
      <Card
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={onClick}
        className="bg-[#2D2D2D] border-gray-700 p-4 cursor-pointer hover:bg-[#363636] transition-colors group relative overflow-hidden"
      >
        <div className="space-y-2">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-semibold text-white truncate pr-8">{note.title}</h3>
            <Button
              variant="ghost"
              size="icon"
              className={`text-yellow-500 hover:text-yellow-400 ${note.isFavorite ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
              onClick={handleFavorite}
            >
              <Star className={note.isFavorite ? 'fill-current' : ''} />
            </Button>
          </div>

          <p className="text-gray-400 line-clamp-3">{note.content}</p>

          <div className="flex justify-between items-center mt-4">
            <span className="text-sm text-gray-500">{formatDate(note.updatedAt || note.createdAt)}</span>
            
            <div className={`flex gap-2 transition-opacity ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-white"
                onClick={copyToClipboard}
              >
                <Copy className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-white"
                onClick={handleDelete}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-white"
                onClick={handleEdit}
              >
                <Pencil className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {note.images?.length > 0 && (
          <div className="absolute top-0 right-0 w-16 h-16 -mr-8 -mt-8 bg-blue-500 rotate-45">
            <FileImage className="absolute bottom-2 left-2 w-4 h-4 text-white transform -rotate-45" />
          </div>
        )}
      </Card>

      <CreateNoteDialog 
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        initialNote={note}
        mode="edit"
        onSubmit={onClick}
      />
    </>
  );
}
