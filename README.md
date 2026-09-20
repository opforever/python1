# Python Sanctuary Playground 🌿

A serene, beginner-friendly Python web playground featuring a real WebAssembly CPython 3.12 engine, full interactive standard library support, procedural ambient soundscapes, and an encouraging AI tutor.

---

## 🚀 Getting Started on Your Laptop

### Prerequisites
- **Node.js**: Version 18.0 or higher (Node 20+ recommended)
- **npm** (comes with Node.js)

### Installation
1. Extract or clone this folder to your laptop.
2. Open your terminal in this directory and install dependencies:
   ```bash
   npm install
   ```

---

## 🏃‍♂️ Running the Application

### Option 1: Development Mode (Recommended)
Runs the full-stack app with hot-reload and AI tutor endpoint:
```bash
npm run dev
```
Once started, open your web browser to:
👉 **[http://localhost:3000](http://localhost:3000)**

*(Note: On Windows and macOS, access via `localhost:3000` rather than `0.0.0.0:3000`)*

---

### Option 2: Production Build & Start
Build the optimized client bundle and start the standalone server:
```bash
npm run build
npm start
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

### Option 3: Standalone Client (Static Mode)
If you just want to practice Python offline without the AI tutor:
```bash
npm run build
npm run preview
```

---

## 🔑 Environment Variables (Optional)

If you wish to use the **Zen Sensei AI Tutor** feature on your laptop:
1. Create a `.env` file in the root folder:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
2. Get a free API key at [Google AI Studio](https://aistudio.google.com).
3. The Python code execution, variable inspector, stdin terminal, and ambient soundscapes work 100% locally in your browser even without an API key!

---

## 💡 Troubleshooting

- **Blank or White Screen?**
  - Make sure you are accessing **http://localhost:3000** in your browser, not `file:///.../index.html`.
  - Modern web applications require a local HTTP server to load WebAssembly modules and ES modules properly.
  - If you encounter any ripple, the built-in **Serene Recovery** Error Boundary provides one-click reload and workspace reset buttons.
- **Port 3000 Already in Use?**
  - If another application is running on port 3000, you can change `const PORT = 3000;` in `server.ts` to another port (such as `3001` or `8080`).
- **Python Engine Initialization:**
  - On first launch, the Pyodide WebAssembly runtime downloads in the background (~15MB, cached automatically by your browser for future sessions).
