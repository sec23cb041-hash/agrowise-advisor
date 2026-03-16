# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

### Frontend → Vercel

1. Push this repo to GitHub
2. Import the repo at [vercel.com](https://vercel.com)
3. Set these environment variables in Vercel dashboard:
   - `VITE_API_BASE_URL` → your Railway backend URL (e.g. `https://your-app.railway.app`)
   - `VITE_ML_BASE_URL` → your Render ML service URL (e.g. `https://your-ml.onrender.com`)
4. Deploy — Vercel auto-detects Vite

### Backend (Node.js) → Railway

1. Create a new project at [railway.app](https://railway.app)
2. Connect your GitHub repo, set root directory to `backend/`
3. Add environment variables from `backend/.env.example`
4. Railway uses `railway.toml` — start command is `node src/server.js`

### ML Service (FastAPI) → Render

1. Create a new Web Service at [render.com](https://render.com)
2. Connect your GitHub repo, set root directory to `ml_service/`
3. Add environment variables from `ml_service/.env.example`
4. Render uses `render.yaml` — start command is `uvicorn main:app --host 0.0.0.0 --port $PORT`

> Note: ML models (`.pkl`, `.h5`) are excluded from git. Run the train scripts after deployment:
> ```bash
> python train_crop_model.py
> python train_weather_model.py
> ```

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)

## Starting the Platform

```
npm install
npm run dev:all
```

This starts all three services in a single terminal — no PowerShell policy changes needed:

- Frontend (React/Vite) → http://localhost:5173
- Backend (Node.js)     → http://localhost:3000
- ML AI Service (FastAPI) → http://localhost:8000

The launcher (`start-dev.js`) uses Node's `child_process.spawn` directly, bypassing PowerShell entirely. It also auto-trains the weather model if `rainfall_model.pkl` is missing.

Press `Ctrl+C` to stop all services.
