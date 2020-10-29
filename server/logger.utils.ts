import {createLogger, format, transports} from 'winston';
import DailyRotateFile from "winston-daily-rotate-file";
import {LOG_PATH} from "./persistence";

const { combine, timestamp, printf, colorize, label } = format;


export const textFormat = (space: string = null) => printf(({ level, label, timestamp, ...obj }) => {
  label = label ? `[${label}] ` : '';

  return `${timestamp} ${label}${level}: ${obj.message} ${JSON.stringify(obj, null, space)}`;
});


export const timestampInstance =  timestamp({
  format: () => {
    const NOW = new Date();
    const TIMESTAMP = NOW.getTime() - (NOW.getTimezoneOffset() * 60000);

    const DATE_WITH_OFFSET = new Date(TIMESTAMP);

    return DATE_WITH_OFFSET.toISOString().substr(0,19);
  }
});

// Console
export const consoleFormat = (labelName: string) =>  combine(
  colorize(),

  label({
    label: labelName
  }),
  timestampInstance,

  textFormat('  '),
);

export const fileFormat =  combine(
  timestampInstance,

  textFormat()
);

export function newLogger(label: string, fileName: string) {
  return createLogger({
    level: 'info',
    transports: [
      new transports.Console({
        format: consoleFormat(label),
      }),
      new DailyRotateFile({
        format: fileFormat,
        dirname: LOG_PATH,
        filename: fileName,
        stream: null,
        extension: '.log'
      })
    ]
  });
}

export const LOGGER = newLogger('MemeBox', 'memebox');
