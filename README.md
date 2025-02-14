# Note Taking Application

A modern note-taking application built with Next.js, MongoDB, and NextAuth.js.

## Running on CodeSandbox

1. **Fork the Repository**
   - Go to CodeSandbox
   - Click "Create Sandbox"
   - Choose "Import Project"
   - Paste your GitHub repository URL

2. **Environment Variables**
   Add these environment variables in CodeSandbox:
   ```
   MONGODB_URI=your_mongodb_uri
   NEXTAUTH_SECRET=your_secret_key
   NEXTAUTH_URL=https://your-sandbox-url.csb.app
   ```

3. **MongoDB Setup**
   - Create a free MongoDB Atlas cluster
   - Add `0.0.0.0/0` to IP whitelist in MongoDB Atlas
   - Copy your connection string and add it to environment variables

4. **Start the Application**
   The application will automatically start in development mode.

## Features

- User Authentication
- Create, Edit, Delete Notes
- Image Upload Support
- Real-time Search
- Sort Notes by Different Criteria
- Responsive Design

## Tech Stack

- Next.js 14
- MongoDB with Mongoose
- NextAuth.js for Authentication
- Tailwind CSS for Styling
- SWR for Data Fetching

## Common Issues & Solutions

1. **MongoDB Connection Issues**
   - Verify MongoDB URI is correct
   - Check IP whitelist in MongoDB Atlas
   - Ensure environment variables are set correctly

2. **Authentication Issues**
   - Make sure NEXTAUTH_URL matches your sandbox URL
   - Verify NEXTAUTH_SECRET is set
   - Check MongoDB connection

3. **Image Upload Issues**
   - Check if images are within size limits
   - Verify file types are supported

## Need Help?

If you encounter any issues:
1. Check the console for error messages
2. Verify all environment variables are set
3. Ensure MongoDB connection is working
4. Check if all dependencies are installed correctly
