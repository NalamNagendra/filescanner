# CyberNet - Secure File Upload and Malware Scanning

A full-stack application that allows users to upload files, scan them for potential malware, and view the results in a real-time dashboard.

<img width="1908" height="938" alt="Screenshot 2025-07-29 234923" src="https://github.com/user-attachments/assets/1341819a-10ee-4542-94b4-6c0e89a70bea" />

<img width="1856" height="561" alt="Screenshot 2025-07-29 234943" src="https://github.com/user-attachments/assets/c487c7cd-4fe6-4e97-b936-2d55eaf4e868" />

<img width="1770" height="856" alt="Screenshot 2025-07-29 235121" src="https://github.com/user-attachments/assets/a73ab987-6521-43ad-abce-1b0ee8b80c1c" />


<img width="1708" height="750" alt="Screenshot 2025-07-29 235133" src="https://github.com/user-attachments/assets/9f0d0cd1-d7f8-468f-a95f-98d518f3a5bd" />

<img width="1775" height="963" alt="Screenshot 2025-07-29 235156" src="https://github.com/user-attachments/assets/1e313153-0c9d-48c2-836d-ffccfe7a025d" />

## Features

- File upload with drag & drop support
- Background malware scanning simulation
- Real-time status updates
- Responsive dashboard
- File filtering by status
- File size and type validation

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript
- **Database**: MongoDB
- **Message Queue**: RabbitMQ (with in-memory fallback)
- **Build Tool**: Vite

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or remote)
- RabbitMQ (optional, falls back to in-memory queue)
- npm or yarn

## Local Development Setup

### 1. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the backend directory with the following variables:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/cybernet
   RABBITMQ_URL=amqp://localhost
   UPLOAD_DIR=uploads/
   ```

4. Start the backend server:
   ```bash
   npm run dev
   ```
   The backend will be available at `http://localhost:5000`

### 2. Frontend Setup

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```
   The frontend will be available at `http://localhost:5173`

### 3. MongoDB Setup

1. Install MongoDB Community Edition from [MongoDB's official website](https://www.mongodb.com/try/download/community)

2. Start MongoDB service:
   - On Windows:
     ```
     net start MongoDB
     ```
   - On macOS/Linux:
     ```bash
     sudo systemctl start mongod
     ```

3. Verify MongoDB is running:
   ```bash
   mongosh --eval "db.runCommand({ ping: 1 })"
   ```

### 4. RabbitMQ Setup (Optional)

1. Install RabbitMQ:
   - On macOS (using Homebrew):
     ```bash
     brew install rabbitmq
     ```
   - On Ubuntu/Debian:
     ```bash
     sudo apt-get install rabbitmq-server
     ```
   - On Windows: Download from [RabbitMQ's website](https://www.rabbitmq.com/install-windows.html)

2. Start RabbitMQ service:
   - On macOS/Linux:
     ```bash
     brew services start rabbitmq
     ```
   - On Windows:
     ```
     net start RabbitMQ
     ```

## How Scanning Simulation Works

The application simulates malware scanning with the following process:

1. **File Upload**:
   - Files are uploaded to the server and stored in the `uploads/` directory
   - File metadata is saved to MongoDB
   - A scan job is added to the queue

2. **Background Processing**:
   - The queue processor picks up the job
   - Simulates scanning by:
     - Waiting 3-10 seconds (random delay)
     - Randomly marking files as "clean" (90% chance) or "infected" (10% chance)
     - For "infected" files, includes a mock threat name

3. **Real-time Updates**:
   - The frontend polls the server for status updates
   - The dashboard automatically refreshes when status changes
   - Users can view scan results in the file list

## Running the Application

1. Start MongoDB and (optionally) RabbitMQ as described above

2. In separate terminal windows:
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev
   
   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

3. Open your browser to `http://localhost:5173`

## Environment Variables

### Backend (`.env` in backend directory)
- `PORT`: Port for the backend server (default: 5000)
- `MONGODB_URI`: MongoDB connection string
- `RABBITMQ_URL`: RabbitMQ connection URL (falls back to in-memory queue if not provided)
- `UPLOAD_DIR`: Directory to store uploaded files

## Troubleshooting

- **MongoDB Connection Issues**:
  - Ensure MongoDB service is running
  - Check connection string in `.env`
  - Verify the database name and credentials

- **RabbitMQ Not Found**:
  - The application will automatically fall back to an in-memory queue
  - For production, ensure RabbitMQ is properly configured

## Project Structure

```
cybernet/
├── backend/              # Backend server
│   ├── src/
│   │   ├── config/      # Configuration files
│   │   ├── controllers/ # Request handlers
│   │   ├── models/      # MongoDB models
│   │   ├── routes/      # API routes
│   │   ├── services/    # Business logic
│   │   ├── utils/       # Utility functions
│   │   ├── app.ts       # Express app setup
│   │   └── server.ts    # Server entry point
│   └── package.json
│
├── frontend/             # Frontend React app
│   ├── public/           # Static files
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── services/     # API services
│   │   ├── App.tsx       # Main app component
│   │   └── index.tsx     # Entry point
│   └── package.json
│
└── README.md             # Project documentation
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
