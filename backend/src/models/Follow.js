import mongoose from 'mongoose';

const followSchema = new mongoose.Schema(
  {
    follower: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    following: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'accepted'],
      default: 'accepted'
    }
  },
  {
    timestamps: true
  }
);

// Enforce single relationship per pair
followSchema.index({ follower: 1, following: 1 }, { unique: true });
// Optimize queries for finding a user's followers or pending requests
followSchema.index({ following: 1, status: 1 });
followSchema.index({ follower: 1, status: 1 });

export const Follow = mongoose.model('Follow', followSchema);
