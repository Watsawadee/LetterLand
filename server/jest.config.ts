export default {
    preset: "ts-jest",
    testEnvironment: "node",
    roots: ["<rootDir>/src"],
    testMatch: ["**/__tests__/**/*.[jt]s?(x)", "**/?(*.)+(spec|test).[tj]s?(x)"],
    moduleFileExtensions: ["ts", "js", "json", "node"],
    clearMocks: true,
    verbose: true,
    setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"], // add this
};