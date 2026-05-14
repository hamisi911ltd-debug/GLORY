import { executeQuery, executeUpdate, generateId } from "../lib/database.js";
import { authenticate } from "../lib/auth.js";
import { ok, created, badRequest } from "../lib/response.js";

export function registerMessageRoutes(router) {
  /**
   * GET /api/messages
   * Get messages for authenticated user
   */
  router.get("/api/messages", async (req, env) => {
    const auth = await authenticate(req.raw, env);
    if (auth.error) return auth.error;

    try {
      const { type, read_status } = req.query || {};
      
      let query = `
        SELECT m.*, 
               sender.full_name as sender_name, sender.email as sender_email,
               recipient.full_name as recipient_name, recipient.email as recipient_email
        FROM messages m
        LEFT JOIN users sender ON m.sender_id = sender.id
        LEFT JOIN users recipient ON m.recipient_id = recipient.id
        WHERE (m.sender_id = ? OR m.recipient_id = ?)
      `;
      const params = [auth.user.id, auth.user.id];

      if (type) {
        query += ` AND m.message_type = ?`;
        params.push(type);
      }

      if (read_status !== undefined) {
        query += ` AND m.read_status = ?`;
        params.push(read_status === 'true');
      }

      query += ` ORDER BY m.created_at DESC`;

      const result = await executeQuery(env.DB, query, params);
      return ok({ messages: result.results || [] });
    } catch (error) {
      console.error('Get messages error:', error);
      return badRequest(error.message);
    }
  });

  /**
   * POST /api/messages
   * Send a new message
   */
  router.post("/api/messages", async (req, env) => {
    const auth = await authenticate(req.raw, env);
    if (auth.error) return auth.error;

    const { recipient_id, subject, message, message_type = 'general' } = req.body ?? {};
    
    if (!recipient_id || !message) {
      return badRequest("recipient_id and message are required");
    }

    try {
      const id = generateId();
      const query = `
        INSERT INTO messages (id, sender_id, recipient_id, subject, message, message_type)
        VALUES (?, ?, ?, ?, ?, ?)
      `;

      await executeUpdate(env.DB, query, [
        id, auth.user.id, recipient_id, subject || null, message, message_type
      ]);

      return created({
        message: "Message sent successfully",
        message_id: id
      });
    } catch (error) {
      console.error('Send message error:', error);
      return badRequest(error.message);
    }
  });

  /**
   * PUT /api/messages/:id/read
   * Mark message as read
   */
  router.put("/api/messages/:id/read", async (req, env) => {
    const auth = await authenticate(req.raw, env);
    if (auth.error) return auth.error;

    try {
      const query = `
        UPDATE messages 
        SET read_status = true, read_at = ? 
        WHERE id = ? AND recipient_id = ?
      `;

      await executeUpdate(env.DB, query, [
        new Date().toISOString(), req.params.id, auth.user.id
      ]);

      return ok({ message: "Message marked as read" });
    } catch (error) {
      console.error('Mark message read error:', error);
      return badRequest(error.message);
    }
  });
}