type LogLevel = 'INFO' | 'WARN' | 'ERROR';

function write(level: LogLevel, message: string, meta?: unknown) {
  const suffix = meta === undefined ? '' : ` ${JSON.stringify(meta)}`;
  process.stdout.write(`[${new Date().toISOString()}] [${level}] ${message}${suffix}\n`);
}

export const logger = {
  info: (message: string, meta?: unknown) => write('INFO', message, meta),
  warn: (message: string, meta?: unknown) => write('WARN', message, meta),
  error: (message: string, meta?: unknown) => write('ERROR', message, meta),
};
