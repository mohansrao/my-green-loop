/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    transform: {
        '^.+\\.tsx?$': ['ts-jest', {
            tsconfig: 'tsconfig.json',
            isolatedModules: true
        }]
    },
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/client/src/$1',
        '^@db/(.*)$': '<rootDir>/db/$1'
    },
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node']
};
