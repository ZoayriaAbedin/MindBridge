#!/bin/bash

# MindBridge Startup Script
# This script starts both backend and frontend servers

echo "🚀 Starting MindBridge Platform..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get the script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

trap cleanup EXIT INT TERM

# Start Backend
echo -e "${BLUE}Starting Backend Server...${NC}"
cd "$SCRIPT_DIR/backend"
npm start > ../backend.log 2>&1 &
BACKEND_PID=$!
echo -e "${GREEN}✓ Backend started (PID: $BACKEND_PID)${NC}"

# Wait for backend to be ready
echo "Waiting for backend to be ready..."
sleep 3

# Check if backend is running
if curl -s http://localhost:5001/health > /dev/null; then
    echo -e "${GREEN}✓ Backend is ready on http://localhost:5001${NC}"
else
    echo "⚠️  Backend may not be ready yet, continuing..."
fi

echo ""

# Start Frontend
echo -e "${BLUE}Starting Frontend Server...${NC}"
cd "$SCRIPT_DIR/frontend"
BROWSER=none npm start > ../frontend.log 2>&1 &
FRONTEND_PID=$!
echo -e "${GREEN}✓ Frontend started (PID: $FRONTEND_PID)${NC}"

echo ""
echo "=================================="
echo "🎉 MindBridge Platform is running!"
echo "=================================="
echo ""
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:5001"
echo "  API Docs: http://localhost:5001/api/v1"
echo ""
echo "View logs:"
echo "  Backend:  tail -f backend.log"
echo "  Frontend: tail -f frontend.log"
echo ""
echo "Press Ctrl+C to stop all servers"
echo ""

# Wait for processes
wait $BACKEND_PID $FRONTEND_PID
