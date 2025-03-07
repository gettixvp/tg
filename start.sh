#!/bin/bash
echo "Installing Python dependencies..."
python3 -m pip install -r requirements.txt || { echo "Failed to install Python dependencies"; exit 1; }

echo "Changing to frontend directory..."
cd frontend || { echo "Frontend directory not found"; exit 1; }

echo "Installing npm dependencies..."
npm install || { echo "Failed to install npm dependencies"; exit 1; }

echo "Building React app..."
npm run build || { echo "Build failed"; exit 1; }

echo "Listing build contents..."
ls -la build

echo "Moving build to static..."
# Удаляем старую папку static/build, если она существует, и перемещаем новую
rm -rf ../static/build
mv build ../static || { echo "Failed to move build to static"; exit 1; }

echo "Changing to backend directory..."
cd ../backend || { echo "Backend directory not found"; exit 1; }

echo "Starting app.py..."
python3 app.py || { echo "Failed to start app.py"; exit 1; }
