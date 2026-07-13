# 💬 PanelGPT — Full-Stack AI Debate Simulator

[![Live Demo](https://img.shields.io/badge/demo-online-brightgreen.svg?style=for-the-badge)](YOUR_VERCEL_DEPLOYMENT_URL)
[![Backend Status](https://img.shields.io/badge/backend-Render-indigo.svg?style=for-the-badge)](https://render.com)

PanelGPT is a production-quality, full-stack AI web application that simulates a live panel debate among multiple distinct AI personalities. A user enters any topic, and a panel of AI personas (Scientist, Contrarian, Visionary, Philosopher, street advocate, satirist, etc.) each respond with their unique perspective in real-time.

Built as a Final Year Major Project, it demonstrates modern clean architecture, secure token-based authentication, real-time polling debate rounds, and responsive UI/UX.

---

## 🚀 LIVE DEMO
You can access the live running application here:
👉 **[Launch PanelGPT Simulator](YOUR_VERCEL_DEPLOYMENT_URL)**

---

## 🏗️ SYSTEM ARCHITECTURE

```
                       +-----------------------------+
                       |        React Frontend       |
                       |  (Vite, Tailwind, Motion)   |
                       |       Hosted on Vercel      |
                       +--------------+--------------+
                                      |
                           HTTP REST  |
                                      v
                       +-----------------------------+
                       |     Spring Boot Backend     |
                       | (Spring Security, JPA, Web) |
                       |       Hosted on Render      |
                       +-------+--------------+------+
                               |              |
                 JPA/Hibernate |              | HTTP REST
                               v              v
                       +-------+------+ +-----+------+
                       |  TiDB Cloud  | |  Groq API  |
                       |  (Serverless) | | (Llama 3.1) |
                       +--------------+ +------------+
```

---

## 🛠️ TECH STACK & REQUIREMENTS

*   **Frontend:** React.js, Vite, Tailwind CSS v3, Framer Motion, Axios (Hosted on **Vercel**)
*   **Backend:** Spring Boot 3.2.0, Spring Security 6.x, Spring Data JPA, Lombok, Jakarta Validation (Hosted on **Render**)
*   **Database:** TiDB Cloud Serverless (MySQL-compatible, cloud-native)
*   **AI Engine:** Groq API running `llama-3.1-8b-instant` cloud model
*   **Auth:** JWT (Access Token in-memory, Refresh Token in HttpOnly Secure Cookie) + BCrypt

---

## ⚙️ ENVIRONMENT CONFIGURATION

### Backend Configuration (Render Environment Variables)

Configure these variables in your Render backend settings:

| Variable | Description | Example Value |
| :--- | :--- | :--- |
| `SPRING_DATASOURCE_URL` | JDBC URL for TiDB Cloud | `jdbc:mysql://gateway01.ap-southeast-1.prod.aws.tidbcloud.com:4000/test?useSSL=true&requireSSL=true&verifyServerCertificate=false` |
| `SPRING_DATASOURCE_USERNAME` | TiDB Cloud Username | `2XZT5WD3rgoSQse.root` |
| `SPRING_DATASOURCE_PASSWORD` | TiDB Cloud Password | `your_tidb_password` |
| `GROQ_API_KEY` | Groq Cloud AI API Key | `gsk_xxxx...` |
| `JWT_SECRET` | 256-bit JWT secret signature key | `panelgpt-super-secret-key-change-this-in-production-min-256-bits-abc123` |
| `CORS_ORIGIN` | Allowed Client Vercel URL | `https://your-app-name.vercel.app` |

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
*   `POST /api/auth/reset-password` - Reset account password by matching email and username.

### Debate Simulator
*   `POST /api/debate/generate-round` - Generate a single round of responses for all 6 personas in parallel. *(Protected)*
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
