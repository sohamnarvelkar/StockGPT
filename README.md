<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1e1JgDA3cYAJM-DH12jN-UFInXxsIr01v

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set your Gemini API key in [.env.local](.env.local) as `GEMINI_API_KEY`, `API_KEY`, or `VITE_GOOGLE_API_KEY`
3. Run the app:
   `npm run dev`

## Deploying to Vercel

1. Push this repository to GitHub/GitLab.
2. Import the project in [Vercel](https://vercel.com).
3. Under **Settings > Environment Variables**, add:
   - `GEMINI_API_KEY` (or `VITE_GOOGLE_API_KEY`): Your Google Gemini API Key
4. Deploy! The included [vercel.json](file:///c:/Users/soham/Downloads/downloadstest/stockgpt/vercel.json) handles SPA routing rewrites automatically.

