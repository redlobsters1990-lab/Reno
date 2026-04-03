/**
 * Comprehensive logging system for authentication and security events
 * In production, integrate with services like Sentry, Datadog, or CloudWatch
 */

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  SECURITY = 'SECURITY'
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context: Record<string, any>;
  userId?: string;
  ip?: string;
  userAgent?: string;
  path?: string;
  method?: string;
}

class Logger {
  private minLevel: LogLevel = process.env.NODE_ENV === 'production' ? LogLevel.INFO : LogLevel.DEBUG;
  
  /**
   * Log authentication events
   */
  authLog(level: LogLevel, message: string, context: Record<string, any> = {}) {
    this.log(level, `[AUTH] ${message}`, {
      ...context,
      category: 'authentication'
    });
  }
  
  /**
   * Log security events
   */
  securityLog(message: string, context: Record<string, any> = {}) {
    this.log(LogLevel.SECURITY, `[SECURITY] ${message}`, {
      ...context,
      category: 'security'
    });
  }
  
  /**
   * Log user registration events
   */
  registrationLog(message: string, context: Record<string, any> = {}) {
    this.authLog(LogLevel.INFO, `[REGISTRATION] ${message}`, context);
  }
  
  /**
   * Log login events
   */
  loginLog(message: string, context: Record<string, any> = {}) {
    this.authLog(LogLevel.INFO, `[LOGIN] ${message}`, context);
  }
  
  /**
   * Log failed authentication attempts
   */
  failedAuthLog(message: string, context: Record<string, any> = {}) {
    this.authLog(LogLevel.WARN, `[FAILED_AUTH] ${message}`, context);
  }
  
  /**
   * Log rate limiting events
   */
  rateLimitLog(message: string, context: Record<string, any> = {}) {
    this.securityLog(`[RATE_LIMIT] ${message}`, context);
  }
  
  /**
   * Log suspicious activity
   */
  suspiciousActivityLog(message: string, context: Record<string, any> = {}) {
    this.securityLog(`[SUSPICIOUS] ${message}`, context);
  }
  
  /**
   * Generic log method
   */
  log(level: LogLevel, message: string, context: Record<string, any> = {}) {
    // Skip if below minimum level
    if (this.shouldSkip(level)) {
      return;
    }
    
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      ...this.extractRequestInfo(context)
    };
    
    // In development, log to console with colors
    if (process.env.NODE_ENV !== 'production') {
      this.consoleLog(entry);
    }
    
    // In production, you would:
    // 1. Send to centralized logging service
    // 2. Store in database for audit trail
    // 3. Trigger alerts for security events
    // 4. Send to monitoring dashboard
    
