# Issue Management System

A modular issue management system with React frontend and Node.js backend.

## Project Structure

```
├── client/          # React frontend with TypeScript and MUI
├── server/          # Node.js backend with Express and MongoDB
└── README.md
```

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (running locally or remote connection)
- npm or yarn

## Getting Started

### 1. Server Setup

```bash
cd server
npm install
```

Create a `.env` file in the server directory:
```
NODE_ENV=development
PORT=3001
MONGODB_URI=mongodb://localhost:27017/issues
```

Start the server:
```bash
# Development mode
npm run dev

# Production mode
npm run build
npm start
```

### 2. Client Setup

```bash
cd client
npm install
```

Set environment variables in `.env.local`:
```
VITE_API_URL=http://localhost:3001
```

Start the client:
```bash
npm run dev
```

## API Endpoints

- `GET /api/issues/tree/:treeId` - Get all issues for a tree
- `GET /api/issues/:issueId` - Get specific issue
- `POST /api/issues` - Create new issue
- `PUT /api/issues/:issueId` - Update issue
- `DELETE /api/issues/:issueId` - Delete issue
- `POST /api/issues/:issueId/comments` - Add comment
- `PATCH /api/issues/:issueId/resolve` - Resolve issue

## Features

- Issue creation, editing, and deletion
- Status tracking (open, in_progress, resolved, closed)
- Priority levels (low, medium, high, urgent)
- Comment system
- Tree and node association
- Filtering and sorting
- Modern Material-UI interface

## Integration

This system is designed to be integrated as a module into larger projects. The frontend component accepts `treeId` and optional `nodeId` props to filter issues for specific parts of your application.

```jsx
<IssueList treeId="your-tree-id" nodeId="optional-node-id" />
``` 