'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Star, Maximize2, Minimize2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export function NoteDetail({ note, open, onOpenChange, onUpdate, onDelete }) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    isFavorite: false,
    type: 'text',
    audioUrl: '',
    imageUrl: '',
  });

  useEffect(() => {
    if (note) {
      setFormData({
        title: note.title || '',
        content: note.content || '',
        isFavorite: note.isFavorite || false,
        type: note.type || 'text',
        audioUrl: note.audioUrl || '',
        imageUrl: note.imageUrl || '',
      });
    }
  }, [note]);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!formData.title || !formData.content) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await onUpdate({
        ...note,
        ...formData,
      });
      toast.success('Note updated successfully');
    } catch (error) {
      console.error('Error updating note:', error);
      toast.error('Failed to update note');
    }
  };

  const handleDelete = async () => {
    if (!note?._id) return;

    if (window.confirm('Are you sure you want to delete this note?')) {
      try {
        await onDelete(note._id);
        toast.success('Note deleted successfully');
      } catch (error) {
        console.error('Error deleting note:', error);
        toast.error('Failed to delete note');
      }
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  if (!note) return null;

  return (
    <Dialog 
      open={open} 
      onOpenChange={(newOpen) => {
        if (!newOpen) {
          handleSubmit();
          setIsFullscreen(false);
        }
        onOpenChange(newOpen);
      }}
    >
      <DialogContent 
        className={cn(
          "bg-[#2D2D2D] text-white border-gray-700",
          isFullscreen 
            ? "fixed inset-0 w-full h-full max-w-none rounded-none p-6" 
            : "sm:max-w-[600px] p-6"
        )}
      >
        <DialogTitle className="text-lg font-semibold mb-4">Edit Note</DialogTitle>
        <DialogDescription className="text-gray-400 mb-4">
          Make changes to your note here. Click the expand button to view in full screen.
        </DialogDescription>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center justify-between gap-4 mb-4">
            <Input
              type="text"
              placeholder="Title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="bg-[#1E1E1E] border-gray-700 flex-1"
            />
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setFormData(prev => ({ ...prev, isFavorite: !prev.isFavorite }))}
                className="text-gray-400 hover:text-white"
              >
                <Star className={`h-4 w-4 ${formData.isFavorite ? 'fill-yellow-400 text-yellow-400' : ''}`} />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={toggleFullscreen}
                className="text-gray-400 hover:text-white"
              >
                {isFullscreen ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {formData.type === 'audio' && formData.audioUrl && (
              <div className="w-full">
                <audio controls className="w-full">
                  <source src={formData.audioUrl} type="audio/webm" />
                  Your browser does not support the audio element.
                </audio>
              </div>
            )}

            {formData.type === 'image' && formData.imageUrl && (
              <div className="w-full">
                <img
                  src={formData.imageUrl}
                  alt={formData.title}
                  className={cn(
                    "w-full rounded-lg object-cover",
                    isFullscreen ? "max-h-[60vh]" : "max-h-[200px]"
                  )}
                />
              </div>
            )}

            <Textarea
              placeholder="Content"
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              className={cn(
                "bg-[#1E1E1E] border-gray-700 resize-none",
                isFullscreen ? "min-h-[50vh]" : "min-h-[200px]"
              )}
            />
          </div>

          <div className="flex justify-between items-center pt-4">
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>

            <Button 
              type="submit"
              className="bg-purple-600 hover:bg-purple-700"
              disabled={!formData.title || !formData.content}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