    this.persistLog(entry);
  }
  
  /**
   * Extract request information from context
   */
  private extractRequestInfo(context: Record<string, any>) {
    const info: Partial<LogEntry> = {};
    
    if (context.ip) info.ip = context.ip;
    if (context.userId) info.userId = context.userId;
    if (context.userAgent) info.userAgent = context.userAgent;
    if (context.path) info.path = context.path;
    if (context.method) info.method = context.method;
    
    return info;
  }
  
  /**
   * Console logging with colors
   */
  private consoleLog(entry: LogEntry) {
    const colors = {
      [LogLevel.DEBUG]: '\x1b[36m', // Cyan
      [LogLevel.INFO]: '\x1b[32m',  // Green
      [LogLevel.WARN]: '\x1b[33m',  // Yellow
      [LogLevel.ERROR]: '\x1b[31m', // Red
      [LogLevel.SECURITY]: '\x1b[35m' // Magenta
    };
    
    const reset = '\x1b[0m';
    const timestamp = new Date(entry.timestamp).toLocaleTimeString();
    
    console.log(
      `${colors[entry.level]}[${entry.level}]${reset} ${timestamp} ${entry.message}`,
      entry.context
    );
  }
  
  /**
   * Persist log entry (stub for production implementation)
   */
  private persistLog(entry: LogEntry) {
    // In production, implement:
    // - Database storage
    // - File rotation
    // - Log aggregation
    // - Alerting
    
    // For now, we'll just keep recent logs in memory for debugging
    if (!global.logBuffer) {
      global.logBuffer = [];
    }
    
    global.logBuffer.push(entry);
    
    // Keep only last 1000 entries
    if (global.logBuffer.length > 1000) {
      global.logBuffer.shift();
    }
  }
  
  /**
   * Check if log should be skipped based on level
   */
  private shouldSkip(level: LogLevel): boolean {
    const levelPriority = {
      [LogLevel.DEBUG]: 0,
      [LogLevel.INFO]: 1,
      [LogLevel.WARN]: 2,
      [LogLevel.ERROR]: 3,
      [LogLevel.SECURITY]: 4
    };
    
    return levelPriority[level] < levelPriority[this.minLevel];
  }
  
  /**
   * Get recent logs (for debugging/admin purposes)
   */
  getRecentLogs(limit: number = 100): LogEntry[] {
    if (!global.logBuffer) {
      return [];
    }
    
    return global.logBuffer.slice(-limit);
  }
  
  /**
   * Get logs filtered by level
   */
  getLogsByLevel(level: LogLevel, limit: number = 100): LogEntry[] {
    if (!global.logBuffer) {
      return [];
    }
    
    return global.logBuffer
      .filter(entry => entry.level === level)
      .slice(-limit);
  }
  
  /**
   * Get authentication logs
   */
  getAuthLogs(limit: number = 100): LogEntry[] {
    if (!global.logBuffer) {
      return [];
    }
    
    return global.logBuffer
      .filter(entry => entry.context?.category === 'authentication')
      .slice(-limit);
  }
  
  /**
   * Get security logs
   */
  getSecurityLogs(limit: number = 100): LogEntry[] {
    if (!global.logBuffer) {
      return [];
    }
    
    return global.logBuffer
      .filter(entry => entry.context?.category === 'security')
      .slice(-limit);
  }
}

// Create singleton instance
export const logger = new Logger();

// Type augmentation for global
declare global {
  var logBuffer: LogEntry[] | undefined;
}

/**
 * Request context helper
 */
export function createRequestContext(request: Request, userId?: string) {
  const url = new URL(request.url);
  
  return {
    ip: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown',
    userAgent: request.headers.get('user-agent') || 'unknown',
    path: url.pathname,
    method: request.method,
    userId,
    timestamp: new Date().toISOString()
  };
}

/**
 * Authentication-specific logging helpers
 */
export const authLogger = {
  signup: {
    success: (email: string, userId: string, context: Record<string, any> = {}) => {
      logger.registrationLog(`Successful signup: ${email}`, {
        ...context,
        email,
        userId,
        success: true
      });
    },
    
    failed: (email: string, reason: string, context: Record<string, any> = {}) => {
      logger.registrationLog(`Failed signup: ${email} - ${reason}`, {
        ...context,
        email,
        reason,
        success: false
      });
    },
    
    duplicate: (email: string, context: Record<string, any> = {}) => {
      logger.registrationLog(`Duplicate signup attempt: ${email}`, {
        ...context,
        email,
        reason: 'duplicate_email'
      });
    }
  },
  
  login: {
    success: (email: string, userId: string, context: Record<string, any> = {}) => {
      logger.loginLog(`Successful login: ${email}`, {
        ...context,
        email,
        userId,
        success: true
      });
    },
    
    failed: (email: string, reason: string, context: Record<string, any> = {}) => {
      logger.failedAuthLog(`Failed login: ${email} - ${reason}`, {
        ...context,
        email,
        reason,
        success: false
      });
    }
  },
  
  security: {
    rateLimit: (ip: string, path: string, context: Record<string, any> = {}) => {
      logger.rateLimitLog(`Rate limit exceeded: ${ip} on ${path}`, {
        ...context,
        ip,
        path
      });
    },
    
    suspicious: (message: string, context: Record<string, any> = {}) => {
      logger.suspiciousActivityLog(message, context);
    }
  }
};