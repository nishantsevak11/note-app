'use client';

import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Mic, Image as ImageIcon, X, Share, Download, Expand } from 'lucide-react';
import { toast } from 'sonner';

export function NoteDialog({ open, onOpenChange, onSave, initialNote = null }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioDuration, setAudioDuration] = useState(0);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const fileInputRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    if (initialNote) {
      setTitle(initialNote.title);
      setContent(initialNote.content);
      // Handle other fields as needed
    }
  }, [initialNote]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      const startTime = Date.now();
      const durationInterval = setInterval(() => {
        setAudioDuration((Date.now() - startTime) / 1000);
      }, 100);

      mediaRecorderRef.current.durationInterval = durationInterval;
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast.error('Error accessing microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      clearInterval(mediaRecorderRef.current.durationInterval);
      setIsRecording(false);
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      setImageFile(file);
    }
  };

  const handleSave = async () => {
    try {
      let noteData = {
        title: title || new Date().toLocaleString(),
        content,
        type: 'text'
      };

      if (audioBlob) {
        const formData = new FormData();
        formData.append('audio', audioBlob);
        const audioResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });
        if (!audioResponse.ok) throw new Error('Failed to upload audio');
        const audioData = await audioResponse.json();
        noteData.audioUrl = audioData.url;
        noteData.type = 'audio';
      }

      if (imageFile) {
        const formData = new FormData();
        formData.append('file', imageFile);
        const imageResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });
        if (!imageResponse.ok) throw new Error('Failed to upload image');
        const imageData = await imageResponse.json();
        noteData.imageUrl = imageData.url;
        noteData.type = 'image';
      }

      await onSave(noteData);
      handleReset();
    } catch (error) {
      console.error('Error saving note:', error);
      toast.error('Error saving note');
    }
  };

  const handleReset = () => {
    setTitle('');
    setContent('');
    setAudioBlob(null);
    setImageFile(null);
    setImagePreview('');
    setIsRecording(false);
    setAudioDuration(0);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={open} onOpenChange={(open) => {
      if (!open) handleReset();
      onOpenChange(open);
    }}>
      <DialogContent className="sm:max-w-[625px] bg-[#2D2D2D] border-none text-white p-0">
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <div className="flex items-center space-x-2">
            <Expand className="h-5 w-5" />
            <span className="text-gray-400">{formatTime(audioDuration)}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon">
              <Share className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="p-4 space-y-4">
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-transparent border-none text-xl font-semibold focus:outline-none"
          />

          <Textarea
            placeholder="Start typing..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[200px] bg-transparent border-none resize-none focus:outline-none"
          />

          {audioBlob && (
            <div className="rounded-lg bg-[#3D3D3D] p-3">
              <audio controls className="w-full">
                <source src={URL.createObjectURL(audioBlob)} type="audio/webm" />
                Your browser does not support the audio element.
              </audio>
            </div>
          )}

          {imagePreview && (
            <div className="relative">
              <img
                src={imagePreview}
                alt="Preview"
                className="max-h-48 w-full object-cover rounded-lg"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 bg-black bg-opacity-50"
                onClick={() => {
                  setImageFile(null);
                  setImagePreview('');
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center p-4 border-t border-gray-700">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={isRecording ? stopRecording : startRecording}
              className={isRecording ? 'text-red-500' : ''}
            >
              <Mic className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
            >
              <ImageIcon className="h-5 w-5" />
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
              />
            </Button>
          </div>
          <Button
            onClick={handleSave}
            className="bg-purple-600 hover:bg-purple-700"
          >
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
