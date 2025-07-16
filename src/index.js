// Importing the necessary modules
const http = require('http'); // HTTP module to create an HTTP server
const WebSocket = require('ws'); // WebSocket module to create a WebSocket server
const app = require('./app'); // Importing the Express app
const port = process.env.PORT || 3000; // Setting the port from environment variables or default to 3000

// Creating an HTTP server using the Express app
const server = http.createServer(app);

// Creating a WebSocket server attached to the HTTP server
const wss = new WebSocket.Server({ server });

// Creating a Map to store WebSocket connections associated with user IDs
const clients = new Map();

// Handling new WebSocket connections
wss.on('connection', (ws, req) => {
  // Extracting the user ID from the query parameter
  const userId = req.url.split('?userId=')[1];
  
  // If the user ID is provided, store the WebSocket connection in the Map
  if (userId) {
    clients.set(userId, ws);
    console.log(`New client connected: ${userId}`);
    console.log('Current clients:', Array.from(clients.keys()));

    // Event listener for when the WebSocket connection is closed
    ws.on('close', () => {
      // Remove the WebSocket connection from the Map when the user disconnects
      clients.delete(userId);
      console.log(`Client disconnected: ${userId}`);
      console.log('Current clients:', Array.from(clients.keys()));
    });
  } else {
    // Close the WebSocket connection if the user ID is not provided
    ws.close();
  }
});

// Making the clients Map available in other parts of the app
// app.locals.clients = clients;
// Starting the HTTP server and logging a message
server.listen(port, () => {
  console.log("Hey Alex! Server is running on port", port);

  // scheduled tasks
  const hourlyBalanceUpdateTask = require("./tasks/hourlyBalanceUpdate");
  // Initialize cron job after server starts
  hourlyBalanceUpdateTask(clients);
});
