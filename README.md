# Leticia

A lightweight Node.js web framework built for learning how web frameworks work under the hood.

## Basic usage

```typescript
import { leticia } from "@ruangustavo/leticia";

const app = leticia();

// Add middleware
app.use((req, res, next) => {
  console.log("Request received");
  next();
});

// Define routes
app.get("/users", (req, res) => {
  res.send({ users: ["Ruan", "Gustavo"] });
});

app.post("/users", (req, res) => {
  res.send({ message: "User created", data: req.body });
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
```

## Why build your own framework?

Building a web framework teaches you:

- How HTTP servers work internally
- The role of middleware in request processing
- How routing systems match URLs to handlers
- The importance of clean abstractions in API design
