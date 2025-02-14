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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mic, Upload, X, Loader2, FileImage, Share2, Maximize2 } from "lucide-react";
import { format } from 'date-fns/format';

export default function CreateNoteDialog({ open, onOpenChange, initialNote = null, mode = "create", onSubmit }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [images, setImages] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [activeTab, setActiveTab] = useState("notes");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);

  useEffect(() => {
    if (initialNote && mode === "edit") {
      setTitle(initialNote.title);
      setContent(initialNote.content);
      setImages(initialNote.images || []);
      if (initialNote.audio) {
        setAudioBlob(new Blob([initialNote.audio.data], { type: initialNote.audio.contentType }));
      }
    } else if (!open) {
      // Reset form when dialog closes
      setTitle("");
      setContent("");
      setImages([]);
      setAudioBlob(null);
      setActiveTab("notes");
    }
  }, [initialNote, mode, open]);

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };

      mediaRecorder.current.onstop = () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
      };

      mediaRecorder.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast.error('Error accessing microphone. Please check your permissions.');
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      setIsRecording(false);
      mediaRecorder.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const handleTranscribe = async () => {
    if (!audioBlob) {
      toast.error('No audio recording found');
      return;
    }

    setIsTranscribing(true);
    const formData = new FormData();
    formData.append('file', audioBlob, 'recording.webm');
    formData.append('title', title || 'Untitled Recording');

    try {
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to transcribe audio');
      }

      const data = await response.json();
      
      // Poll for transcription status
      const pollInterval = setInterval(async () => {
        const statusResponse = await fetch(`/api/transcribe?noteId=${data.noteId}`);
        const statusData = await statusResponse.json();

        if (statusData.status === 'completed') {
          clearInterval(pollInterval);
          setIsTranscribing(false);
          toast.success('Transcription completed!');
          onOpenChange(false);
        } else if (statusData.status === 'failed') {
          clearInterval(pollInterval);
          setIsTranscribing(false);
          toast.error('Transcription failed: ' + statusData.error);
        }
      }, 2000);

    } catch (error) {
      console.error('Error transcribing audio:', error);
      toast.error('Error transcribing audio');
      setIsTranscribing(false);
    }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image file`);
        continue;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImages(prev => [...prev, {
          name: file.name,
          data: reader.result,
          contentType: file.type
        }]);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error('Please fill in both title and content');
      return;
    }

    setIsSubmitting(true);
    
    try {
      let audioData = null;
      if (audioBlob) {
        const reader = new FileReader();
        audioData = await new Promise((resolve) => {
          reader.onloadend = () => resolve({
            name: 'recording.webm',
            data: reader.result.split(',')[1], // Get base64 data without prefix
            contentType: audioBlob.type,
          });
          reader.readAsDataURL(audioBlob);
        });
      }

      const noteData = {
        title: title.trim(),
        content: content.trim(),
        images,
        audio: audioData,
      };

      await onSubmit(noteData);
      
      // Reset form on successful submission for create mode
      if (mode === "create") {
        setTitle('');
        setContent('');
        setImages([]);
        setAudioBlob(null);
        setActiveTab("notes");
      }
      
    } catch (error) {
      console.error(`Error ${mode}ing note:`, error);
      toast.error(`Error ${mode}ing note`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 bg-[#1E1E1E] text-white overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-gray-800">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold">{title || 'Untitled Note'}</h2>
            <span className="text-sm text-gray-400">
              {format(new Date(), 'dd MMMM yyyy, hh:mm a')}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Share2 className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Maximize2 className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="p-6">
          <Tabs defaultValue="notes" value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="notes">Notes</TabsTrigger>
              <TabsTrigger value="transcript">Transcript</TabsTrigger>
              <TabsTrigger value="create">Create</TabsTrigger>
            </TabsList>

            <TabsContent value="notes">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Input
                    placeholder="Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-transparent text-xl font-semibold outline-none border-none"
                  />
                </div>

                <div>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Start typing your note..."
                    className="w-full h-[300px] bg-transparent outline-none border-none resize-none"
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <label
                      htmlFor="images"
                      className={`flex items-center gap-2 px-4 py-2 rounded-md cursor-pointer transition-colors
                        ${isRecording ? 'bg-gray-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                    >
                      <FileImage className="h-5 w-5" />
                      <span>Add Images</span>
                      <input
                        id="images"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {images.length > 0 && (
                    <div className="grid grid-cols-2 gap-4">
                      {images.map((image, index) => (
                        <div key={index} className="relative group aspect-video">
                          <img
                            src={image.data}
                            alt={image.name || `Note image ${index + 1}`}
                            className="w-full h-full object-cover rounded-md"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-2 right-2 p-1 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-4 w-4 text-white" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                  >
                    {mode === "edit" ? "Update Note" : "Create Note"}
                  </Button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="transcript">
              <div className="space-y-4">
                <Input
                  placeholder="Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="border-0 text-lg font-semibold focus-visible:ring-0"
                />
                
                <div className="flex flex-col items-center justify-center h-48 border-2 border-dashed rounded-lg">
                  {isRecording ? (
                    <div className="flex flex-col items-center gap-4">
                      <div className="animate-pulse">
                        <Mic className="w-8 h-8 text-red-500" />
                      </div>
                      <Button onClick={handleStopRecording} variant="destructive">
                        Stop Recording
                      </Button>
                    </div>
                  ) : audioBlob ? (
                    <div className="flex flex-col items-center gap-4">
                      <audio src={URL.createObjectURL(audioBlob)} controls />
                      <div className="flex gap-2">
                        <Button onClick={() => setAudioBlob(null)} variant="outline">
                          Record Again
                        </Button>
                        <Button onClick={handleTranscribe} disabled={isTranscribing}>
                          {isTranscribing ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Transcribing...
                            </>
                          ) : (
                            'Transcribe'
                          )}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button onClick={handleStartRecording}>
                      <Mic className="w-4 h-4 mr-2" />
                      Start Recording
                    </Button>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="create">
              <div className="text-gray-400">
                Create feature coming soon...
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
