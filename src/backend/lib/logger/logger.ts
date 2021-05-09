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
          // If message is of type object, JSON stringify it
          let message = info.message
          if (typeof info.message === 'object') {
            message = JSON.stringify(info.message, null, 4)
          }

          let metadata = ''
          if (Object.keys(info.metadata).length > 0) metadata = JSON.stringify(Object.values(info.metadata), null, 4)

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

// export const logger = getLogger('debug')
