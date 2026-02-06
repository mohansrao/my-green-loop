/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    preset: 'ts-jest/presets/default-esm',
    testEnvironment: 'node',
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
        '^@db/(.*)$': '<rootDir>/db/$1',
        '^@db$': '<rootDir>/db/index.ts',
        '^(\\.{1,2}/.*)\\.js$': '$1'
    },
    testMatch: ['**/server/**/*.test.ts'],
    extensionsToTreatAsEsm: ['.ts', '.tsx'],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node']
};
