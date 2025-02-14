import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title for this note'],
    maxlength: [60, 'Title cannot be more than 60 characters'],
  },
  content: {
    type: String,
    required: [true, 'Please provide the content for this note'],
  },
  images: [{
    name: String,
    data: String, // Base64 encoded image data
    contentType: String
  }],
  audio: {
    name: String,
    data: String, // Base64 encoded audio data
    contentType: String,
    duration: Number, // Duration in seconds
  },
  transcription: {
    text: String,
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending'
    },
    error: String,
  },
  userId: {
    type: String,
    required: [true, 'User ID is required'],
  },
  isFavorite: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Add text index for search
noteSchema.index({ title: 'text', content: 'text' });

const Note = mongoose.models.Note || mongoose.model('Note', noteSchema);
export default Note;
