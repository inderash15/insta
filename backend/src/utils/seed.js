import { User } from '../models/User.js';
import { Post } from '../models/Post.js';
import { Story } from '../models/Story.js';
import { Reel } from '../models/Reel.js';
import { Follow } from '../models/Follow.js';

export const seedDatabaseIfEmpty = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log(`[Seed] Database already has ${userCount} users. Skipping seeding.`);
      return;
    }

    console.log('[Seed] Database is empty. Seeding demo accounts and content...');

    const defaultPasswordHash = await User.hashPassword('password123');

    // 1. Admin Account
    const admin = await User.create({
      username: 'admin',
      email: 'admin@insta.com',
      passwordHash: defaultPasswordHash,
      fullName: 'Insta Administrator',
      bio: 'Platform Governance & System Administrator 🛡️',
      role: 'admin',
      isVerified: true
    });

    // 2. Creator Account (Alex)
    const alex = await User.create({
      username: 'alex',
      email: 'alex@insta.com',
      passwordHash: defaultPasswordHash,
      fullName: 'Alex Rivers',
      bio: 'Visual artist & landscape photographer 📸 Wandering the globe #photography #wanderlust',
      website: 'https://alexrivers.photo',
      role: 'user',
      isVerified: true
    });

    // 3. Creator Account (Maya)
    const maya = await User.create({
      username: 'maya',
      email: 'maya@insta.com',
      passwordHash: defaultPasswordHash,
      fullName: 'Maya Patel',
      bio: 'UI/UX Designer & coffee explorer ☕ Tech, creativity & minimalist aesthetics #design #aesthetic',
      website: 'https://maya.design',
      role: 'user',
      isVerified: false
    });

    // 4. Social Graph (Mutual Follows)
    await Follow.create([
      { follower: alex._id, following: maya._id, status: 'accepted' },
      { follower: maya._id, following: alex._id, status: 'accepted' },
      { follower: admin._id, following: alex._id, status: 'accepted' },
      { follower: admin._id, following: maya._id, status: 'accepted' }
    ]);

    await User.findByIdAndUpdate(alex._id, { 'counts.followers': 2, 'counts.following': 1, 'counts.posts': 2 });
    await User.findByIdAndUpdate(maya._id, { 'counts.followers': 2, 'counts.following': 1, 'counts.posts': 1 });
    await User.findByIdAndUpdate(admin._id, { 'counts.following': 2 });

    // 5. Sample Posts with Unsplash royalty-free photos
    const post1 = await Post.create({
      author: alex._id,
      caption: 'Sunset hues over the coast 🌅 Nothing beats this golden hour serenity. #sunset #nature #travel',
      hashtags: ['sunset', 'nature', 'travel'],
      media: [
        {
          url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1080&auto=format&fit=crop&q=80',
          type: 'image'
        }
      ],
      likesCount: 12
    });

    const post2 = await Post.create({
      author: alex._id,
      caption: 'Urban geometry and modern architecture in the heart of downtown. #city #urban #architecture',
      hashtags: ['city', 'urban', 'architecture'],
      media: [
        {
          url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1080&auto=format&fit=crop&q=80',
          type: 'image'
        }
      ],
      likesCount: 8
    });

    const post3 = await Post.create({
      author: maya._id,
      caption: 'Workspace essentials for late night wireframing. Clean lines and warm light ✨ #design #workspace #minimal',
      hashtags: ['design', 'workspace', 'minimal'],
      media: [
        {
          url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1080&auto=format&fit=crop&q=80',
          type: 'image'
        }
      ],
      likesCount: 15
    });

    // 6. Sample Story
    await Story.create({
      author: alex._id,
      mediaUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1080&auto=format&fit=crop&q=80',
      mediaType: 'image',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    });


    // 7. Sample Reel
    await Reel.create({
      author: maya._id,
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      caption: 'Motion design study & kinetic typography exploration #motion #animation',
      hashtags: ['motion', 'animation'],
      audioTitle: 'Synthwave Dreams - Maya Patel',
      likesCount: 24,
      viewsCount: 142
    });

    console.log('[Seed] Demo accounts created successfully:');
    console.log('       - admin / password123 (Administrator)');
    console.log('       - alex  / password123 (Creator)');
    console.log('       - maya  / password123 (Designer)');
  } catch (err) {
    console.error('[Seed] Error seeding demo data:', err.message);
  }
};
