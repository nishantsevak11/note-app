import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/db';

// Create GridFS bucket
let bucket;
const connectToGridFS = async () => {
  if (!bucket) {
    await connectToDatabase();
    bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: 'uploads'
    });
  }
  return bucket;
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    const validTypes = [
      'image/jpeg', 
      'image/png', 
      'image/gif', 
      'image/webp',
      // Audio
      'audio/webm',
      'audio/wav',
      'audio/mp3',
      'audio/mpeg'
    ];

    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: `Invalid file type: ${file.type}. Supported types: ${validTypes.join(', ')}` 
      }, { status: 400 });
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds 5MB limit' },
        { status: 400 }
      );
    }

    // Convert file to Base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64String = buffer.toString('base64');
    const dataUrl = `data:${file.type};base64,${base64String}`;

    // Get file buffer
    // const buffer = Buffer.from(await file.arrayBuffer());
    
    // Connect to GridFS
    const gridFSBucket = await connectToGridFS();

    // Generate unique filename
    const filename = `${Date.now()}-${file.name}`;

    // Create upload stream
    const uploadStream = gridFSBucket.openUploadStream(filename, {
      contentType: file.type,
      metadata: {
        userId: session.user.id,
        originalName: file.name
      }
    });

    // Upload file
    await new Promise((resolve, reject) => {
      uploadStream.end(buffer, (error) => {
        if (error) reject(error);
        else resolve();
      });
    });

    // Return the file ID for later retrieval
    const fileId = uploadStream.id.toString();

    // Determine the type of file
    const isAudio = file.type.startsWith('audio/');
    const type = isAudio ? 'audio' : 'image';

    return NextResponse.json({ 
      fileId,
      message: 'File uploaded successfully',
      type,
      name: file.name,
      data: dataUrl,
      contentType: file.type
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Error uploading file: ' + error.message },
      { status: 500 }
    );
  }
}
