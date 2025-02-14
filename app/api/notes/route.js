import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import Note from '@/lib/models/note';
import dbConnect from '@/lib/dbConnect';

// Create a new note
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const data = await req.json();

    // Validate images
    if (data.images) {
      if (!Array.isArray(data.images)) {
        return NextResponse.json({ error: 'Images must be an array' }, { status: 400 });
      }
      if (data.images.length > 10) {
        return NextResponse.json({ error: 'Maximum 10 images allowed' }, { status: 400 });
      }
      // Validate each image
      for (const image of data.images) {
        if (!image.name || !image.data || !image.type) {
          return NextResponse.json({ error: 'Invalid image format' }, { status: 400 });
        }
        // Validate base64 image size (roughly)
        const sizeInMB = (image.data.length * 0.75) / 1024 / 1024; // Convert base64 to approximate MB
        if (sizeInMB > 5) {
          return NextResponse.json({ error: `Image ${image.name} exceeds 5MB limit` }, { status: 400 });
        }
      }
    }

    const note = await Note.create({
      ...data,
      userId: session.user.id,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return NextResponse.json(note);
  } catch (error) {
    console.error('Error creating note:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Get all notes for the current user
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');
    const favorites = searchParams.get('favorites') === 'true';

    let query = { userId: session.user.id };

    if (favorites) {
      query.isFavorite = true;
    }

    if (search) {
      query.$text = { $search: search };
    }

    const notes = await Note.find(query).sort({ createdAt: -1 });
    return NextResponse.json(notes);
  } catch (error) {
    console.error('Error fetching notes:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const data = await req.json();
    const note = await Note.findById(data._id);

    if (!note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    if (note.userId.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validate images if present
    if (data.images) {
      if (!Array.isArray(data.images)) {
        return NextResponse.json({ error: 'Images must be an array' }, { status: 400 });
      }
      if (data.images.length > 10) {
        return NextResponse.json({ error: 'Maximum 10 images allowed' }, { status: 400 });
      }
      // Validate each image
      for (const image of data.images) {
        if (!image.name || !image.data || !image.type) {
          return NextResponse.json({ error: 'Invalid image format' }, { status: 400 });
        }
        // Validate base64 image size (roughly)
        const sizeInMB = (image.data.length * 0.75) / 1024 / 1024;
        if (sizeInMB > 5) {
          return NextResponse.json({ error: `Image ${image.name} exceeds 5MB limit` }, { status: 400 });
        }
      }
    }

    const updatedNote = await Note.findByIdAndUpdate(
      data._id,
      { ...data, updatedAt: new Date() },
      { new: true }
    );

    return NextResponse.json(updatedNote);
  } catch (error) {
    console.error('Error updating note:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
