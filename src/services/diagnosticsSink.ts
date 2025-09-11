import { LogEntry } from './loggerService';
import { setLogSink } from './loggerService';

let buffer: LogEntry[] = [];
let limit = 500;

export function setBufferLimit(n: number) {
  limit = Math.max(10, Math.min(n, 10_000));
  if (buffer.length > limit) buffer = buffer.slice(-limit);
}

export function getBufferedLogs(): ReadonlyArray<LogEntry> {
  return buffer;
}

export function clearBufferedLogs() {
  buffer = [];
}

export function attachDiagnosticsSink() {
  setLogSink((entry) => {
    buffer.push(entry);
    if (buffer.length > limit) buffer.shift();
  });
}

