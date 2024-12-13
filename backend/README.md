# Todo List GraphQL API Documentation

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)

### MongoDB Connection
1. Local MongoDB:   ```bash
   # Start MongoDB locally
   mongod   ```
   The API will connect to: `mongodb://localhost:27017/todolist`

2. MongoDB Atlas:
   - Replace the connection URL in `src/index.ts` with your Atlas connection string:   ```typescript
   await mongoose.connect('your_mongodb_atlas_url');   ```

## API Reference

### Queries

#### Get All Todos

Query:

    todos: Fetches all to-do items.
    todo(id: ID!): Fetches a specific to-do by its ID.

Mutation:

    createTodo(title: String!): Adds a new to-do.
    updateTodo(id: ID!, completed: Boolean!): Updates the completion status of a to-do.
    deleteTodo(id: ID!): Deletes a to-do item.