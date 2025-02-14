'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mic, MicOff, FileImage, Loader2 } from "lucide-react";

export default function CreateNoteDialog({ open, onOpenChange, initialNote = null, mode = "create", onSubmit }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [images, setImages] = useState(initialNote?.images || []);
  const [isRecording, setIsRecording] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const recognition = useRef(null);

  // Initialize speech recognition
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        // Check for browser support
        if ('webkitSpeechRecognition' in window) {
          console.log('Using webkitSpeechRecognition');
          recognition.current = new window.webkitSpeechRecognition();
        } else if ('SpeechRecognition' in window) {
          console.log('Using SpeechRecognition');
          recognition.current = new window.SpeechRecognition();
        } else {
          console.log('Speech recognition not supported');
          return;
        }

        recognition.current.continuous = true;
        recognition.current.interimResults = true;
        recognition.current.lang = 'en-US';

        recognition.current.onstart = () => {
          console.log('Speech recognition started');
          setIsRecording(true);
          toast.success('Voice recording started. Speak now...');
        };

        recognition.current.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          setIsRecording(false);
          toast.error(`Error recording voice: ${event.error}`);
        };

        recognition.current.onend = () => {
          console.log('Speech recognition ended');
          setIsRecording(false);
          setInterimTranscript('');
        };

        recognition.current.onresult = (event) => {
          console.log('Speech recognition result received');
          let interim = '';
          let final = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            console.log(`Result ${i}:`, transcript, 'isFinal:', event.results[i].isFinal);
            
            if (event.results[i].isFinal) {
              final += transcript + ' ';
            } else {
              interim += transcript;
            }
          }

          console.log('Interim:', interim);
          console.log('Final:', final);

          if (interim) {
            setInterimTranscript(interim);
          }

          if (final) {
            setContent(prev => {
              const newContent = prev ? `${prev} ${final}` : final;
              console.log('Updated content:', newContent);
              return newContent.trim();
            });
            setInterimTranscript('');
          }
        };
      }
    } catch (error) {
      console.error('Error initializing speech recognition:', error);
    }

    return () => {
      if (recognition.current) {
        try {
          recognition.current.stop();
        } catch (e) {
          console.error('Error stopping recognition:', e);
        }
      }
    };
  }, []);

  useEffect(() => {
    if (initialNote && mode === "edit") {
      setTitle(initialNote.title);
      setContent(initialNote.content);
      setImages(initialNote.images || []);
    } else if (!open) {
      setTitle("");
      setContent("");
      setImages([]);
      setInterimTranscript('');
      if (recognition.current) {
        try {
          recognition.current.stop();
        } catch (e) {
          console.error('Error stopping recognition:', e);
        }
      }
    }
  }, [initialNote, mode, open]);

  const toggleRecording = async () => {
    try {
      if (!recognition.current) {
        toast.error('Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.');
        return;
      }

      if (isRecording) {
        console.log('Stopping recording...');
        recognition.current.stop();
        toast.success('Voice recording stopped');
      } else {
        console.log('Starting recording...');
        // Request microphone permission first
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop()); // Stop the stream right away, we just needed permission
        recognition.current.start();
      }
    } catch (error) {
      console.error('Error toggling recording:', error);
      toast.error('Error accessing microphone. Please check your permissions.');
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const totalImages = images.length + files.length;
    if (totalImages > 10) {
      toast.error('Maximum 10 images allowed per note');
      return;
    }

    files.forEach(file => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Maximum size is 5MB`);
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImages(prev => [...prev, {
          name: file.name,
          type: file.type,
          data: reader.result
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    if (!title && !content && images.length === 0) {
      toast.error('Please add a title, content, or images');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        title,
        content,
        images
      });
      setTitle('');
      setContent('');
      setImages([]);
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating/updating note:', error);
      toast.error('Failed to save note');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => {
      if (!open && recognition.current) {
        try {
          recognition.current.stop();
        } catch (e) {
          console.error('Error stopping recognition:', e);
        }
      }
      onOpenChange(open);
    }}>
      <DialogContent className="sm:max-w-[625px] bg-[#1E1E1E] text-white">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Create Note' : 'Edit Note'}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="flex items-center gap-4">
            <Input
              placeholder="Note title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-[#2D2D2D] border-gray-700"
            />
          </div>

          <div className="relative">
            <Textarea
              placeholder="Write your note content or click the microphone to start speaking..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[200px] bg-[#2D2D2D] border-gray-700"
            />
            {interimTranscript && (
              <div className="absolute bottom-14 left-0 right-0 p-2 bg-gray-800 text-gray-400 italic rounded">
                {interimTranscript}
              </div>
            )}
            <div className="absolute bottom-2 right-2 flex gap-2">
              <Button
                size="icon"
                variant="ghost"
                className={`${isRecording ? 'text-red-500 animate-pulse' : ''} hover:bg-gray-700`}
                onClick={toggleRecording}
                title={isRecording ? "Stop recording" : "Start recording"}
              >
                {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
              <div className="relative">
                <Button
                  size="icon"
                  variant="ghost"
                  className="hover:bg-gray-700"
                  onClick={() => document.getElementById('image-upload').click()}
                  title="Upload images"
                >
                  <FileImage className="h-4 w-4" />
                </Button>
                <input
                  type="file"
                  id="image-upload"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </div>
            </div>
          </div>

          {images.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
              {images.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={image.data}
                    alt={image.name}
                    className="w-full aspect-square object-cover rounded-lg"
                  />
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 p-1 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-4">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="hover:bg-[#2D2D2D]"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              mode === 'create' ? 'Create Note' : 'Update Note'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
