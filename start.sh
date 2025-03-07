#!/bin/bash
echo "Installing Python dependencies..."
/c/Users/Mikhalchyk/AppData/Local/Programs/Python/Python313/python.exe -m pip install -r requirements.txt
echo "Changing to frontend directory..."
cd frontend
echo "Installing npm dependencies..."
npm install
echo "Building React app..."
npm run build || { echo "Build failed"; exit 1; }
echo "Listing build contents..."
ls -la build
echo "Moving build to static..."
mv build ../static
echo "Changing to backend directory..."
cd ../backend
echo "Starting app.py..."
/c/Users/Mikhalchyk/AppData/Local/Programs/Python/Python313/python.exe app.py