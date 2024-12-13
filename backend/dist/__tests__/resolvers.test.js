"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const apollo_server_express_1 = require("apollo-server-express");
const resolvers_1 = require("../graphql/resolvers");
const Todo_1 = __importDefault(require("../models/Todo"));
describe('Todo Resolvers', () => {
    describe('Query', () => {
        describe('todos', () => {
            it('should return all todos when no filter is provided', async () => {
                // Create test todos
                await Todo_1.default.create([
                    { title: 'Todo 1', completed: false },
                    { title: 'Todo 2', completed: true }
                ]);
                const result = await resolvers_1.resolvers.Query.todos({}, {}, {}, {});
                expect(result).toHaveLength(2);
            });
            it('should filter todos by completion status', async () => {
                // Create test todos
                await Todo_1.default.create([
                    { title: 'Todo 1', completed: false },
                    { title: 'Todo 2', completed: true }
                ]);
                const completedTodos = await resolvers_1.resolvers.Query.todos({}, { completed: true }, {}, {});
                expect(completedTodos).toHaveLength(1);
                expect(completedTodos[0].completed).toBe(true);
            });
        });
        describe('todo', () => {
            it('should return a specific todo by ID', async () => {
                const todo = await Todo_1.default.create({ title: 'Test Todo' });
                const result = await resolvers_1.resolvers.Query.todo({}, { id: todo.id }, {}, {});
                expect(result.title).toBe('Test Todo');
            });
            it('should throw NOT_FOUND error for non-existent todo', async () => {
                await expect(resolvers_1.resolvers.Query.todo({}, { id: '123456789012' }, {}, {})).rejects.toThrow(apollo_server_express_1.ApolloError);
            });
        });
    });
    describe('Mutation', () => {
        describe('createTodo', () => {
            it('should create a new todo', async () => {
                const result = await resolvers_1.resolvers.Mutation.createTodo({}, { title: 'New Todo' }, {}, {});
                expect(result.title).toBe('New Todo');
                expect(result.completed).toBe(false);
                // Verify it was saved to database
                const savedTodo = await Todo_1.default.findById(result.id);
                expect(savedTodo).toBeTruthy();
                expect(savedTodo === null || savedTodo === void 0 ? void 0 : savedTodo.title).toBe('New Todo');
            });
            it('should throw VALIDATION_ERROR for empty title', async () => {
                await expect(resolvers_1.resolvers.Mutation.createTodo({}, { title: '' }, {}, {})).rejects.toThrow('Title cannot be empty');
            });
        });
        describe('updateTodo', () => {
            it('should update todo completion status', async () => {
                const todo = await Todo_1.default.create({ title: 'Test Todo' });
                const result = await resolvers_1.resolvers.Mutation.updateTodo({}, { id: todo.id, completed: true }, {}, {});
                expect(result.completed).toBe(true);
            });
            it('should update todo title', async () => {
                const todo = await Todo_1.default.create({ title: 'Test Todo' });
                const result = await resolvers_1.resolvers.Mutation.updateTodo({}, { id: todo.id, completed: false, title: 'Updated Title' }, {}, {});
                expect(result.title).toBe('Updated Title');
            });
        });
        describe('deleteTodo', () => {
            it('should delete a todo', async () => {
                const todo = await Todo_1.default.create({ title: 'Test Todo' });
                const result = await resolvers_1.resolvers.Mutation.deleteTodo({}, { id: todo.id }, {}, {});
                expect(result).toBe(true);
                // Verify it was deleted from database
                const deletedTodo = await Todo_1.default.findById(todo.id);
                expect(deletedTodo).toBeNull();
            });
            it('should throw NOT_FOUND error for non-existent todo', async () => {
                await expect(resolvers_1.resolvers.Mutation.deleteTodo({}, { id: '123456789012' }, {}, {})).rejects.toThrow(apollo_server_express_1.ApolloError);
            });
        });
    });
});
