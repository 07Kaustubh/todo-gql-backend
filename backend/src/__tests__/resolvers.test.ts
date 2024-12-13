import { ApolloError } from 'apollo-server-express';
import { resolvers } from '../graphql/resolvers';
import Todo from '../models/Todo';

describe('Todo Resolvers', () => {
  describe('Query', () => {
    describe('todos', () => {
      it('should return all todos when no filter is provided', async () => {
        // Create test todos
        await Todo.create([
          { title: 'Todo 1', completed: false },
          { title: 'Todo 2', completed: true }
        ]);

        const result = await resolvers.Query.todos({}, {}, {} as any, {} as any);
        expect(result).toHaveLength(2);
      });

      it('should filter todos by completion status', async () => {
        // Create test todos
        await Todo.create([
          { title: 'Todo 1', completed: false },
          { title: 'Todo 2', completed: true }
        ]);

        const completedTodos = await resolvers.Query.todos(
          {},
          { completed: true },
          {} as any,
          {} as any
        );
        expect(completedTodos).toHaveLength(1);
        expect(completedTodos[0].completed).toBe(true);
      });
    });

    describe('todo', () => {
      it('should return a specific todo by ID', async () => {
        const todo = await Todo.create({ title: 'Test Todo' });

        const result = await resolvers.Query.todo(
          {},
          { id: todo.id },
          {} as any,
          {} as any
        );
        expect(result.title).toBe('Test Todo');
      });

      it('should throw NOT_FOUND error for non-existent todo', async () => {
        await expect(
          resolvers.Query.todo({}, { id: '123456789012' }, {} as any, {} as any)
        ).rejects.toThrow(ApolloError);
      });
    });
  });

  describe('Mutation', () => {
    describe('createTodo', () => {
      it('should create a new todo', async () => {
        const result = await resolvers.Mutation.createTodo(
          {},
          { title: 'New Todo' },
          {} as any,
          {} as any
        );

        expect(result.title).toBe('New Todo');
        expect(result.completed).toBe(false);

        // Verify it was saved to database
        const savedTodo = await Todo.findById(result.id);
        expect(savedTodo).toBeTruthy();
        expect(savedTodo?.title).toBe('New Todo');
      });

      it('should throw VALIDATION_ERROR for empty title', async () => {
        await expect(
          resolvers.Mutation.createTodo({}, { title: '' }, {} as any, {} as any)
        ).rejects.toThrow('Title cannot be empty');
      });
    });

    describe('updateTodo', () => {
      it('should update todo completion status', async () => {
        const todo = await Todo.create({ title: 'Test Todo' });

        const result = await resolvers.Mutation.updateTodo(
          {},
          { id: todo.id, completed: true },
          {} as any,
          {} as any
        );

        expect(result.completed).toBe(true);
      });

      it('should update todo title', async () => {
        const todo = await Todo.create({ title: 'Test Todo' });

        const result = await resolvers.Mutation.updateTodo(
          {},
          { id: todo.id, completed: false, title: 'Updated Title' },
          {} as any,
          {} as any
        );

        expect(result.title).toBe('Updated Title');
      });
    });

    describe('deleteTodo', () => {
      it('should delete a todo', async () => {
        const todo = await Todo.create({ title: 'Test Todo' });

        const result = await resolvers.Mutation.deleteTodo(
          {},
          { id: todo.id },
          {} as any,
          {} as any
        );

        expect(result).toBe(true);

        // Verify it was deleted from database
        const deletedTodo = await Todo.findById(todo.id);
        expect(deletedTodo).toBeNull();
      });

      it('should throw NOT_FOUND error for non-existent todo', async () => {
        await expect(
          resolvers.Mutation.deleteTodo(
            {},
            { id: '123456789012' },
            {} as any,
            {} as any
          )
        ).rejects.toThrow(ApolloError);
      });
    });
  });
}); 