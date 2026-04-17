# Vikara-Chess ♟️

Derived from the Sanskrit word **विकार (Vikāra)**, meaning **change** or **transformation**. 

**Vikara Chess** is a unique chess variant that introduces the **Vikara Rule**: when a piece is captured, the capturing piece transforms into the same type as the captured piece, but retains the color of the player who made the capture. This version has been re-engineered as a **production-ready, scalable full-stack application**.

## 🧠 The Vikara Rule
- **Transformation**: Capture an opponent's knight with your pawn? Your pawn becomes a knight.
- **No Transformation of King**: The King remains unchanged regardless of capture.
- **Strategic Depth**: Players must factor in the consequences of capturing pieces, as it fundamentally changes their board composition.

---

## 🚀 Technical Overhaul & Architecture

### 1. Horizontal Scalability (Redis)
Standard Socket.io implementations are limited to a single server instance. I implemented the **@socket.io/redis-adapter** to allow the application to scale horizontally across multiple instances. This ensures seamless real-time interaction via a shared Redis Pub/Sub layer.

### 2. Authoritative Server-Side Logic
To prevent client-side manipulation, I moved the core game engine to the backend. The client only emits move coordinates (`from`, `to`), which are validated by a server-side **chess.js** instance. The server is the sole source of truth for the game state (FEN).

### 3. Production Ops & DevOps
- **Dockerization**: Optimized `Dockerfile` using multi-stage builds and Alpine linux to minimize the image footprint.
- **Security**: The container runs as a non-root user.
- **Resilience**: Added automated health checks for reliable orchestration.
- **Environment**: Managed via `dotenv` for clean configuration.

## 🛠️ Tech Stack
- **Backend**: Node.js, Express, Socket.io
- **Scaling**: Redis (Pub/Sub Adapter)
- **Validation**: Chess.js
- **Frontend**: HTML5, Vanilla CSS, JQuery
- **Deployment**: Docker, Docker Compose

---

## 🚦 Getting Started

### Prerequisites
- Node.js (v18+)
- (Optional) Docker for scalable local testing

### Local Development
1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```

### Scalable Local Environment (Docker)
Launch two application instances and a Redis database to test the horizontal scaling:
```bash
docker compose up --build
```

## 📬 Deployment
This application is ready for deployment on **Railway**, **Render**, or **Fly.io**. Simply provide a `REDIS_URL` in the environment variables to activate the scaling layer.
