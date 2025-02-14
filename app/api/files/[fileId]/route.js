import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
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

export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const fileId = params.fileId;
    if (!fileId) {
      return NextResponse.json({ error: 'No file ID provided' }, { status: 400 });
    }

    // Connect to GridFS
    const gridFSBucket = await connectToGridFS();

    // Find file info
    const files = await mongoose.connection.db
      .collection('uploads.files')
      .find({ _id: new mongoose.Types.ObjectId(fileId) })
      .toArray();

    if (!files.length) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const file = files[0];

    // Create download stream
    const downloadStream = gridFSBucket.openDownloadStream(new mongoose.Types.ObjectId(fileId));

    // Convert stream to buffer
    const chunks = [];
    for await (const chunk of downloadStream) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    // Create response with appropriate headers
    const response = new NextResponse(buffer);
    response.headers.set('Content-Type', file.contentType);
    response.headers.set('Content-Disposition', `inline; filename="${file.filename}"`);
    
    return response;
  } catch (error) {
    console.error('Error serving file:', error);
    return NextResponse.json(
      { error: 'Error serving file: ' + error.message },
      { status: 500 }
    );
  }
}
