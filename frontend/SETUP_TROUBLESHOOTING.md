# Frontend Setup Troubleshooting Guide

## Issues You're Encountering

Based on your terminal output, you're experiencing:

1. ✅ **EBADENGINE warnings** - React Router v7 requires Node 20+
2. ✅ **Tailwind init failure** - `npx tailwindcss init -p` command not working
3. ⚠️ **Security vulnerabilities** - 9 vulnerabilities (3 moderate, 6 high)

---

## Quick Fixes

### 1. Fix React Router Version Issue

**Problem:** You installed React Router v7 which requires Node 20+, but you have Node 18.19.1

**Solution:**
```bash
cd Daily_Bible/frontend

# Uninstall React Router v7
npm uninstall react-router-dom

# Install React Router v6 (compatible with Node 18)
npm install react-router-dom@6

# Verify installation
npm list react-router-dom
```

**Expected Output:**
```
react-router-dom@6.x.x
```

---

### 2. Fix Tailwind CSS Init Failure

**Problem:** `npx tailwindcss init -p` fails with "tailwind: not found"

**Solution Option 1 - Try with explicit version:**
```bash
npx tailwindcss@latest init -p
```

**Solution Option 2 - Manually create config files:**

Create `tailwind.config.js` in the frontend directory:
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Merriweather', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}
```

Create `postcss.config.js` in the frontend directory:
```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

**Verify Tailwind is working:**
```bash
# Check if config files exist
ls -la tailwind.config.js postcss.config.js

# Start the dev server
npm start
```

---

### 3. Handle Security Vulnerabilities

**Understanding the vulnerabilities:**
- Most are in development dependencies
- They won't affect your production build
- Safe to ignore during development

**Option 1 - Ignore for now (Recommended for development):**
Just continue working. These won't affect functionality.

**Option 2 - Fix non-breaking issues:**
```bash
npm audit fix
```

**Option 3 - Review vulnerabilities:**
```bash
npm audit
```

**Option 4 - Fix all (may cause breaking changes):**
```bash
npm audit fix --force
```

⚠️ **Warning:** `npm audit fix --force` may update packages to versions that break compatibility. Only use if you understand the risks.

---

## Complete Setup Verification

After applying the fixes above, verify everything is working:

```bash
cd Daily_Bible/frontend

# 1. Check installed packages
npm list react-router-dom
npm list tailwindcss

# 2. Verify config files exist
ls -la tailwind.config.js postcss.config.js

# 3. Start the development server
npm start
```

**Expected Result:**
- No EBADENGINE errors for React Router
- Development server starts successfully
- Browser opens at http://localhost:3000
- You see the React app running

---

## Next Steps After Setup

Once the setup is complete:

1. **Update `src/index.css`** with Tailwind directives:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

2. **Test Tailwind is working** by adding a class to `src/App.tsx`:
```tsx
<h1 className="text-3xl font-bold text-blue-600">
  Daily Bible App
</h1>
```

3. **Continue with Week 5 guide** - Follow the steps in `WEEK5_FRONTEND_FOUNDATION.md`

---

## Still Having Issues?

### Clear Everything and Start Fresh

If you're still having problems, try a clean reinstall:

```bash
cd Daily_Bible/frontend

# Remove node_modules and lock file
rm -rf node_modules package-lock.json

# Clear npm cache
npm cache clean --force

# Reinstall with correct versions
npm install
npm install react-router-dom@6
npm install -D tailwindcss@latest postcss@latest autoprefixer@latest

# Create Tailwind config manually (if init still fails)
# See "Solution Option 2" above

# Start the server
npm start
```

---

## Summary of Correct Versions

For Node 18.19.1, use these versions:

```json
{
  "dependencies": {
    "react": "^18.x.x",
    "react-dom": "^18.x.x",
    "react-router-dom": "^6.x.x",  // NOT v7
    "axios": "^1.x.x"
  },
  "devDependencies": {
    "@types/react-router-dom": "^5.x.x",
    "tailwindcss": "^3.x.x",
    "postcss": "^8.x.x",
    "autoprefixer": "^10.x.x"
  }
}
```

---

## Contact

If you continue to have issues after trying these solutions, please provide:
1. Output of `node --version`
2. Output of `npm --version`
3. Contents of `package.json`
4. Full error messages

Good luck with your Daily Bible app! 🙏
