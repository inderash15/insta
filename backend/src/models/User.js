import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      lowercase: true,
      trim: true,
      minlength: [3, 'Username must be at least 3 characters'],
      maxlength: [30, 'Username cannot exceed 30 characters'],
      match: [/^[a-zA-Z0-9._]+$/, 'Username can only contain letters, numbers, periods, and underscores']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email address']
    },
    passwordHash: {
      type: String,
      required: [true, 'Password hash is required'],
      select: false // Do not include in queries by default
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: [1, 'Full name cannot be empty'],
      maxlength: [60, 'Full name cannot exceed 60 characters']
    },
    bio: {
      type: String,
      default: '',
      maxlength: [150, 'Bio cannot exceed 150 characters'],
      trim: true
    },
    website: {
      type: String,
      default: '',
      maxlength: [200, 'Website cannot exceed 200 characters'],
      trim: true
    },
    avatarUrl: {
      type: String,
      default: ''
    },
    isPrivate: {
      type: Boolean,
      default: false
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    isBanned: {
      type: Boolean,
      default: false
    },
    role: {
      type: String,
      enum: ['user', 'moderator', 'admin'],
      default: 'user'
    },
    lastActiveAt: {
      type: Date,
      default: Date.now
    },
    counts: {
      posts: { type: Number, default: 0, min: 0 },
      followers: { type: Number, default: 0, min: 0 },
      following: { type: Number, default: 0, min: 0 }
    },
    blockedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    closeFriends: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    interests: [
      {
        type: String,
        lowercase: true,
        trim: true
      }
    ],
    hiddenCreators: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    preferences: {
      theme: { type: String, default: 'dark', enum: ['dark', 'light', 'system'] },
      notifications: {
        pauseAll: { type: Boolean, default: false },
        postsLikes: { type: Boolean, default: true },
        comments: { type: Boolean, default: true },
        follows: { type: Boolean, default: true },
        messages: { type: Boolean, default: true }
      },
      accessibility: {
        highContrast: { type: Boolean, default: false },
        reduceMotion: { type: Boolean, default: false },
        captions: { type: Boolean, default: true }
      },
      showActivityStatus: { type: Boolean, default: true },
      showReadReceipts: { type: Boolean, default: true },
      language: { type: String, default: 'en' }
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret.passwordHash;
        delete ret.__v;
        return ret;
      }
    },
    toObject: {
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret.passwordHash;
        delete ret.__v;
        return ret;
      }
    }
  }
);

// Method to verify candidate password
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.passwordHash) {
    throw new Error('passwordHash is required for comparison but was not selected');
  }
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

// Static helper to hash passwords with work factor 12
userSchema.statics.hashPassword = async function (plainPassword) {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(plainPassword, salt);
};

export const User = mongoose.model('User', userSchema);
