import { User } from '../models/User.js';
import { generateToken, setAuthCookie, clearAuthCookie } from '../utils/token.js';
import { registerSchema, loginSchema } from '../validation/authValidation.js';

export const register = async (req, res, next) => {
  try {
    const validatedData = registerSchema.parse(req.body);

    const normalizedUsername = validatedData.username.toLowerCase().trim();
    const normalizedEmail = validatedData.email.toLowerCase().trim();

    // Check for existing username
    const existingUsername = await User.findOne({ username: normalizedUsername });
    if (existingUsername) {
      return res.status(409).json({
        success: false,
        message: 'Username is already taken',
        field: 'username'
      });
    }

    // Check for existing email
    const existingEmail = await User.findOne({ email: normalizedEmail });
    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists',
        field: 'email'
      });
    }

    // Securely hash password
    const passwordHash = await User.hashPassword(validatedData.password);

    // Create user with explicit unprivileged defaults
    const user = await User.create({
      username: normalizedUsername,
      email: normalizedEmail,
      passwordHash,
      fullName: validatedData.fullName.trim(),
      role: 'user', // Never accept admin/moderator roles from public registration
      isVerified: false,
      isPrivate: false
    });

    // Establish authenticated session
    const token = generateToken(user._id);
    setAuthCookie(res, token);

    return res.status(201).json({
      success: true,
      message: 'Account created successfully',
      user: user.toJSON()
    });
  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        message: err.errors[0]?.message || 'Validation error',
        errors: err.errors.map((e) => ({ field: e.path.join('.'), message: e.message }))
      });
    }
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const validatedData = loginSchema.parse(req.body);
    const identifier = validatedData.identifier.toLowerCase().trim();

    // Search by email or username
    const isEmail = identifier.includes('@');
    const query = isEmail ? { email: identifier } : { username: identifier };

    const user = await User.findOne(query).select('+passwordHash');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username/email or password'
      });
    }

    // Verify password securely
    const isPasswordValid = await user.comparePassword(validatedData.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username/email or password'
      });
    }

    // Establish authenticated session
    const token = generateToken(user._id);
    setAuthCookie(res, token);

    return res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      user: user.toJSON()
    });
  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        message: err.errors[0]?.message || 'Validation error',
        errors: err.errors.map((e) => ({ field: e.path.join('.'), message: e.message }))
      });
    }
    next(err);
  }
};

export const logout = (req, res) => {
  clearAuthCookie(res);
  return res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
};

export const getMe = (req, res) => {
  return res.status(200).json({
    success: true,
    user: req.user.toJSON()
  });
};

export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters long'
      });
    }

    const user = await User.findById(req.user._id).select('+passwordHash');
    const isCurrentValid = await user.comparePassword(currentPassword);

    if (!isCurrentValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    user.passwordHash = await User.hashPassword(newPassword);
    await user.save();

    // Re-issue fresh token
    const token = generateToken(user._id);
    setAuthCookie(res, token);

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (err) {
    next(err);
  }
};

export const deleteAccount = async (req, res, next) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required to confirm account deletion'
      });
    }

    const user = await User.findById(req.user._id).select('+passwordHash');
    const isValid = await user.comparePassword(password);

    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect password'
      });
    }

    await User.findByIdAndDelete(req.user._id);
    clearAuthCookie(res);

    return res.status(200).json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};

