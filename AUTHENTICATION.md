# Authentication System

This project implements a complete authentication and profile management system using NextAuth.js with the following features:

## Features

### Authentication
- **Sign Up**: Users can create accounts with username, email, wallet address, password, and optional profile images
- **Sign In**: Email and password authentication
- **Sign Out**: Secure logout functionality
- **Session Management**: Persistent sessions with database storage

### Profile Management
- **Profile Images**: Users can upload profile pictures and banner images
- **Profile Editing**: Full profile editing with all fields
- **Real-time Updates**: Session updates when profile is modified

### UI Components
- **Profile Dropdown**: Hover dropdown in header showing different options based on auth status
- **Responsive Design**: Mobile-friendly authentication forms
- **Form Validation**: Client and server-side validation
- **File Upload**: Image upload with preview

## Database Schema

The User model includes:
- `id`: Unique identifier
- `username`: Unique username
- `email`: Unique email address
- `walletAddress`: Optional wallet address
- `password`: Hashed password
- `profileImage`: Optional profile image URL
- `profileBanner`: Optional banner image URL
- `membershipTier`: User's membership level
- `loyaltyPoints`: User's loyalty points
- `createdAt`: Account creation timestamp

## API Routes

### Authentication
- `POST /api/auth/signup`: User registration with file uploads
- `POST /api/auth/signin`: User login
- `GET/POST /api/auth/[...nextauth]`: NextAuth.js routes

### User Management
- `PUT /api/user/update`: Update user profile with file uploads
- `POST /api/user`: Create or get user by wallet address
- `GET /api/user`: Get user data

## File Structure

```
app/
├── auth/
│   ├── signin/page.tsx          # Sign in page
│   └── signup/page.tsx          # Sign up page
├── api/
│   ├── auth/
│   │   ├── [...nextauth]/route.js
│   │   └── signup/route.js
│   └── user/
│       ├── route.js
│       └── update/route.js
├── components/
│   ├── layout/
│   │   ├── header.jsx
│   │   └── profile-dropdown.jsx
│   └── profile/
│       ├── user-profile.jsx
│       └── EditProfileModal.jsx
└── context/
    └── Web3Context.jsx
```

## Usage

### For Unauthenticated Users
1. Click the profile button in the header
2. Choose "Sign Up" or "Sign In"
3. Fill out the required information
4. Upload optional profile images
5. Complete registration/login

### For Authenticated Users
1. Click the profile button to see user info
2. Choose "Edit Profile" to modify information
3. Upload new profile images
4. Save changes
5. Use "Sign Out" to logout

## Security Features

- Password hashing with bcrypt
- Session-based authentication
- File upload validation
- Unique constraint enforcement
- Input validation and sanitization

## Environment Variables

Required environment variables:
- `DATABASE_URL`: PostgreSQL connection string
- `NEXTAUTH_SECRET`: Secret for NextAuth.js
- `NEXTAUTH_URL`: Your application URL 