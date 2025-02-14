'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileImage, Type } from 'lucide-react';

export function CreateNoteDialog({ open, onOpenChange, onSubmit }) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'text',
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;

    try {
      setIsLoading(true);

      if (formData.type === 'image' && selectedImage) {
        // Upload image first
        const imageFormData = new FormData();
        imageFormData.append('file', selectedImage);

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: imageFormData,
        });

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload image');
        }

        const { fileId } = await uploadResponse.json();

        // Create note with image reference
        await onSubmit({
          ...formData,
          imageUrl: `/api/files/${fileId}`,
        });
      } else {
        // Create text note
        await onSubmit(formData);
      }

      // Reset form
      setFormData({ title: '', content: '', type: 'text' });
      setSelectedImage(null);
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating note:', error);
      toast.error('Failed to create note');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      setSelectedImage(file);
      setFormData(prev => ({
        ...prev,
        title: file.name,
      }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-[#2D2D2D] text-white">
        <DialogHeader>
          <DialogTitle>Create Note</DialogTitle>
          <DialogDescription className="text-gray-400">
            Add a new note to your collection
          </DialogDescription>
        </DialogHeader>

        <Tabs
          defaultValue="text"
          className="w-full"
          onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="text" className="flex items-center gap-2">
              <Type className="h-4 w-4" />
              Text
            </TabsTrigger>
            <TabsTrigger value="image" className="flex items-center gap-2">
              <FileImage className="h-4 w-4" />
              Image
            </TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <TabsContent value="text">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="Enter note title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, title: e.target.value }))
                    }
                    className="bg-[#1E1E1E]"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    placeholder="Enter note content"
                    value={formData.content}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, content: e.target.value }))
                    }
                    className="min-h-[100px] bg-[#1E1E1E]"
                    required
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="image">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="Enter image title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, title: e.target.value }))
                    }
                    className="bg-[#1E1E1E]"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="image">Image</Label>
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="bg-[#1E1E1E]"
                    required
                  />
                  {selectedImage && (
                    <div className="mt-2">
                      <img
                        src={URL.createObjectURL(selectedImage)}
                        alt="Preview"
                        className="max-h-[200px] rounded-md"
                      />
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content">Caption (optional)</Label>
                  <Textarea
                    id="content"
                    placeholder="Enter image caption"
                    value={formData.content}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, content: e.target.value }))
                    }
                    className="min-h-[60px] bg-[#1E1E1E]"
                  />
                </div>
              </div>
            </TabsContent>

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {isLoading ? 'Creating...' : 'Create Note'}
              </Button>
            </div>
          </form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
