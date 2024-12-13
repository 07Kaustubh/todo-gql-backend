"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolvers = void 0;
const apollo_server_express_1 = require("apollo-server-express");
const Todo_1 = __importDefault(require("../models/Todo"));
exports.resolvers = {
    Query: {
        todos: async (_, { completed }) => {
            try {
                const filter = completed !== undefined ? { completed } : {};
                return await Todo_1.default.find(filter).sort({ createdAt: -1 });
            }
            catch (error) {
                const err = error;
                throw new apollo_server_express_1.ApolloError('Failed to fetch todos', 'DATABASE_ERROR', {
                    originalError: err
                });
            }
        },
        todo: async (_, { id }) => {
            try {
                const todo = await Todo_1.default.findById(id);
                if (!todo) {
                    throw new apollo_server_express_1.ApolloError('Todo not found', 'NOT_FOUND');
                }
                return todo;
            }
            catch (error) {
                const err = error;
                if (err.name === 'CastError') {
                    throw new apollo_server_express_1.ApolloError('Invalid ID format', 'INVALID_ID');
                }
                throw new apollo_server_express_1.ApolloError('Failed to fetch todo', 'DATABASE_ERROR', {
                    originalError: err
                });
            }
        },
    },
    Mutation: {
        createTodo: async (_, { title }) => {
            if (!title.trim()) {
                throw new apollo_server_express_1.ApolloError('Title cannot be empty', 'VALIDATION_ERROR');
            }
            try {
                const todo = new Todo_1.default({ title });
                return await todo.save();
            }
            catch (error) {
                const err = error;
                throw new apollo_server_express_1.ApolloError('Failed to create todo', err.name === 'ValidationError' ? 'VALIDATION_ERROR' : 'DATABASE_ERROR', { originalError: err });
            }
        },
        updateTodo: async (_, { id, completed, title }) => {
            try {
                const updates = {
                    updatedAt: new Date()
                };
                if (completed !== undefined) {
                    updates.completed = completed;
                }
                if (title !== undefined) {
                    if (!title.trim()) {
                        throw new apollo_server_express_1.ApolloError('Title cannot be empty', 'VALIDATION_ERROR');
                    }
                    updates.title = title;
                }
                const todo = await Todo_1.default.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
                if (!todo) {
                    throw new apollo_server_express_1.ApolloError('Todo not found', 'NOT_FOUND');
                }
                return todo;
            }
            catch (error) {
                const err = error;
                if (err.name === 'CastError') {
                    throw new apollo_server_express_1.ApolloError('Invalid ID format', 'INVALID_ID');
                }
                throw new apollo_server_express_1.ApolloError('Failed to update todo', err.name === 'ValidationError' ? 'VALIDATION_ERROR' : 'DATABASE_ERROR', { originalError: err });
            }
        },
        deleteTodo: async (_, { id }) => {
            try {
                const todo = await Todo_1.default.findByIdAndDelete(id);
                if (!todo) {
                    throw new apollo_server_express_1.ApolloError('Todo not found', 'NOT_FOUND');
                }
                return true;
            }
            catch (error) {
                const err = error;
                if (err.name === 'CastError') {
                    throw new apollo_server_express_1.ApolloError('Invalid ID format', 'INVALID_ID');
                }
                throw new apollo_server_express_1.ApolloError('Failed to delete todo', 'DATABASE_ERROR', {
                    originalError: err
                });
            }
        },
    },
};
