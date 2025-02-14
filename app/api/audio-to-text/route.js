import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { writeFile } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const audioFile = formData.get('audio');

    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    await writeFile(path.join(uploadsDir, 'placeholder'), ''); // This will create the directory if it doesn't exist

    // Save the audio file
    const buffer = Buffer.from(await audioFile.arrayBuffer());
    const filename = `${uuidv4()}.webm`;
    const filePath = path.join(uploadsDir, filename);
    await writeFile(filePath, buffer);

    // Here you would typically send the audio to a speech-to-text service
    // For now, we'll return a placeholder text
    const text = "Audio transcription will be implemented with a speech-to-text service";
    const audioUrl = `/uploads/${filename}`;

    return NextResponse.json({ 
      text,
      audioUrl,
      message: 'Audio processed successfully' 
    });
  } catch (error) {
    console.error('Error processing audio:', error);
    return NextResponse.json(
      { error: 'Error processing audio file' },
      { status: 500 }
    );
  }
}
