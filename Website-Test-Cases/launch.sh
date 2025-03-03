#!/bin/bash

# Print ASCII art title
echo "==============================================="
echo "   _____                 _                     "
echo "  |  _  |___ ___ ___ ___| |_ ___ ___ _ _      "
echo "  |     |  _| . | . |   | '_| -_|  _| | |     "
echo "  |__|__|_| |___|___|_|_|_,_|___|_| |_  |     "
echo "    |_____|_   _|_  |                 |___|   "
echo "           | | |  _|_____ ___ ___             "
echo "           |_| |___|     |_ -| -_|            "
echo "               |___|_|_|_|___|___|            "
echo "==============================================="
echo " Adventure Journey - Fantasy Character Creator "
echo "==============================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "Error: npm is not installed. Please install npm first."
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Create background image directories if they don't exist
if [ ! -d "public/images/backgrounds" ]; then
    echo "Creating background image directories..."
    mkdir -p public/images/backgrounds
fi

# Check if default background image exists, if not create a placeholder
if [ ! -f "public/images/backgrounds/default.jpg" ]; then
    echo "Using online fallback for background images..."
fi

# Start the development server
echo "Starting the application..."
echo "The app will be available at http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop the server"
echo "==============================================="
npm run dev 