export const LogLevel = ['verbose', 'info', 'warning', 'error'] as const

export class Logger{
    private static logger: Map<string, Logger> = new Map();

    static logLevel: typeof LogLevel[number] = 'info';

    /**
     * Get a logger instance by name.
     * @param name  Name of the logger
     * @returns The logger instance with the specified name, either existing or new.
     */
    static getLogger(name: string){
        if(!Logger.logger.get(name)){
            new Logger(name);
        }
        return Logger.logger.get(name)!;
    }

    static getLogLevel(): typeof LogLevel[number] {
        return Logger.logLevel;
    }

    static setLogLevel(level: typeof LogLevel[number]){
        Logger.logLevel = level;
    }

    readonly name: string;
    logLevel: typeof LogLevel[number] = 'info';

    private constructor(name: string){
        this.name = name;
        Logger.logger.set(name, this);
    }

    /**
     *  Checks if the requested log level is allowed based on the current log level.
     * @param requestedLevel The log level to check against the current log level.
     * @returns true if the requested log level is allowed, false otherwise.  
     */
    private guard(requestedLevel: typeof LogLevel[number]): boolean {
        return LogLevel.indexOf(Logger.logLevel) <= LogLevel.indexOf(requestedLevel) || LogLevel.indexOf(this.logLevel) <= LogLevel.indexOf(requestedLevel);
    }

    /**
     * For easier usage, use .verbose, .info, .warning, .error instead. 
     * @param logLevel The log level of the message.
     * @param message The message to log.
     */
    log(logLevel: typeof LogLevel[number], message: string){
        if(this.guard(logLevel)){
            switch(logLevel){
                case 'verbose':
                    console.debug(message);
                    break;
                case 'info':
                    console.log(message);
                    break;
                case 'warning':
                    console.warn(message);
                    break;
                case 'error':
                    console.error(message);
                    break;
            }
        }
    }

    debug(message: string){
        this.log('verbose', `[${this.name} VERBOSE] ${message}`);
    }

    info(message: string){
        this.log('info', `[${this.name} INFO] ${message}`);
    }
    
    warn(message: string){
        this.log('warning', `[${this.name} WARNING] ${message}`);
    }

    error(message: string){
        this.log('error', `[${this.name} ERROR] ${message}`);
    }



    getLogLevel(): typeof LogLevel[number] {
        return Logger.logLevel;
    }

    setLogLevel(level: typeof LogLevel[number]){
        Logger.logLevel = level;
    }
}