# Real-time Collaborative Canvas - Take-Home Assignment

Multi-user rectangle editor with real-time synchronization using Socket.io and React.

## ✅ Requirements Delivered

- Real-time collaboration across multiple clients
- Rectangle CRUD operations (add, move, delete via drag & drop)
- Socket.io implementation with robust error handling
- Clean, maintainable TypeScript codebase

## 🏗️ Architecture Decisions

**Generic Socket System:** Built modular namespaces instead of hardcoding rectangles - new features can be added in minutes.

**Clean Architecture:** Repository → Service → Controller pattern with dependency injection for testability and maintainability.

**Context-Based Frontend:** Feature-isolated React contexts prevent coupling and enable parallel development.

**Full TypeScript:** Generic socket event typing prevents runtime errors and improves developer experience.

## 🛠️ Tech Stack

- **Backend:** Node.js, Express, Socket.io, TypeScript
- **Frontend:** React, TypeScript, Konva (canvas), Tailwind CSS
- **Architecture:** Clean separation of concerns, dependency injection

## 🚀 Quick Start

```bash
# Backend
cd backend && npm install && npm run dev

# Frontend
cd frontend && npm install && npm run dev
```

Open multiple tabs to `http://localhost:5173` to test real-time sync.

## 📁 Key Files

```
backend/src/
├── sockets/namespaces/RectangleNamespace.ts  # Socket handling
├── controllers/RectangleController.ts        # Business coordination
├── services/RectangleService.ts             # Business logic
└── repositories/InMemoryRectangleRepository.ts

frontend/src/
├── features/rectangles/contexts/RectangleContext.tsx  # State management
├── features/rectangles/components/RectangleCanvas.tsx # Canvas UI
└── contexts/SocketContext.tsx                        # Generic socket handling
```

## 🎯 Why This Architecture?

**Extensibility:** Adding chat, analytics, or any real-time feature takes ~1 hour vs. days of refactoring.

**Maintainability:** Clean separation means services can be tested in isolation, repositories can be swapped (memory → database), and features don't interfere.

**Production Ready:** Health monitoring, error handling, connection resilience, and type safety throughout.

## 🔮 Next Steps

- Database persistence (repository pattern makes this trivial)
- Authentication middleware (already structured for it)
- Advanced canvas features (undo/redo, shapes)

**Time Investment:** ~2 hours
**Focus:** Scalable architecture over feature quantity
