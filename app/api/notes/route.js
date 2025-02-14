import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { Note } from '@/lib/models/note';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

// Connect to database
const connectDB = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      return;
    }
    await mongoose.connect(process.env.MONGODB_URI);
  } catch (error) {
    console.error('Database connection error:', error);
  }
};

// Create a new note
export async function POST(req) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();
    const note = await Note.create({
      ...data,
      user: session.user.id,
    });

    return NextResponse.json(note);
  } catch (error) {
    console.error('Error creating note:', error);
    return NextResponse.json(
      { error: 'Error creating note' },
      { status: 500 }
    );
  }
}

// Get all notes for the current user
export async function GET(req) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');
    const favorites = searchParams.get('favorites') === 'true';
    const sort = { createdAt: -1 }; // Default sort by newest first

    let query = { user: session.user.id };

    // Add favorites filter if requested
    if (favorites) {
      query.isFavorite = true;
    }

    // Add text search if search parameter is provided
    if (search) {
      query.$text = { $search: search };
      sort.score = { $meta: 'textScore' }; // Sort by text match score when searching
    }

    const notes = await Note.find(query)
      .sort(sort)
      .lean()
      .exec();

    return NextResponse.json(notes);
  } catch (error) {
    console.error('Error fetching notes:', error);
    return NextResponse.json(
      { error: 'Error fetching notes' },
      { status: 500 }
    );
  }
}

// Update a note
export async function PUT(req) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();
    const { id, ...updateData } = data;

    const note = await Note.findOneAndUpdate(
      { _id: id, user: session.user.id },
      updateData,
      { new: true }
    );

    if (!note) {
      return NextResponse.json(
        { error: 'Note not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(note);
  } catch (error) {
    console.error('Error updating note:', error);
    return NextResponse.json(
      { error: 'Error updating note' },
      { status: 500 }
    );
  }
}

// Delete a note
export async function DELETE(req) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Note ID is required' },
        { status: 400 }
      );
    }

    const note = await Note.findOneAndDelete({
      _id: id,
      user: session.user.id,
    });

    if (!note) {
      return NextResponse.json(
        { error: 'Note not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting note:', error);
    return NextResponse.json(
      { error: 'Error deleting note' },
      { status: 500 }
    );
  }
}
