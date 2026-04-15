const supabase = require('../supabase');

/**
 * LoggerService - Standardized logging for traceability and audit
 * Designed to be non-blocking using setImmediate
 */
class LoggerService {
  /**
   * Log a standard user or system action
   * @param {Object} req - Express request object (optional, for context)
   * @param {Object} data - Log data
   * @param {string} data.action - Action type (e.g. 'LOGIN', 'CHECKOUT')
   * @param {string} data.entity_type - Type of object (e.g. 'ORDER', 'USER')
   * @param {string} data.entity_id - ID of the object
   * @param {string} data.status - 'SUCCESS' or 'FAILED'
   * @param {Object} data.metadata - Additional JSON context
   * @param {string} data.error_message - Optional error details
   */
  logAction(req, { action, entity_type, entity_id, status = 'SUCCESS', metadata = {}, error_message = null }) {
    const userId = req?.user?.id || metadata?.user_id || null;
    const route = req?.originalUrl || null;
    const ip = req?.ip || null;

    // Use setImmediate to avoid blocking the main event loop
    setImmediate(async () => {
      try {
        await supabase.from('system_logs').insert({
          user_id: userId,
          action_type: action,
          entity_type,
          entity_id: entity_id?.toString(),
          status,
          metadata,
          error_message,
          api_route: route,
          ip_address: ip
        });
      } catch (err) {
        // Fallback to console if DB logging fails
        console.error('❌ LoggerService Failure:', err.message);
      }
    });
  }

  /**
   * Log a system error (500s)
   */
  logError(req, error, payload = {}) {
    this.logAction(req, {
      action: 'SYSTEM_ERROR',
      entity_type: 'SYSTEM',
      status: 'FAILED',
      error_message: error.message,
      metadata: {
        stack: error.stack,
        payload
      }
    });
  }
}

module.exports = new LoggerService();
