
import fs from 'fs';
import path from 'path';

// Determine if we're in production
const isProduction = process.env.NODE_ENV === 'production';
const logDir = path.join(process.cwd(), 'logs');

// Ensure log directory exists
if (isProduction) {
  try {
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  } catch (err) {
    console.error('Could not create logs directory:', err);
  }
}

// Log levels
type LogLevel = 'info' | 'debug' | 'warn' | 'error';

function formatLogEntry(level: LogLevel, message: string, meta?: any): string {
  const timestamp = new Date().toISOString();
  const metaStr = meta ? ` | ${JSON.stringify(meta)}` : '';
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}`;
}

function writeToLogFile(entry: string) {
  if (isProduction) {
    const date = new Date().toISOString().split('T')[0];
    const logFile = path.join(logDir, `app-${date}.log`);
    
    fs.appendFile(logFile, entry + '\n', (err) => {
      if (err) {
        console.error('Failed to write to log file:', err);
      }
    });
  }
}

export const logger = {
  info: (message: string, meta?: any) => {
    const entry = formatLogEntry('info', message, meta);
    console.log(entry);
    writeToLogFile(entry);
  },
  
  debug: (message: string, meta?: any) => {
    // Only log debug in non-production or when explicitly enabled
    if (!isProduction || process.env.DEBUG_LOGGING === 'true') {
      const entry = formatLogEntry('debug', message, meta);
      console.log(entry);
      writeToLogFile(entry);
    }
  },
  
  warn: (message: string, meta?: any) => {
    const entry = formatLogEntry('warn', message, meta);
    console.warn(entry);
    writeToLogFile(entry);
  },
  
  error: (message: string, meta?: any) => {
    const entry = formatLogEntry('error', message, meta);
    console.error(entry);
    writeToLogFile(entry);
  }
};
