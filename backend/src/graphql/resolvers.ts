import { IResolvers } from '@graphql-tools/utils';
import { ApolloError } from 'apollo-server-express';
import Todo from '../models/Todo';

interface Context {
  req: Request;
  res: Response;
  user?: {
    id: string;
    email: string;
  };
}

interface MongooseError extends Error {
  name: string;
  code?: number;
}

type Resolvers = {
  Query: {
    todos: (parent: any, args: { completed?: boolean }, context: any, info: any) => Promise<any[]>;
    todo: (parent: any, args: { id: string }, context: any, info: any) => Promise<any>;
  };
  Mutation: {
    createTodo: (parent: any, args: { title: string }, context: any, info: any) => Promise<any>;
    updateTodo: (parent: any, args: { id: string; completed?: boolean; title?: string }, context: any, info: any) => Promise<any>;
    deleteTodo: (parent: any, args: { id: string }, context: any, info: any) => Promise<boolean>;
  };
};

export const resolvers: Resolvers = {
  Query: {
    todos: async (_, { completed }: { completed?: boolean }) => {
      try {
        const filter = completed !== undefined ? { completed } : {};
        return await Todo.find(filter).sort({ createdAt: -1 });
      } catch (error: unknown) {
        const err = error as MongooseError;
        throw new ApolloError('Failed to fetch todos', 'DATABASE_ERROR', {
          originalError: err
        });
      }
    },
    todo: async (_, { id }: { id: string }) => {
      try {
        const todo = await Todo.findById(id);
        if (!todo) {
          throw new ApolloError('Todo not found', 'NOT_FOUND');
        }
        return todo;
      } catch (error: unknown) {
        const err = error as MongooseError;
        if (err.name === 'CastError') {
          throw new ApolloError('Invalid ID format', 'INVALID_ID');
        }
        throw new ApolloError('Failed to fetch todo', 'DATABASE_ERROR', {
          originalError: err
        });
      }
    },
  },
  Mutation: {
    createTodo: async (_, { title }: { title: string }) => {
      if (!title.trim()) {
        throw new ApolloError('Title cannot be empty', 'VALIDATION_ERROR');
      }

      try {
        const todo = new Todo({ title });
        return await todo.save();
      } catch (error: unknown) {
        const err = error as MongooseError;
        throw new ApolloError(
          'Failed to create todo',
          err.name === 'ValidationError' ? 'VALIDATION_ERROR' : 'DATABASE_ERROR',
          { originalError: err }
        );
      }
    },
    updateTodo: async (_, { id, completed, title }: { id: string; completed?: boolean; title?: string }) => {
      try {
        const updates: any = {
          updatedAt: new Date()
        };
        if (completed !== undefined) {
          updates.completed = completed;
        }
        if (title !== undefined) {
          if (!title.trim()) {
            throw new ApolloError('Title cannot be empty', 'VALIDATION_ERROR');
          }
          updates.title = title;
        }
        
        const todo = await Todo.findByIdAndUpdate(
          id,
          updates,
          { new: true, runValidators: true }
        );
        
        if (!todo) {
          throw new ApolloError('Todo not found', 'NOT_FOUND');
        }
        
        return todo;
      } catch (error: unknown) {
        const err = error as MongooseError;
        if (err.name === 'CastError') {
          throw new ApolloError('Invalid ID format', 'INVALID_ID');
        }
        throw new ApolloError(
          'Failed to update todo',
          err.name === 'ValidationError' ? 'VALIDATION_ERROR' : 'DATABASE_ERROR',
          { originalError: err }
        );
      }
    },
    deleteTodo: async (_, { id }: { id: string }) => {
      try {
        const todo = await Todo.findByIdAndDelete(id);
        if (!todo) {
          throw new ApolloError('Todo not found', 'NOT_FOUND');
        }
        return true;
      } catch (error: unknown) {
        const err = error as MongooseError;
        if (err.name === 'CastError') {
          throw new ApolloError('Invalid ID format', 'INVALID_ID');
        }
        throw new ApolloError('Failed to delete todo', 'DATABASE_ERROR', {
          originalError: err
        });
      }
    },
  },
};
