'use client';

import { useState, useEffect } from 'react';
import { CreateNoteDialog } from '@/components/create-note-dialog';
import { NoteCard } from '@/components/note-card';
import { NoteDetail } from '@/components/note-detail';
import { RecordingBar } from '@/components/recording-bar';
import { Sidebar } from '@/components/sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function NotesPage() {
  const [notes, setNotes] = useState([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    fetchNotes();
  }, [activeFilter]);

  const fetchNotes = async () => {
    try {
      const url = new URL('/api/notes', window.location.origin);
      if (activeFilter === 'favorites') {
        url.searchParams.append('favorites', 'true');
      }
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch notes');
      const data = await response.json();
      setNotes(data);
    } catch (error) {
      console.error('Error fetching notes:', error);
      toast.error('Failed to load notes');
    }
  };

  const handleCreateNote = async (note) => {
    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(note),
      });

      if (!response.ok) throw new Error('Failed to create note');

      const newNote = await response.json();
      setNotes(prev => [newNote, ...prev]);
      setIsCreateDialogOpen(false);
      toast.success('Note created successfully');
    } catch (error) {
      console.error('Error creating note:', error);
      toast.error('Failed to create note');
    }
  };

  const handleUpdateNote = async (updatedNote) => {
    try {
      const response = await fetch(`/api/notes/${updatedNote._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedNote),
      });

      if (!response.ok) throw new Error('Failed to update note');

      const data = await response.json();
      setNotes(prev => prev.map(note => 
        note._id === data._id ? data : note
      ));
      setIsDetailOpen(false);
      toast.success('Note updated successfully');
    } catch (error) {
      console.error('Error updating note:', error);
      toast.error('Failed to update note');
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete note');

      setNotes(prev => prev.filter(note => note._id !== noteId));
      setSelectedNote(null);
      setIsDetailOpen(false);
      toast.success('Note deleted successfully');
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error('Failed to delete note');
    }
  };

  const handleFavorite = async (note) => {
    try {
      const updatedNote = { ...note, isFavorite: !note.isFavorite };
      const response = await fetch(`/api/notes/${note._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedNote),
      });

      if (!response.ok) throw new Error('Failed to update note');

      const data = await response.json();
      setNotes(prev => prev.map(n => 
        n._id === data._id ? data : n
      ));
    } catch (error) {
      console.error('Error updating note:', error);
      toast.error('Failed to update note');
    }
  };

  const handleImageUpload = async (file) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to upload image');

      const data = await response.json();
      handleCreateNote({
        type: 'image',
        title: file.name,
        content: '',
        imageUrl: data.url,
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    }
  };

  const filteredNotes = notes.filter(note => {
    const query = searchQuery.toLowerCase();
    return (
      note.title.toLowerCase().includes(query) ||
      note.content.toLowerCase().includes(query)
    );
  });

  return (
    <div className="flex h-screen bg-[#1E1E1E] text-white overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full min-w-0">
        {/* Header */}
        <div className="sticky top-0 bg-[#1E1E1E] border-b border-gray-700 z-10">
          <div className="max-w-4xl mx-auto w-full px-4 md:px-8 py-4">
            <div className="flex items-center gap-4 md:ml-0 ml-12">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 bg-[#2D2D2D] border-gray-700"
                />
              </div>
              <Button
                onClick={() => setIsCreateDialogOpen(true)}
                className="bg-purple-600 hover:bg-purple-700 whitespace-nowrap"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Note
              </Button>
            </div>
          </div>
        </div>

        {/* Notes Grid */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto w-full px-4 md:px-8 py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredNotes.map(note => (
                <NoteCard
                  key={note._id}
                  note={note}
                  onClick={() => {
                    setSelectedNote(note);
                    setIsDetailOpen(true);
                  }}
                  onDelete={handleDeleteNote}
                  onFavorite={handleFavorite}
                />
              ))}
              {filteredNotes.length === 0 && (
                <div className="col-span-2 text-center py-8 text-gray-400">
                  {activeFilter === 'favorites' 
                    ? "No favorite notes yet. Star some notes to see them here!"
                    : searchQuery 
                      ? "No notes found matching your search."
                      : "No notes yet. Create one to get started!"
                  }
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recording Bar */}
        <RecordingBar
          onRecordingComplete={handleCreateNote}
          onImageUpload={handleImageUpload}
        />
      </div>

      {/* Dialogs */}
      <CreateNoteDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={handleCreateNote}
      />

      <NoteDetail
        note={selectedNote}
        open={isDetailOpen}
        onOpenChange={(open) => {
          setIsDetailOpen(open);
          if (!open) setSelectedNote(null);
        }}
        onUpdate={handleUpdateNote}
        onDelete={handleDeleteNote}
      />
    </div>
  );
}
