'use client';

import { useState } from 'react';
import CreateNoteDialog from '@/components/create-note-dialog';
import { NoteCard } from '@/components/note-card';
import { NoteDetail } from '@/components/note-detail';
import { Sidebar } from '@/components/sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus } from 'lucide-react';
import { toast } from 'sonner';
import useSWR from 'swr';

const fetcher = (...args) => fetch(...args).then(res => {
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
});

export default function NotesPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  // Use SWR for data fetching with optimistic updates
  const { data: notes = [], error, mutate } = useSWR(
    `/api/notes${activeFilter === 'favorites' ? '?favorites=true' : ''}`,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
      onError: (err) => {
        console.error('Error fetching notes:', err);
        toast.error('Failed to load notes');
      },
    }
  );

  const handleCreateNote = async (noteData) => {
    try {
      // Optimistically add the new note to the cache
      const optimisticNote = {
        _id: Date.now().toString(),
        ...noteData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await mutate([optimisticNote, ...notes], false);

      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(noteData),
      });

      if (!response.ok) throw new Error('Failed to create note');

      const newNote = await response.json();
      await mutate();
      setIsCreateDialogOpen(false);
      toast.success('Note created successfully');
    } catch (error) {
      console.error('Error creating note:', error);
      toast.error('Failed to create note');
      // Revert the optimistic update
      await mutate();
    }
  };

  const handleUpdateNote = async (updatedNote) => {
    const previousNotes = notes;
    
    try {
      // Optimistically update the cache
      await mutate(
        notes.map(note => note._id === updatedNote._id ? {
          ...note,
          ...updatedNote,
          updatedAt: new Date().toISOString(),
        } : note),
        false
      );

      const response = await fetch(`/api/notes/${updatedNote._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedNote),
      });

      if (!response.ok) throw new Error('Failed to update note');

      await mutate();
      setIsDetailOpen(false);
      toast.success('Note updated successfully');
    } catch (error) {
      console.error('Error updating note:', error);
      toast.error('Failed to update note');
      // Revert the optimistic update
      await mutate(previousNotes, false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    const previousNotes = notes;
    
    try {
      // Optimistically update the cache
      await mutate(
        notes.filter(note => note._id !== noteId),
        false
      );

      const response = await fetch(`/api/notes/${noteId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete note');

      toast.success('Note deleted successfully');
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error('Failed to delete note');
      // Revert the optimistic update
      await mutate(previousNotes, false);
    }
  };

  const handleFavorite = async (note) => {
    try {
      // Optimistically update the cache
      const updatedNotes = notes.map(n => 
        n._id === note._id ? { ...n, isFavorite: !n.isFavorite } : n
      );
      await mutate(updatedNotes, false);

      const response = await fetch(`/api/notes/${note._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isFavorite: !note.isFavorite,
        }),
      });

      if (!response.ok) throw new Error('Failed to update note');

      await mutate(); // Revalidate to ensure we have the latest data
      toast.success(`Note ${!note.isFavorite ? 'added to' : 'removed from'} favorites`);
    } catch (error) {
      console.error('Error updating favorite status:', error);
      toast.error('Failed to update favorite status');
      await mutate(); // Revert optimistic update
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-[#1E1E1E] text-white overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        noteCount={notes.length}
        favoriteCount={notes.filter(note => note.isFavorite).length}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">
              {activeFilter === 'favorites' ? 'Favorite Notes' : 'All Notes'}
            </h1>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New Note
            </Button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={handleSearch}
              className="pl-10 bg-[#2D2D2D] border-gray-700"
            />
          </div>
        </div>

        {/* Notes Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
          </div>
        </div>
      </div>

      {/* Create Note Dialog */}
      <CreateNoteDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={handleCreateNote}
      />

      {/* Note Detail Dialog */}
      {selectedNote && (
        <NoteDetail
          note={selectedNote}
          open={isDetailOpen}
          onOpenChange={setIsDetailOpen}
          onUpdate={handleUpdateNote}
          onDelete={handleDeleteNote}
        />
      )}
    </div>
  );
}
