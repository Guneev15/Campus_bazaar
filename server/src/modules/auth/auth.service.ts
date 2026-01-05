import pool from '../../config/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sendOTPEmail } from './email.service';

interface CreateUserDto {
  email: string;
  name: string; // Added name field
  password: string;
  college_id: string; // This can be null/optional handled by logic
  role?: 'STUDENT' | 'SELLER' | 'ADMIN';
}

// Helper to generate OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

export const registerUser = async (userData: CreateUserDto) => {
  const { email, name, password, college_id, role = 'STUDENT' } = userData;

  // Domain Validation (Enforced: @thapar.edu only)
  if (!email.endsWith('@thapar.edu')) {
      throw new Error('Invalid email domain. Please use your @thapar.edu email.');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const otp = generateOTP();
  
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Check if user exists
    const userCheck = await client.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userCheck.rows.length > 0) {
        throw new Error('User already exists');
    }

    // Create User (Unverified) - Now storing NAME
    const query = `
      INSERT INTO users (email, name, password_hash, role, college_id, is_verified)
      VALUES ($1, $2, $3, $4, $5, FALSE)
      RETURNING id, email, name, role, is_verified;
    `;
    const values = [email, name, hashedPassword, role, college_id || null];
    const result = await client.query(query, values);
    
    // Store OTP
    await client.query(
        'INSERT INTO otp_codes (email, otp, expires_at) VALUES ($1, $2, NOW() + INTERVAL \'10 minutes\')',
        [email, otp]
    );

    // Send Real OTP Email (Non-blocking)
    // We do NOT await this, so the UI doesn't hang if SMTP is slow/blocked.
    sendOTPEmail(email, otp).catch(err => console.error("Background Email Warning:", err));

    await client.query('COMMIT');
    return { ...result.rows[0], message: 'OTP sent to email' };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

export const verifyOTP = async (email: string, otp: string) => {
    const client = await pool.connect();
    try {
        const result = await client.query(
            'SELECT * FROM otp_codes WHERE email = $1 AND otp = $2 AND expires_at > NOW()',
            [email, otp]
        );

        if (result.rows.length === 0) {
            throw new Error('Invalid or expired OTP');
        }

        // Mark user as verified
        await client.query('UPDATE users SET is_verified = TRUE WHERE email = $1', [email]);
        
        // Clean up used OTP (optional, or mark as used)
        await client.query('DELETE FROM otp_codes WHERE email = $1', [email]);

        return { message: 'Email verified successfully' };
    } finally {
        client.release();
    }
};

export const loginUser = async (email: string, password: string) => {
    const client = await pool.connect();
    try {
        const query = 'SELECT * FROM users WHERE email = $1';
        const result = await client.query(query, [email]);
        
        if (result.rows.length === 0) {
            throw new Error('User not found');
        }

        const user = result.rows[0];
        
        // Check Verification
        if (!user.is_verified) {
             throw new Error('Email not verified. Please verify your email.');
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        
        if (!isMatch) {
            throw new Error('Invalid credentials');
        }

        const token = jwt.sign(
            { id: user.id, role: user.role, college_id: user.college_id },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '1d' }
        );

        // Return Name as well
        return { 
            token, 
            user: { 
                id: user.id, 
                email: user.email, 
                name: user.name, // Include Name
                role: user.role 
            } 
        };
    } finally {
        client.release();
    }
};
