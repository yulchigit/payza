#!/bin/bash

# Vercel Deployment Script for PayZa
# Run this script to deploy to Vercel

echo "🚀 Starting Vercel deployment for PayZa..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Check if logged in
if ! vercel whoami &> /dev/null; then
    echo "❌ Not logged in to Vercel. Please run: vercel login"
    exit 1
fi

# Build the project
echo "🔨 Building project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix errors and try again."
    exit 1
fi

# Deploy to Vercel
echo "📦 Deploying to Vercel..."
vercel --prod

if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
    echo "🌐 Your app should be live at the URL shown above"
    echo ""
    echo "📋 Next steps:"
    echo "1. Copy the Vercel URL"
    echo "2. Add it to Render CORS_ORIGINS:"
    echo "   CORS_ORIGINS=https://your-vercel-url.vercel.app"
    echo "3. Test the app in browser"
else
    echo "❌ Deployment failed. Check the errors above."
    exit 1
fi