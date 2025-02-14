'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, Trash2, Copy, Pencil, FileImage, Clock } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { toast } from 'sonner';
import CreateNoteDialog from './create-note-dialog';

export function NoteCard({ note, onClick, onDelete, onFavorite }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showFullDate, setShowFullDate] = useState(false);

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

  const handleUpdate = async (updatedNote) => {
    try {
      const noteToUpdate = {
        ...updatedNote,
        _id: note._id
      };
      await onClick(noteToUpdate);
      setIsDialogOpen(false);
      toast.success('Note updated successfully');
    } catch (error) {
      console.error('Error updating note:', error);
      toast.error('Failed to update note');
    }
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
    const dateObj = new Date(date);
    if (showFullDate) {
      return format(dateObj, 'MMM d, yyyy h:mm a');
    }
    const distance = formatDistanceToNow(dateObj, { addSuffix: true });
    // If it's more than 7 days old, show the full date
    if (Date.now() - dateObj > 7 * 24 * 60 * 60 * 1000) {
      return format(dateObj, 'MMM d, yyyy');
    }
    return distance;
  };

  return (
    <>
      <Card
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={onClick}
        className="bg-[#2D2D2D] border-gray-700 p-4 cursor-pointer hover:bg-[#363636] transition-all duration-200 group relative overflow-hidden hover:shadow-lg hover:-translate-y-0.5"
      >
        <div className="space-y-3">
          {/* Header with title and favorite */}
          <div className="flex justify-between items-start gap-2">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-white truncate group-hover:text-blue-400 transition-colors">{note.title}</h3>
              {note.images && note.images.length > 0 && (
                <FileImage className="w-4 h-4 text-blue-400 flex-shrink-0" />
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className={`text-yellow-500 hover:text-yellow-400 flex-shrink-0 transition-all duration-200 ${note.isFavorite ? 'opacity-100 scale-100' : 'opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100'}`}
              onClick={handleFavorite}
            >
              <Star className={note.isFavorite ? 'fill-current' : ''} />
            </Button>
          </div>

          {/* Content */}
          <p className="text-gray-400 line-clamp-3 min-h-[4.5rem] group-hover:text-gray-300 transition-colors">{note.content}</p>

          {/* Image preview */}
          {note.images && note.images.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
              {note.images.slice(0, 3).map((image, index) => (
                <div key={index} className="relative flex-shrink-0 transition-transform duration-200 hover:scale-105">
                  <img
                    src={image.data}
                    alt={image.name}
                    className="w-16 h-16 object-cover rounded-lg shadow-md"
                  />
                  {note.images.length > 3 && index === 2 && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg backdrop-blur-sm">
                      <span className="text-white text-sm font-medium">+{note.images.length - 3}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Footer with date and actions */}
          <div className="flex justify-between items-center pt-2 border-t border-gray-700/50">
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <Clock className="w-3.5 h-3.5" />
              <span className="hover:text-gray-300 transition-colors">
                {formatDate(note.updatedAt || note.createdAt)}
              </span>
            </div>
            
            <div className="flex items-center gap-0.5">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-gray-400 hover:text-white hover:bg-gray-700/50"
                onClick={copyToClipboard}
              >
                <Copy className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-gray-400 hover:text-red-400 hover:bg-red-400/10"
                onClick={handleDelete}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-gray-400 hover:text-blue-400 hover:bg-blue-400/10"
                onClick={handleEdit}
              >
                <Pencil className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <CreateNoteDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        initialNote={note}
        mode="edit"
        onSubmit={handleUpdate}
      />
    </>
  );
}
