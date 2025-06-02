# Backend Chat Application

This is the backend part of the real-time chat application built using Node.js, Express, Socket.io, and SQLite.

## Features

- Real-time messaging using Socket.io
- Room-based chat functionality
- SQLite database for message storage
- RESTful API for chat operations

## Setup Instructions

1. **Clone the repository:**
   ```
   git clone <repository-url>
   cd realtime-chat-app/backend
   ```

2. **Install dependencies:**
   ```
   npm install
   ```

3. **Run the server:**
   ```
   node src/server.js
   ```

4. **Database setup:**
   The application uses SQLite for data storage. Ensure that the database file is created and accessible.

## API Usage

### Endpoints

- **POST /api/chat/send**: Send a message to a room.
- **GET /api/chat/rooms**: Retrieve the list of available chat rooms.
- **GET /api/chat/messages/:roomId**: Retrieve messages for a specific room.

### Socket Events

- **connect**: Triggered when a user connects to the chat.
- **disconnect**: Triggered when a user disconnects from the chat.
- **message**: Triggered when a message is sent in a room.

## Next Steps

1. Implement the frontend interface.
2. Integrate the frontend with the backend using Socket.io.
3. Test the application for synchronization and error handling.
4. Prepare the application for deployment.