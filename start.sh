#!/bin/bash
cd frontend
npm install
npm run build
mv build ../static
cd ../backend
python app.py