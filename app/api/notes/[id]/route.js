import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { Note } from '@/lib/models/note';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

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

export async function PUT(request, context) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = context.params;
    const data = await request.json();
    
    const note = await Note.findOneAndUpdate(
      { _id: id, user: session.user.id },
      data,
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

export async function DELETE(request, context) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = context.params;
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

export async function GET(request, context) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = context.params;
    const note = await Note.findOne({
      _id: id,
      user: session.user.id,
    }).lean();

    if (!note) {
      return NextResponse.json(
        { error: 'Note not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(note);
  } catch (error) {
    console.error('Error fetching note:', error);
    return NextResponse.json(
      { error: 'Error fetching note' },
      { status: 500 }
    );
  }
}
