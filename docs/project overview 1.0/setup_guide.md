# Local Development Setup Guide (Mac M1/Intel)

Follow these steps to set up the My Green Loop project on your local machine.

## 1. Prerequisites

Ensure you have the following installed:

### Node.js (v20 LTS recommended)
Download and install from [nodejs.org](https://nodejs.org/) or use a version manager like `nvm`:
```bash
nvm install 20
nvm use 20
```
> [!IMPORTANT]
> **Important:** Always run `nvm use 20` in your terminal before issuing any `npm` commands to ensure you are using the correct version.

### PostgreSQL (Database)
**Version 14 or higher is recommended.**
The easiest way to run PostgreSQL on a Mac is using **Postgres.app**:
1. Download and install [Postgres.app](https://postgresapp.com/).
2. Open the app and click "Initialize" to create a default server.
3. Ensure the server is running (you should see a green "Running" status).

---

## 2. Project Setup

### Clone the Repository
```bash
git clone <repository-url>
cd my-green-loop
```

### Install Dependencies
1. Ensure you are on Node 20: `nvm use 20`
2. Install all required packages:
   ```bash
   npm install
   ```
3. **Intel Mac Fix (Dependency Update):** If you encounter missing package errors during startup, run:
   ```bash
   npm install parse5 parse5-htmlparser2-tree-adapter htmlparser2 dom-serializer parse5-parser-stream
   ```
   *(These ensure the HTML parsing tools used in the project are correctly linked on your system.)*

---

## 3. Database Configuration

1. **Create the Database:**
   If `createdb` is not in your path, use the Postgres.app GUI:
   - Double-click the **postgres** cylinder icon in Postgres.app.
   - In the terminal that opens, run:
     ```sql
     CREATE DATABASE my_green_loop;
     ```

2. **Configure Environment Variables:**
   Create a `.env` file in the root of the project:
   ```env
   # Database Connection String
   DATABASE_URL=postgresql://localhost:5432/my_green_loop

   # Session Secret (random string)
   SESSION_SECRET=supersecretkey123
   ```

3. **Initialize Schema & Data:**
   Run these commands in your VS Code terminal:
   ```bash
   npm run db:push
   ```
   
   Seed initial data (Categories):
   ```bash
   node --env-file=.env --import tsx/esm db/seed-categories.ts
   ```

---

## 4. Running the Application

Start the development server:
```bash
npm run dev
```

The application should now be running at **http://localhost:5000**.

---

## Troubleshooting Summary

### "createdb: command not found"
Use **Option 2** (GUI method) in the Database Configuration section above.

### "DATABASE_URL must be set"
Ensure your `.env` file is in the root directory and you are running the `node --env-file=.env` version of the seed command.

### "Error [ERR_MODULE_NOT_FOUND]"
This usually means a dependency is missing. Run the **Intel Mac Fix** command in Section 2.
