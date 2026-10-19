import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import app from '../src/app.js';
import { connectDB, disconnectDB } from '../src/config/db.js';
import { User } from '../src/models/User.js';
import { Post } from '../src/models/Post.js';
import { Comment } from '../src/models/Comment.js';
import { Like } from '../src/models/Like.js';
import { Bookmark } from '../src/models/Bookmark.js';
import { Follow } from '../src/models/Follow.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a small test dummy image
const testImagePath = path.join(__dirname, 'test-image.jpg');
if (!fs.existsSync(testImagePath)) {
  fs.writeFileSync(testImagePath, Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46]));
}

describe('Posts, Feed, Likes & Comments API Tests', () => {
  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    await connectDB();
  });

  afterAll(async () => {
    await disconnectDB();
    if (fs.existsSync(testImagePath)) {
      fs.unlinkSync(testImagePath);
    }
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Post.deleteMany({});
    await Comment.deleteMany({});
    await Like.deleteMany({});
    await Bookmark.deleteMany({});
    await Follow.deleteMany({});
  });

  const registerHelper = async (userData) => {
    const res = await request(app).post('/api/auth/register').send(userData);
    return {
      user: res.body.user,
      cookie: res.headers['set-cookie']
    };
  };

  it('1. Creates a post with uploaded media, hashtags, and mentions', async () => {
    const author = await registerHelper({
      username: 'creator',
      email: 'creator@example.com',
      password: 'password123',
      fullName: 'Creative Author'
    });

    const res = await request(app)
      .post('/api/posts')
      .set('Cookie', author.cookie)
      .field('caption', 'Exploring the city with @friend! #urban #photography')
      .attach('media', testImagePath);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.post.media.length).toBe(1);
    expect(res.body.post.caption).toContain('Exploring the city');
    expect(res.body.post.hashtags).toContain('urban');
    expect(res.body.post.hashtags).toContain('photography');
    expect(res.body.post.mentions).toContain('friend');

    // Confirm post count incremented
    const updatedAuthor = await User.findById(author.user._id);
    expect(updatedAuthor.counts.posts).toBe(1);
  });

  it('2. Home feed returns posts from followed accounts with isLiked and isBookmarked states', async () => {
    const userA = await registerHelper({
      username: 'alice',
      email: 'alice@example.com',
      password: 'password123',
      fullName: 'Alice Smith'
    });

    const userB = await registerHelper({
      username: 'bob',
      email: 'bob@example.com',
      password: 'password123',
      fullName: 'Bob Jones'
    });

    // Bob follows Alice
    await request(app).post(`/api/users/${userA.user._id}/follow`).set('Cookie', userB.cookie);

    // Alice creates a post
    const postRes = await request(app)
      .post('/api/posts')
      .set('Cookie', userA.cookie)
      .field('caption', 'Hello from Alice')
      .attach('media', testImagePath);
    const postId = postRes.body.post._id;

    // Bob likes Alice's post
    await request(app).post(`/api/posts/${postId}/like`).set('Cookie', userB.cookie);

    // Bob fetches feed
    const feedRes = await request(app)
      .get('/api/posts/feed')
      .set('Cookie', userB.cookie);

    expect(feedRes.status).toBe(200);
    expect(feedRes.body.posts.length).toBe(1);
    expect(feedRes.body.posts[0].caption).toBe('Hello from Alice');
    expect(feedRes.body.posts[0].isLiked).toBe(true);
    expect(feedRes.body.posts[0].isBookmarked).toBe(false);
  });

  it('3. Likes and unlikes a post with atomic likesCount synchronization', async () => {
    const userA = await registerHelper({
      username: 'alice',
      email: 'alice@example.com',
      password: 'password123',
      fullName: 'Alice Smith'
    });

    const postRes = await request(app)
      .post('/api/posts')
      .set('Cookie', userA.cookie)
      .field('caption', 'Test post')
      .attach('media', testImagePath);
    const postId = postRes.body.post._id;

    // Like
    const likeRes = await request(app)
      .post(`/api/posts/${postId}/like`)
      .set('Cookie', userA.cookie);
    expect(likeRes.status).toBe(200);
    expect(likeRes.body.liked).toBe(true);
    expect(likeRes.body.likesCount).toBe(1);

    // Unlike
    const unlikeRes = await request(app)
      .post(`/api/posts/${postId}/like`)
      .set('Cookie', userA.cookie);
    expect(unlikeRes.status).toBe(200);
    expect(unlikeRes.body.liked).toBe(false);
    expect(unlikeRes.body.likesCount).toBe(0);
  });

  it('4. Adds, fetches, and deletes comments with atomic commentsCount synchronization', async () => {
    const userA = await registerHelper({
      username: 'alice',
      email: 'alice@example.com',
      password: 'password123',
      fullName: 'Alice Smith'
    });

    const userB = await registerHelper({
      username: 'bob',
      email: 'bob@example.com',
      password: 'password123',
      fullName: 'Bob Jones'
    });

    const postRes = await request(app)
      .post('/api/posts')
      .set('Cookie', userA.cookie)
      .field('caption', 'Test post')
      .attach('media', testImagePath);
    const postId = postRes.body.post._id;

    // Bob comments on Alice's post
    const commentRes = await request(app)
      .post(`/api/posts/${postId}/comments`)
      .set('Cookie', userB.cookie)
      .send({ text: 'Incredible shot!' });

    expect(commentRes.status).toBe(201);
    expect(commentRes.body.comment.text).toBe('Incredible shot!');
    expect(commentRes.body.comment.author.username).toBe('bob');
    const commentId = commentRes.body.comment._id;

    // Check post comments count
    let post = await Post.findById(postId);
    expect(post.commentsCount).toBe(1);

    // Fetch comments
    const listRes = await request(app).get(`/api/posts/${postId}/comments`);
    expect(listRes.status).toBe(200);
    expect(listRes.body.comments.length).toBe(1);

    // Bob deletes comment
    const delRes = await request(app)
      .delete(`/api/posts/comments/${commentId}`)
      .set('Cookie', userB.cookie);
    expect(delRes.status).toBe(200);

    post = await Post.findById(postId);
    expect(post.commentsCount).toBe(0);
  });

  it('5. Bookmarks and retrieves saved posts', async () => {
    const userA = await registerHelper({
      username: 'alice',
      email: 'alice@example.com',
      password: 'password123',
      fullName: 'Alice Smith'
    });

    const postRes = await request(app)
      .post('/api/posts')
      .set('Cookie', userA.cookie)
      .field('caption', 'Recipe post')
      .attach('media', testImagePath);
    const postId = postRes.body.post._id;

    // Bookmark
    const bmRes = await request(app)
      .post(`/api/posts/${postId}/bookmark`)
      .set('Cookie', userA.cookie);
    expect(bmRes.status).toBe(200);
    expect(bmRes.body.bookmarked).toBe(true);

    // Fetch saved
    const savedRes = await request(app)
      .get('/api/posts/saved')
      .set('Cookie', userA.cookie);
    expect(savedRes.status).toBe(200);
    expect(savedRes.body.posts.length).toBe(1);
    expect(savedRes.body.posts[0]._id).toBe(postId);
  });

  it('6. Enforces privacy: non-followers cannot view posts of private accounts', async () => {
    const userA = await registerHelper({
      username: 'alice',
      email: 'alice@example.com',
      password: 'password123',
      fullName: 'Alice Smith'
    });
    await User.findByIdAndUpdate(userA.user._id, { isPrivate: true });

    const userB = await registerHelper({
      username: 'bob',
      email: 'bob@example.com',
      password: 'password123',
      fullName: 'Bob Jones'
    });

    const postRes = await request(app)
      .post('/api/posts')
      .set('Cookie', userA.cookie)
      .field('caption', 'Private diary')
      .attach('media', testImagePath);
    const postId = postRes.body.post._id;

    // Bob attempts to fetch private post without following
    const viewRes = await request(app)
      .get(`/api/posts/${postId}`)
      .set('Cookie', userB.cookie);

    expect(viewRes.status).toBe(403);
    expect(viewRes.body.message).toContain('private account');
  });

  it('7. Deletes a post, decrements count, and denies unauthorized deletion', async () => {
    const userA = await registerHelper({
      username: 'alice',
      email: 'alice@example.com',
      password: 'password123',
      fullName: 'Alice Smith'
    });

    const userB = await registerHelper({
      username: 'bob',
      email: 'bob@example.com',
      password: 'password123',
      fullName: 'Bob Jones'
    });

    const postRes = await request(app)
      .post('/api/posts')
      .set('Cookie', userA.cookie)
      .field('caption', 'Post to delete')
      .attach('media', testImagePath);
    const postId = postRes.body.post._id;

    // Bob attempts to delete Alice's post
    const unauthDel = await request(app)
      .delete(`/api/posts/${postId}`)
      .set('Cookie', userB.cookie);
    expect(unauthDel.status).toBe(403);

    // Alice deletes own post
    const authDel = await request(app)
      .delete(`/api/posts/${postId}`)
      .set('Cookie', userA.cookie);
    expect(authDel.status).toBe(200);

    const checkAuthor = await User.findById(userA.user._id);
    expect(checkAuthor.counts.posts).toBe(0);
  });
});
