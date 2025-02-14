import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    select: false, // Don't include password by default in queries
  },
}, {
  timestamps: true,
});

// Ensure password is never returned in JSON
userSchema.set('toJSON', {
  transform: function(doc, ret) {
    delete ret.password;
    return ret;
  }
});

// Handle cases where the model might have already been compiled
export default mongoose.models.NoteUser || mongoose.model('NoteUser', userSchema);
