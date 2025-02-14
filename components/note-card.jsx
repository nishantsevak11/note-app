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
            <div className="flex items-center gap-2 flex-1">
              <h3 className="text-lg font-semibold text-white truncate">{note.title}</h3>
              {note.images && note.images.length > 0 && (
                <FileImage className="w-4 h-4 text-blue-400" />
              )}
            </div>
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

          {note.images && note.images.length > 0 && (
            <div className="flex gap-2 mt-2 overflow-x-auto pb-2">
              {note.images.slice(0, 3).map((image, index) => (
                <div key={index} className="relative flex-shrink-0">
                  <img
                    src={image.data}
                    alt={image.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                  {note.images.length > 3 && index === 2 && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded">
                      <span className="text-white text-sm">+{note.images.length - 3}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

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
