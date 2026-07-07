# PanelGPT — Full-Stack AI Debate Simulator

PanelGPT is a production-quality, full-stack AI web application that simulates a live panel debate among multiple distinct AI personalities. A user enters any topic, and a panel of AI personas (Scientist, Contrarian, Visionary, Philosopher, street advocate, satirist, etc.) each respond with their unique perspective in real-time.

Built as a Final Year Major Project, it demonstrates modern clean architecture, secure token-based authentication, server-sent events (SSE) real-time streaming, and responsive UI/UX.

---

## 🏗️ SYSTEM ARCHITECTURE

```
                      +-----------------------------+
                      |        React Frontend       |
                      |  (Vite, Tailwind, Motion)   |
                      +--------------+--------------+
                                     |
                         HTTP / SSE  | (Proxy: 5173 -> 8080)
                                     v
                      +-----------------------------+
                      |     Spring Boot Backend     |
                      | (Spring Security, JPA, Web) |
                      +-------+--------------+------+
                              |              |
                JPA/Hibernate |              | HTTP REST
                              v              v
                      +-------+------+ +-----+------+
                      |   MySQL 8.x  | | Ollama API |
                      |  (Database)  | |  (Llama 3) |
                      +--------------+ +------------+
```

---

## 🛠️ TECH STACK & REQUIREMENTS

*   **Frontend:** React.js, Vite, Tailwind CSS v3, Framer Motion, Axios
*   **Backend:** Spring Boot 3.2.0, Spring Security 6.x, Spring Data JPA, Lombok, Jakarta Validation
*   **Database:** MySQL 8.0.46
*   **AI Engine:** Ollama (Local) running `llama3` (8B) model
*   **Auth:** JWT (Access Token in-memory, Refresh Token in HttpOnly Secure Cookie) + BCrypt

---

## ⚙️ ENVIRONMENT CONFIGURATION

### Backend Configuration (`backend/.env` or system environment)
Create a `.env` file inside the `backend` directory (see `backend/.env.example` as template) or set these variables:

| Variable | Description | Default Value |
| :--- | :--- | :--- |
| `DB_USER` | MySQL Username | `root` |
| `DB_PASS` | MySQL Password | *(empty)* |
| `JWT_SECRET` | 256-bit JWT secret signature key | `panelgpt-super-secret-key-change-this-in-production-min-256-bits-abc123` |
| `OLLAMA_URL` | Local Ollama Service Endpoint | `http://localhost:11434` |
| `OLLAMA_MODEL` | Installed LLM Model | `llama3` |
| `CORS_ORIGIN` | Allowed Client Origin | `http://localhost:5173` |

---

## 🚀 SETUP & RUN GUIDE

### Prerequisites
1.  **Java SDK 17** or higher
2.  **Node.js 18+** & npm
3.  **MySQL Server 8.0.46
4.  **Ollama** installed and running (`ollama serve`)
    *   Pull the llama3 model: `ollama pull llama3`

### Step 1: Database Setup
Login to your MySQL CLI and create the schema:
```sql
CREATE DATABASE panelgpt CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```
*(The Spring Boot backend will auto-generate/update the table structures upon initial start via JPA ddl-auto).*

### Step 2: Running the Backend
1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```
2.  Create your `.env` configuration file from the template and fill in your MySQL credentials:
    ```bash
    cp .env.example .env
    ```
3.  Run the application using Maven:
    ```bash
    mvn spring-boot:run
    ```
    The backend will start and listen on port **`8080`**.

### Step 3: Running the Frontend
1.  Navigate to the frontend directory:
    ```bash
    cd frontend
    ```
2.  Install all required npm dependencies:
    ```bash
    npm install
    ```
3.  Start the Vite local development server:
    ```bash
    npm run dev
    ```
    Open your browser and navigate to **`http://localhost:5173`**.

---

## 🤖 AI PERSONAS DETAILED LIST

1.  🔬 **Dr. Elena Voss (Empirical Scientist):** Relies on data, logic, research findings, and challenges non-empirical assumptions.
2.  ⚡ **Rex Holloway (Fierce Contrarian):** Intentionally challenges the dominant narrative, playing the advocate for the opposing view.
3.  🚀 **Zara Osei (Futurist Visionary):** Focuses on positive possibilities, innovation, and long-term societal progress.
4.  🏛️ **Prof. Kiran Mehta (Stoic Philosopher):** Explores first principles, Socratic questioning, and classic schools of thought.
5.  🗣️ **Jordan Reyes (People's Voice):** Simplifies intellectual abstractions to focus on concrete, everyday human impact.
6.  🎭 **Maxine Draper (Political Satirist):** Exposes contradictions, absurdities, and hypocrisies using biting irony and humor.

---

## 🔐 API ENDPOINTS DOCUMENTATION

### Authentication
*   `POST /api/auth/register` - Create user account. Returns JWT access token & sets refresh token cookie.
*   `POST /api/auth/login` - Sign in. Returns user profile & JWT access token.
*   `POST /api/auth/refresh` - Request a new JWT access token using the HTTP-only cookie.
*   `POST /api/auth/logout` - Clear the session and refresh cookie.

### Debate Simulator
*   `GET /api/debate/stream?topic={topic}` - Server-Sent Events (SSE) debate streamer. Seq-calls Ollama. *(Protected)*
*   `POST /api/debate/save` - Persist completed debate session to History. *(Protected)*
*   `GET /api/personas` - Retrieve available debaters list. *(Public)*

### History & User Profile
*   `GET /api/history` - Fetch paginated user debate records. *(Protected)*
*   `GET /api/history/{id}` - Get full message log of a single debate. *(Protected)*
*   `DELETE /api/history/{id}` - Delete a debate session. *(Protected)*
*   `GET /api/user/profile` - Fetch current user info. *(Protected)*
*   `PUT /api/user/profile` - Edit display name, avatar, and persona preferences list. *(Protected)*
*   `PUT /api/user/password` - Change account password. *(Protected)*
*   `GET /api/user/stats` - Fetch user statistics (e.g. favorite topic, debates this week). *(Protected)*

---

## 🛠️ TROUBLESHOOTING & KNOWN ISSUES

1.  **Connection Refused to Ollama:**
    Ensure Ollama is running (`ollama list` should respond successfully in your terminal).
2.  **MySQL Database Issues:**
    Verify your MySQL server is running, the `panelgpt` schema is created, and the password matches `.env` exactly.
3.  **Vite Port in Use:**
    If port 5173 is already running another application, Vite will dynamically fall back to another port (e.g., 5174). Check the Vite terminal output to navigate to the correct URL.
