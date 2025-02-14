import mongoose from 'mongoose';

const imageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  data: { type: String, required: true }
});

const noteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    default: '',
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  isFavorite: {
    type: Boolean,
    default: false,
  },
  images: [imageSchema],
  audio: {
    name: String,
    data: String,
    contentType: String,
  },
  transcriptionStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending',
  },
}, {
  timestamps: true,
});

// Add text indexes for search
noteSchema.index({ title: 'text', content: 'text' });

const Note = mongoose.models.Note || mongoose.model('Note', noteSchema);
export default Note;
