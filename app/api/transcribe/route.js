import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import Note from '@/lib/models/note';
import dbConnect from '@/lib/dbConnect';

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB
const ALLOWED_AUDIO_TYPES = [
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/x-wav',
  'audio/ogg',
  'audio/webm',
];

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file');
    const title = formData.get('title') || 'Untitled Transcription';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!ALLOWED_AUDIO_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Only audio files are allowed.' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File size too large. Maximum size is 25MB.' }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const base64String = Buffer.from(buffer).toString('base64');
    const dataUrl = `data:${file.type};base64,${base64String}`;

    await dbConnect();

    // Create a new note with pending transcription
    const note = await Note.create({
      title,
      content: 'Transcription in progress...',
      userId: session.user.id,
      audio: {
        name: file.name,
        data: dataUrl,
        contentType: file.type,
        duration: 0, // Will be updated after processing
      },
      transcription: {
        status: 'pending',
      },
    });

    // Start transcription process (this would typically be handled by a background job)
    // For now, we'll simulate a delay and return some placeholder text
    setTimeout(async () => {
      try {
        const transcribedText = "This is a simulated transcription. In a real implementation, we would use a service like OpenAI Whisper API or Google Speech-to-Text to transcribe the audio.";
        
        await Note.findByIdAndUpdate(note._id, {
          content: transcribedText,
          'transcription.text': transcribedText,
          'transcription.status': 'completed',
        });
      } catch (error) {
        await Note.findByIdAndUpdate(note._id, {
          'transcription.status': 'failed',
          'transcription.error': error.message,
        });
      }
    }, 2000);

    return NextResponse.json({ 
      message: 'Audio file uploaded successfully. Transcription in progress.',
      noteId: note._id,
    });

  } catch (error) {
    console.error('Error processing audio file:', error);
    return NextResponse.json({ error: 'Error processing audio file' }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const noteId = searchParams.get('noteId');

    if (!noteId) {
      return NextResponse.json({ error: 'Note ID is required' }, { status: 400 });
    }

    await dbConnect();
    const note = await Note.findById(noteId);

    if (!note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    if (note.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({
      status: note.transcription.status,
      text: note.transcription.text,
      error: note.transcription.error,
    });

  } catch (error) {
    console.error('Error checking transcription status:', error);
    return NextResponse.json({ error: 'Error checking transcription status' }, { status: 500 });
  }
}
