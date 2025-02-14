import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import Note from '@/lib/models/note';
import dbConnect from '@/lib/dbConnect';

export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const note = await Note.findById(params.noteId);

    if (!note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    if (note.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(note);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const data = await req.json();
    const note = await Note.findById(params.noteId);

    if (!note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    if (note.userId.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Prepare update data
    const updateData = {
      ...data,
      updatedAt: new Date()
    };

    // If images are present in the update, ensure they have all required fields
    if (updateData.images) {
      if (!Array.isArray(updateData.images)) {
        return NextResponse.json({ error: 'Images must be an array' }, { status: 400 });
      }
      
      // Validate each image
      updateData.images = updateData.images.map(image => ({
        name: image.name || 'Untitled',
        type: image.type || 'image/jpeg', // Provide default type if missing
        data: image.data
      }));
    }

    // Update the note with validation
    const updatedNote = await Note.findByIdAndUpdate(
      params.noteId,
      updateData,
      { 
        new: true,
        runValidators: true,
        // Only update fields that are present in the request
        omitUndefined: true 
      }
    );

    return NextResponse.json(updatedNote);
  } catch (error) {
    console.error('Error updating note:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { noteId } = params;

    // Find note and verify ownership
    const note = await Note.findById(noteId);
    if (!note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    if (note.userId.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await Note.findByIdAndDelete(noteId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting note:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const data = await req.json();
    const note = await Note.findById(params.noteId);

    if (!note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    if (note.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const updatedNote = await Note.findByIdAndUpdate(
      params.noteId,
      { ...data },
      { new: true, runValidators: true }
    );

    return NextResponse.json(updatedNote);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
