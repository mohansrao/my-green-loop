/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    projects: [
        {
            displayName: 'server',
            testEnvironment: 'node',
            testMatch: ['<rootDir>/server/**/*.test.ts'],
            transform: {
                '^.+\\.tsx?$': ['ts-jest', {
                    useESM: true,
                    isolatedModules: true
                }]
            },
            moduleNameMapper: {
                '^@db/(.*)$': '<rootDir>/db/$1',
                '^@db$': '<rootDir>/db/index.ts',
                '^(\\.{1,2}/.*)\\.js$': '$1'
            }
        },
        {
            displayName: 'client',
            testEnvironment: 'jsdom',
            testMatch: ['<rootDir>/client/src/**/*.test.tsx'],
            transform: {
                '^.+\\.tsx?$': ['ts-jest', {
                    useESM: true,
                    isolatedModules: true,
                    tsconfig: {
                        jsx: 'react-jsx'
                    }
                }]
            },
            moduleNameMapper: {
                '^@/(.*)$': '<rootDir>/client/src/$1',
                '^(\\.{1,2}/.*)\\.js$': '$1'
            },
            setupFilesAfterEnv: ['<rootDir>/client/src/setupTests.ts']
        }
    ],
    preset: 'ts-jest/presets/default-esm',
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    extensionsToTreatAsEsm: ['.ts', '.tsx']
};
