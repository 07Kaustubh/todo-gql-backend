import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  type Todo {
    id: ID!
    title: String!
    completed: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  type Query {
    todos(completed: Boolean): [Todo]
    todo(id: ID!): Todo
  }

  type Mutation {
    createTodo(title: String!): Todo
    updateTodo(id: ID!, completed: Boolean!, title: String): Todo
    deleteTodo(id: ID!): Boolean
  }
`;
