# Deploying Plot to Vercel

Your Plot app is ready to deploy to Vercel for free! Follow these steps:

## Step 1: Create a GitHub Repository

1. Go to [github.com/new](https://github.com/new)
2. Create a new repository named `plot` (or your preferred name)
3. Do NOT initialize with README (we already have one)
4. Click "Create repository"

## Step 2: Push to GitHub

Copy the commands from GitHub after creating the repo. They'll look like:

```bash
cd ~/Documents/plot
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/plot.git
git push -u origin main
```

Replace `YOUR-USERNAME` with your actual GitHub username.

## Step 3: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Click "Import Git Repository"
4. Paste your GitHub repo URL: `https://github.com/YOUR-USERNAME/plot.git`
5. Click "Import"
6. Vercel will auto-detect the settings (no build needed)
7. Click "Deploy"

Your app is now live! Vercel will give you a URL like `https://plot-xxxxx.vercel.app`

## Step 4: Update GitHub Remote (Optional)

If your GitHub repo is different from what's in the remote:

```bash
cd ~/Documents/plot
git remote -v  # Check current remote
git remote set-url origin https://github.com/YOUR-USERNAME/plot.git  # Update if needed
```

## What Happens Next?

- Every time you push to GitHub, Vercel automatically redeploys
- Your app is always live at your Vercel URL
- All tasks and preferences are stored in browser localStorage

## Local Development

To work locally:

```bash
cd ~/Documents/plot
open public/index.html
```

Or use a local server (if you have Python 3):

```bash
cd public
python3 -m http.server 8000
# Then visit http://localhost:8000
```

## Troubleshooting

**"500 error" after deploying?**
- Make sure `vercel.json` is in your root directory
- Check that all files in `/public` are committed to git

**Tasks not saving?**
- Check browser console for localStorage errors
- Try clearing localStorage and reloading: `localStorage.clear()`

**Vercel can't import your repo?**
- Make sure your GitHub repo is public (or you're signed in)
- Check that git remote is correct: `git remote -v`
