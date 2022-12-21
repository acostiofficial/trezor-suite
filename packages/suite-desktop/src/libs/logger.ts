/* eslint-disable no-console */
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { app } from 'electron';

import { getBuildInfo, getComputerInfo } from './info';

const logLevels = ['mute', 'error', 'warn', 'info', 'debug'] as const;
export type LogLevel = typeof logLevels[number];

export type Options = {
    colors?: boolean; // Console output has colors
    writeToConsole?: boolean; // Output is displayed in the console
    writeToDisk?: boolean; // Output is written to a file
    outputFile?: string; // file name for the output
    outputPath?: string; // path for the output
    logFormat?: string; // Output format of the log
};

const userDataDir = app?.getPath('userData');

export const defaultOptions: Options = {
    colors: true,
    writeToConsole: true,
    writeToDisk: false,
    outputFile: 'trezor-suite-log-%ts.txt',
    outputPath: userDataDir ? `${userDataDir}/logs` : process.cwd(),
    logFormat: '%dt - %lvl(%top): %msg',
} as const;

export class Logger implements ILogger {
    static instance: Logger;
    private stream?: Promise<fs.WriteStream | undefined>;
    private options: Options;
    private logLevel = 0;

    constructor(level: LogLevel, options?: Options) {
        this.logLevel = logLevels.indexOf(level);
        this.options = {
            ...defaultOptions,
            ...options,
        };

        this.stream = this.prepareWriteStream(this.options);
    }

    private async prepareWriteStream({ writeToDisk, outputFile, outputPath }: Options) {
        if (this.logLevel > 0 && writeToDisk) {
            const stream = await this.stream;
            if (stream !== undefined) {
                // Do not create a new file if there is one currently open.
                return;
            }

            if (!outputFile) {
                this.error(
                    'logger',
                    `Can't write log to file because outputFile is not properly set (${outputFile})`,
                );
                return;
            }

            if (!outputPath) {
                this.error(
                    'logger',
                    `Can't write log to file because outputPath is not properly set (${outputPath})`,
                );
                return;
            }

            try {
                await fs.promises.access(outputPath, fs.constants.R_OK);
            } catch {
                await fs.promises.mkdir(outputPath);
            }

            return fs.createWriteStream(path.join(outputPath, this.format(outputFile)));
        }
        this.exit();
    }

    private async logBasicInfo() {
        const buildInfo = getBuildInfo();
        this.info('build', buildInfo);

        const computerInfo = await getComputerInfo();
        this.debug('computer', computerInfo);
    }

    private log(level: LogLevel, topic: string, message: string | string[]) {
        const { writeToConsole, writeToDisk, logFormat } = this.options;

        if ((!writeToConsole && !writeToDisk) || !logFormat) {
            return;
        }

        const logLevel = logLevels.indexOf(level);
        if (this.logLevel < logLevel) {
            return;
        }

        const messages: string[] = typeof message === 'string' ? [message] : message;
        messages.forEach(m =>
            this.write(
                level,
                this.format(logFormat, {
                    lvl: level.toUpperCase(),
                    top: topic,
                    msg: m,
                }),
            ),
        );
    }

    private async write(level: LogLevel, message: string) {
        if (this.options.writeToConsole) {
            console.log(this.options.colors ? this.color(level, message) : message);
        }

        const stream = await this.stream;
        if (stream !== undefined) {
            stream.write(`${message}\n`);
        }
    }

    private format(format: string, strings: { [key: string]: string } = {}) {
        let message = format;

        Object.keys(strings).forEach(k => {
            message = message.replace(`%${k}`, strings[k]);
        });

        message = message
            .replace('%dt', new Date().toISOString())
            .replace('%ts', (+new Date()).toString());

        return message;
    }

    private color(level: LogLevel, message: string) {
        switch (level) {
            case 'error':
                return chalk.red(message.replace('ERROR', chalk.bold('ERROR')));
            case 'warn':
                return message.replace('WARN', chalk.bold.yellow('WARN'));
            case 'info':
                return message.replace('INFO', chalk.bold.blue('INFO'));
            case 'debug':
                return message.replace('DEBUG', chalk.bold.cyan('DEBUG'));
            default:
                return message;
        }
    }

    public async exit() {
        const stream = await this.stream;
        if (stream !== undefined) {
            stream.end();
        }
    }

    public error(topic: string, message: string | string[]) {
        this.log('error', topic, message);
    }

    public warn(topic: string, message: string | string[]) {
        this.log('warn', topic, message);
    }

    public info(topic: string, message: string | string[]) {
        this.log('info', topic, message);
    }

    public debug(topic: string, message: string | string[]) {
        this.log('debug', topic, message);
    }

    public get level() {
        return logLevels[this.logLevel];
    }

    public set level(level: LogLevel) {
        this.logLevel = logLevels.indexOf(level);
    }

    public get config() {
        return this.options;
    }

    public set config(options: Partial<Options>) {
        this.options = {
            ...this.options,
            ...options,
        };

        this.stream = this.prepareWriteStream(this.options);

        if (options.writeToDisk) {
            this.logBasicInfo();
        }
    }
}
