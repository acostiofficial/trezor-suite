// eslint-disable-next-line import/extensions
const sharedConfig = require('../../jest.config.base.js');

module.exports = {
    ...sharedConfig,
    rootDir: './',
    coverageDirectory: './coverage',
    collectCoverage: true,
    collectCoverageFrom: ['<rootDir>/src/**'],
    coverageThreshold: {
        global: {
            statements: 90,
            branches: 85,
            functions: 90,
            lines: 95,
        },
    },
    testEnvironment: 'node', // zcash test fails without it, probably polyfilled in real usage, worth checking
    transform: {
        '^.+\\.ts$': 'ts-jest', // until we get rid of typeforce
    },
};
