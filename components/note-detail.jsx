'use client';

import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Star, Trash2, Copy, Pencil, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns/formatDistanceToNow';
import { toast } from 'sonner';
import CreateNoteDialog from './create-note-dialog';
import { useState } from 'react';

export function NoteDetail({ note, open, onOpenChange, onDelete, onFavorite }) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);

  const handleDelete = async () => {
    try {
      await onDelete(note._id);
      onOpenChange(false);
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const handleFavorite = async () => {
    try {
      await onFavorite(note);
    } catch (error) {
      console.error('Error updating favorite status:', error);
    }
  };

  const copyToClipboard = async () => {
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

  const handlePreviousImage = (e) => {
    e.stopPropagation();
    if (selectedImageIndex > 0) {
      setSelectedImageIndex(selectedImageIndex - 1);
    }
  };

  const handleNextImage = (e) => {
    e.stopPropagation();
    if (selectedImageIndex < note.images.length - 1) {
      setSelectedImageIndex(selectedImageIndex + 1);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[625px] bg-[#1E1E1E] text-white">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-semibold">{note.title}</h2>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-yellow-500 hover:text-yellow-400"
                onClick={handleFavorite}
              >
                <Star className={note.isFavorite ? 'fill-current' : ''} />
              </Button>
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
                onClick={() => setIsEditDialogOpen(true)}
              >
                <Pencil className="w-4 h-4" />
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
                onClick={() => onOpenChange(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-gray-300 whitespace-pre-wrap">{note.content}</p>

            {note.images && note.images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                {note.images.map((image, index) => (
                  <div
                    key={index}
                    className="relative group cursor-pointer"
                    onClick={() => setSelectedImageIndex(index)}
                  >
                    <img
                      src={image.data}
                      alt={image.name}
                      className="w-full aspect-square object-cover rounded-lg transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity rounded-lg" />
                  </div>
                ))}
              </div>
            )}

            <div className="text-sm text-gray-500">
              Last updated {formatDate(note.updatedAt || note.createdAt)}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <CreateNoteDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        initialNote={note}
        mode="edit"
        onSubmit={async (updatedNote) => {
          try {
            await onFavorite({ ...note, ...updatedNote });
            setIsEditDialogOpen(false);
          } catch (error) {
            console.error('Error updating note:', error);
          }
        }}
      />

      {selectedImageIndex !== null && note.images && (
        <Dialog 
          open={selectedImageIndex !== null} 
          onOpenChange={() => setSelectedImageIndex(null)}
        >
          <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-black/95 border-none overflow-hidden">
            <div className="relative w-full h-full flex items-center justify-center">
              <img
                src={note.images[selectedImageIndex].data}
                alt={note.images[selectedImageIndex].name}
                className="max-w-full max-h-[90vh] object-contain"
              />
              
              {/* Navigation buttons */}
              {selectedImageIndex > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 text-white bg-black/50 hover:bg-black/75"
                  onClick={handlePreviousImage}
                >
                  <ChevronLeft className="w-6 h-6" />
                </Button>
              )}
              
              {selectedImageIndex < note.images.length - 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 text-white bg-black/50 hover:bg-black/75"
                  onClick={handleNextImage}
                >
                  <ChevronRight className="w-6 h-6" />
                </Button>
              )}

              {/* Close button */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 text-white bg-black/50 hover:bg-black/75"
                onClick={() => setSelectedImageIndex(null)}
              >
                <X className="w-6 h-6" />
              </Button>

              {/* Image counter */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white bg-black/50 px-4 py-2 rounded-full">
                {selectedImageIndex + 1} / {note.images.length}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
