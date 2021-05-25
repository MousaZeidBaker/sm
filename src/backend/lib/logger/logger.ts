import winston from 'winston'
import util from 'util'

export const logger = winston.createLogger({
  transports: [
    new winston.transports.Console({
      level: 'debug',
      handleExceptions: true,
      format: winston.format.combine(
        winston.format.colorize({ all: true }),
        winston.format.timestamp(),
        winston.format.align(),
        winston.format.metadata({ fillExcept: ['message', 'level', 'timestamp', 'label'] }),
        winston.format.printf(info => {
          // If of type object, go through the complete object in order to avoid prints like '[Object]'
          const message = typeof info.message === 'object' ? util.inspect(info.message, { depth: null }) : info.message
          const metadata = typeof info.metadata === 'object' ? util.inspect(info.metadata, { depth: null }) : info.metadata

          return `${info.timestamp} ${info.level}: ${message} ${metadata}`
        })
      ),
    }),
    // new winston.transports.File({
    //   level: 'info',
    //   filename: path.resolve(__dirname, '../../logs/app.log')
    // })
  ],
  exitOnError: false, // Do not exit on handled exceptions
})
