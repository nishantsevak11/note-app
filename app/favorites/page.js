'use client';

import { useEffect, useState } from 'react';
import { Layout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import CreateNoteDialog from '@/components/create-note-dialog';
import { NoteCard } from '@/components/note-card';
import { NoteDetail } from '@/components/note-detail';
import { Search } from 'lucide-react';
import { toast } from 'sonner';

export default function FavoritesPage() {
  const [notes, setNotes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async (search = '') => {
    try {
      const response = await fetch(`/api/notes?favorites=true${search ? `&search=${search}` : ''}`);
      if (!response.ok) throw new Error('Failed to fetch notes');
      const data = await response.json();
      setNotes(data);
    } catch (error) {
      console.error('Error fetching notes:', error);
      toast.error('Failed to fetch notes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    fetchNotes(query);
  };

  const handleCreateNote = async (noteData) => {
    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(noteData),
      });

      if (!response.ok) throw new Error('Failed to create note');
      fetchNotes(searchQuery);
      setIsCreateDialogOpen(false);
      toast.success('Note created successfully');
    } catch (error) {
      console.error('Error creating note:', error);
      toast.error('Failed to create note');
    }
  };

  const handleUpdateNote = async (noteData) => {
    try {
      const response = await fetch(`/api/notes/${noteData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(noteData),
      });

      if (!response.ok) throw new Error('Failed to update note');
      fetchNotes(searchQuery);
      toast.success('Note updated successfully');
    } catch (error) {
      console.error('Error updating note:', error);
      toast.error('Failed to update note');
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!confirm('Are you sure you want to delete this note?')) return;

    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete note');
      fetchNotes(searchQuery);
      toast.success('Note deleted successfully');
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error('Failed to delete note');
    }
  };

  const handleToggleFavorite = async (note) => {
    try {
      const response = await fetch(`/api/notes/${note._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...note,
          isFavorite: !note.isFavorite,
        }),
      });

      if (!response.ok) throw new Error('Failed to update note');
      fetchNotes(searchQuery);
      toast.success(note.isFavorite ? 'Removed from favorites' : 'Added to favorites');
    } catch (error) {
      console.error('Error updating note:', error);
      toast.error('Failed to update note');
    }
  };

  if (isLoading) {
    return <Layout>
      <div className="flex justify-center items-center min-h-screen">Loading...</div>
    </Layout>;
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search favorite notes..."
            value={searchQuery}
            onChange={handleSearch}
            className="pl-10 bg-[#2D2D2D] border-none text-white"
          />
        </div>

        {/* Notes Grid */}
        <div className="grid gap-4">
          {notes.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              No favorite notes yet. Star a note to add it to your favorites!
            </div>
          ) : (
            notes.map((note) => (
              <NoteCard
                key={note._id}
                note={note}
                onEdit={() => {
                  setSelectedNote(note);
                  setIsDetailOpen(true);
                }}
                onDelete={handleDeleteNote}
                onFavorite={handleToggleFavorite}
              />
            ))
          )}
        </div>

        {/* Create Note Dialog */}
        <CreateNoteDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          onSave={handleCreateNote}
        />

        {/* Note Detail Dialog */}
        {selectedNote && (
          <NoteDetail
            note={selectedNote}
            open={isDetailOpen}
            onOpenChange={setIsDetailOpen}
            onUpdate={handleUpdateNote}
            onDelete={handleDeleteNote}
            onFavorite={handleToggleFavorite}
          />
        )}
      </div>
    </Layout>
  );
}
