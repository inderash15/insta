import mongoose from 'mongoose';

const highlightSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    title: {
      type: String,
      required: [true, 'Highlight title is required'],
      trim: true,
      maxlength: [30, 'Title cannot exceed 30 characters']
    },
    coverUrl: {
      type: String,
      default: ''
    },
    stories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Story'
      }
    ]
  },
  {
    timestamps: true
  }
);

highlightSchema.index({ user: 1, createdAt: -1 });

export const Highlight = mongoose.model('Highlight', highlightSchema);
