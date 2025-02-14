import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { connectToDatabase } from '@/lib/db';
import { GridFSBucket, ObjectId } from 'mongodb';

// Create GridFS bucket
let bucket;
const connectToGridFS = async (db) => {
  if (!bucket) {
    bucket = new GridFSBucket(db, {
      bucketName: 'uploads'
    });
  }
  return bucket;
};

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { db } = await connectToDatabase();
    const gridFSBucket = await connectToGridFS(db);

    // Get fileId from params
    const fileId = params?.fileId;
    if (!fileId) {
      return NextResponse.json({ error: 'No file ID provided' }, { status: 400 });
    }

    const file = await gridFSBucket.find({ _id: new ObjectId(fileId) }).next();

    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Verify the file belongs to the user
    if (file.metadata?.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const downloadStream = gridFSBucket.openDownloadStream(new ObjectId(fileId));

    // Convert the stream to a buffer
    const chunks = [];
    for await (const chunk of downloadStream) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    // Return the file with appropriate headers
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': file.contentType,
        'Content-Disposition': `inline; filename="${file.filename}"`,
      },
    });
  } catch (error) {
    console.error('Error serving file:', error);
    return NextResponse.json(
      { error: 'Error serving file' },
      { status: 500 }
    );
  }
}
