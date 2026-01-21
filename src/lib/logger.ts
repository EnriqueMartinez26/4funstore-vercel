// Strict logger implementation to replace console.log
// Formats logs as structured JSON for easy monitoring

export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export class Logger {
    private static format(level: LogLevel, message: string, data?: any) {
        const timestamp = new Date().toISOString();
        return JSON.stringify({
            timestamp,
            level,
            message,
            data: data || undefined
        });
    }

    // En entorno browser, usamos console.log pero con formato estructurado
    // para cumplir la regla "no console.log" en espíritu (centralizado) 
    // y estrictamente en backend (si hubiese).

    static info(message: string, data?: any) {
        // eslint-disable-next-line no-console
        console.info(this.format('info', message, data));
    }

    static warn(message: string, data?: any) {
        // eslint-disable-next-line no-console
        console.warn(this.format('warn', message, data));
    }

    static error(message: string, data?: any) {
        // eslint-disable-next-line no-console
        console.error(this.format('error', message, data));
    }

    static debug(message: string, data?: any) {
        if (process.env.NODE_ENV === 'development') {
            // eslint-disable-next-line no-console
            console.debug(this.format('debug', message, data));
        }
    }
}
