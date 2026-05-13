/**
 * Cloudflare Durable Object for real-time updates
 * Handles WebSocket connections for live dashboard updates
 */

export class RealtimeService {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.connections = new Map(); // userId -> WebSocket[]
  }

  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname === '/ws') {
      const upgradeHeader = request.headers.get('Upgrade');
      if (upgradeHeader !== 'websocket') {
        return new Response('Expected websocket', { status: 400 });
      }

      const userId = url.searchParams.get('userId');
      if (!userId) {
        return new Response('Missing userId', { status: 400 });
      }

      const [client, server] = Object.values(new WebSocketPair());
      await this.handleWebSocket(server, userId);

      return new Response(null, {
        status: 101,
        webSocket: client,
      });
    }

    return new Response('Not found', { status: 404 });
  }

  async handleWebSocket(ws, userId) {
    // Add connection to user's connections
    if (!this.connections.has(userId)) {
      this.connections.set(userId, []);
    }
    this.connections.get(userId).push(ws);

    ws.accept();

    // Send welcome message
    ws.send(JSON.stringify({
      type: 'connected',
      message: 'Connected to DriveSchool Pro real-time service',
      timestamp: new Date().toISOString(),
    }));

    // Handle incoming messages
    ws.addEventListener('message', async (event) => {
      try {
        const data = JSON.parse(event.data);

        switch (data.type) {
          case 'ping':
            ws.send(JSON.stringify({ type: 'pong', timestamp: new Date().toISOString() }));
            break;

          case 'subscribe':
            // Handle subscription to specific channels
            break;

          default:
            ws.send(JSON.stringify({ type: 'error', message: 'Unknown message type' }));
        }
      } catch (error) {
        ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
      }
    });

    // Handle disconnection
    ws.addEventListener('close', () => {
      const userConnections = this.connections.get(userId) || [];
      const index = userConnections.indexOf(ws);
      if (index > -1) {
        userConnections.splice(index, 1);
      }
      if (userConnections.length === 0) {
        this.connections.delete(userId);
      }
    });

    // Handle errors
    ws.addEventListener('error', (error) => {
      console.error('WebSocket error:', error);
    });
  }

  /**
   * Broadcast message to all connections for a user
   */
  async broadcastToUser(userId, message) {
    const userConnections = this.connections.get(userId) || [];

    const messageStr = JSON.stringify({
      ...message,
      timestamp: new Date().toISOString(),
    });

    userConnections.forEach(ws => {
      try {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(messageStr);
        }
      } catch (error) {
        console.error('Failed to send message to user:', userId, error);
      }
    });
  }

  /**
   * Broadcast message to all connected users
   */
  async broadcastToAll(message) {
    const messageStr = JSON.stringify({
      ...message,
      timestamp: new Date().toISOString(),
    });

    for (const [userId, connections] of this.connections) {
      connections.forEach(ws => {
        try {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(messageStr);
          }
        } catch (error) {
          console.error('Failed to broadcast to user:', userId, error);
        }
      });
    }
  }

  /**
   * Send payment update to user
   */
  async notifyPaymentUpdate(userId, paymentData) {
    await this.broadcastToUser(userId, {
      type: 'payment_update',
      data: paymentData,
    });
  }

  /**
   * Send lesson update to user
   */
  async notifyLessonUpdate(userId, lessonData) {
    await this.broadcastToUser(userId, {
      type: 'lesson_update',
      data: lessonData,
    });
  }

  /**
   * Send profile update to user
   */
  async notifyProfileUpdate(userId, profileData) {
    await this.broadcastToUser(userId, {
      type: 'profile_update',
      data: profileData,
    });
  }

  /**
   * Send notification to user
   */
  async notifyUser(userId, notification) {
    await this.broadcastToUser(userId, {
      type: 'notification',
      data: notification,
    });
  }

  /**
   * Get connection count for monitoring
   */
  getConnectionCount() {
    let total = 0;
    for (const connections of this.connections.values()) {
      total += connections.length;
    }
    return total;
  }

  /**
   * Get active users count
   */
  getActiveUsersCount() {
    return this.connections.size;
  }
}