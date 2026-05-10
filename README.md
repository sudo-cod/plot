# Plot — A Garden of Tasks

Plot is a beautiful task management app using a garden metaphor. Visualize your tasks as growing plants, organized by type (daily, weekly, monthly, one-off, and progress tracking).

## Features

- **Garden View**: Visualize tasks as plants that grow based on completion
- **List View**: Traditional task list view
- **Harvest View**: See completed tasks
- **Task Types**: Daily habits, weekly goals, monthly targets, one-off tasks, and progress tracking
- **Color Schemes**: Choose from Meadow, Twilight, Dawn, and Moss themes
- **Multilingual Support**: Switch between English and Chinese (中文) — your language preference is remembered
- **Data Persistence**: All your tasks, preferences, and language choice are saved to your browser's local storage
- **Free Hosting**: Deploy to Vercel with a single click

## Getting Started

### Run Locally

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/plot.git
   cd plot
   ```

2. Open in browser:
   ```bash
   open public/index.html
   ```
   Or simply double-click `public/index.html` in Finder.

3. Start adding tasks! All data is automatically saved to your browser.

### Deploy to Vercel (Free)

1. Push to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/plot.git
   git push -u origin main
   ```

2. Connect to Vercel:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Click "Deploy"

Your app is now live! Share the URL with anyone who wants to use it.

## Language Settings

Plot supports English and Chinese (中文). To change the language:

1. Look for the **Language** option in the Tweaks panel (bottom-right corner, gear icon)
2. Select either **English** or **中文**
3. All UI text updates immediately
4. Your language preference is automatically saved and restored when you return

Supported languages:
- **English** — Full UI translation
- **中文 (Chinese)** — 完整中文界面翻译

## Data Storage

All tasks, preferences, and language choice are stored in your browser's `localStorage`:
- **Tasks**: Stored under `plot-tasks`
- **Preferences**: Stored under `plot-tweaks`
- **Language**: Stored under `plot-lang`

Your data persists across browser sessions. To export your tasks, open the browser console and run:
```javascript
JSON.parse(localStorage.getItem('plot-tasks'))
```

To clear all data:
```javascript
localStorage.clear()
```

## Architecture

- **Tech**: React 18 (via CDN)
- **No build step**: Uses Babel standalone for JSX transpilation
- **No database**: All data stored locally in the browser
- **Free hosting**: Works great on Vercel's free tier

## Files

- `public/index.html` - Main HTML file with styling
- `public/app.jsx` - Main App component and state management
- `public/components.jsx` - Layout and container components
- `public/components2.jsx` - Task detail, add task, list, and harvest views
- `public/plants.jsx` - Plant visualization components
- `public/tweaks-panel.jsx` - Settings panel

## License

MIT
