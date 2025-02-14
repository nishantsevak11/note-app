'use client';

import * as React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Plus, Mic, Upload, FileAudio } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

export function CreateNoteMenu() {
  const router = useRouter();
  const [isRecording, setIsRecording] = useState(false);
  const [audioStream, setAudioStream] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioFile, setAudioFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setAudioStream(stream);
      const recorder = new MediaRecorder(stream);
      setMediaRecorder(recorder);

      const chunks = [];
      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioFile(blob);
        // Convert to text if needed
        await handleAudioToText(blob);
      };

      recorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Error accessing microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      audioStream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const handleAudioToText = async (audioBlob) => {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob);

      const response = await fetch('/api/audio-to-text', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to convert audio to text');

      const data = await response.json();
      // Create a new note with the transcribed text
      await createNote({
        title: 'Audio Note',
        content: data.text,
        type: 'audio',
        audioUrl: data.audioUrl,
      });
    } catch (error) {
      console.error('Error converting audio to text:', error);
      alert('Error converting audio to text. Please try again.');
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to upload file');

      const data = await response.json();
      await createNote({
        title: file.name,
        content: 'Uploaded file',
        type: 'image',
        imageUrl: data.url,
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading file. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const createNote = async (noteData) => {
    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(noteData),
      });

      if (!response.ok) throw new Error('Failed to create note');

      router.refresh();
    } catch (error) {
      console.error('Error creating note:', error);
      alert('Error creating note. Please try again.');
    }
  };

  return (
    <Dialog>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon">
            <Plus className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DialogTrigger asChild>
            <DropdownMenuItem>
              <Mic className="mr-2 h-4 w-4" />
              Record Audio
            </DropdownMenuItem>
          </DialogTrigger>
          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
            <label className="flex items-center cursor-pointer">
              <Upload className="mr-2 h-4 w-4" />
              Upload Photo
              <Input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
                disabled={isUploading}
              />
            </label>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <FileAudio className="mr-2 h-4 w-4" />
            Audio to Text
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record Audio</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center space-y-4">
          <Button
            variant={isRecording ? "destructive" : "default"}
            onClick={isRecording ? stopRecording : startRecording}
          >
            {isRecording ? 'Stop Recording' : 'Start Recording'}
          </Button>
          {audioFile && (
            <audio controls>
              <source src={URL.createObjectURL(audioFile)} type="audio/webm" />
              Your browser does not support the audio element.
            </audio>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
