"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_memory_server_1 = require("mongodb-memory-server");
const mongoose_1 = __importDefault(require("mongoose"));
let mongod;
beforeAll(async () => {
    if (mongoose_1.default.connection.readyState === 0) {
        mongod = await mongodb_memory_server_1.MongoMemoryServer.create();
        const uri = mongod.getUri();
        await mongoose_1.default.connect(uri);
    }
    else {
        console.warn('Mongoose is already connected.');
    }
});
afterAll(async () => {
    await mongoose_1.default.disconnect();
    if (mongod) {
        await mongod.stop();
    }
});
afterEach(async () => {
    const collections = mongoose_1.default.connection.collections;
    for (const key in collections) {
        await collections[key].deleteMany({});
    }
});
describe('Setup Tests', () => {
    it('should connect to the database', async () => {
        expect(mongoose_1.default.connection.readyState).toBe(1); // 1 means connected
    });
});
