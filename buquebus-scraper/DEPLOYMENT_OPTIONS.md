# Deployment Options for Buquebus Scraper

The Puppeteer scraping functionality requires specific browser environments. Here are the best deployment options ranked by Puppeteer compatibility:

## 🚀 **Recommended Options**

### 1. **Vercel** (Best for Serverless + Puppeteer)
Vercel has optimized Chrome support for serverless functions.

**Deploy Steps:**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

**Advantages:**
- Built-in Puppeteer optimization
- Fast cold starts
- Automatic HTTPS
- Easy custom domains

**Configuration:** `vercel.json` already included

---

### 2. **Railway** (Persistent Containers)
Railway provides traditional server environment with persistent containers.

**Deploy Steps:**
1. Push to GitHub
2. Connect GitHub repo to Railway
3. Deploy automatically

**Advantages:**
- Persistent containers (better for Puppeteer)
- Generous free tier
- Simple deployment
- Built-in monitoring

**URL:** https://railway.app

---

### 3. **Render** (Good Node.js Support)
Render offers excellent Node.js hosting with good Puppeteer support.

**Deploy Steps:**
1. Push to GitHub
2. Connect GitHub repo to Render
3. Deploy as Web Service

**Advantages:**
- Excellent Node.js support
- Free tier available
- Automatic SSL
- Easy scaling

**Configuration:** `render.yaml` already included

---

### 4. **Docker Deployment** (Maximum Control)
Deploy anywhere that supports Docker containers.

**Deploy Steps:**
```bash
# Build image
docker build -t buquebus-scraper .

# Run locally
docker run -p 3000:3000 buquebus-scraper

# Deploy to any Docker platform (Fly.io, DigitalOcean, AWS, etc.)
```

**Platforms that support Docker:**
- **Fly.io** - Great for global deployment
- **DigitalOcean App Platform** - Simple container hosting
- **AWS ECS/Fargate** - Enterprise-grade
- **Google Cloud Run** - Serverless containers

---

## 🔧 **Quick Fixes for Current Deployment**

### Option A: Use Improved Serverless Version
I've created `pages/api/scrape-serverless.js` with better Chrome support:

1. Install additional dependencies:
```bash
cd buquebus-scraper
bun add @sparticuz/chromium puppeteer-core
```

2. Update your form to use the new endpoint:
```javascript
// In src/app/page.tsx, change the API call:
const response = await fetch(`/api/scrape-serverless?${params.toString()}`);
```

### Option B: Deploy to Vercel Right Now
```bash
# From your project directory:
npx vercel --prod
```

### Option C: Try Railway
1. Go to https://railway.app
2. "Deploy from GitHub"
3. Connect your buquebus-scraper repo
4. Deploy automatically

---

## 🎯 **Which Option Should You Choose?**

### **For Quick Testing:**
- **Vercel** - Deploy in 2 minutes with `npx vercel --prod`

### **For Production Use:**
- **Railway** or **Render** - More reliable for Puppeteer
- **Docker on Fly.io** - Global deployment with excellent performance

### **For Enterprise:**
- **AWS ECS/Fargate** with Docker
- **Google Cloud Run** with Docker

---

## 🛠 **Current Issue: Netlify + Puppeteer**

Netlify Functions have limitations with Puppeteer:
- Limited Chrome binary compatibility
- Memory constraints
- Cold start issues

**Solutions:**
1. **Switch platforms** (recommended)
2. Use the improved serverless version
3. Add external scraping service (ScrapingBee, Apify)

---

## 📋 **Next Steps**

**Choose your preferred option:**

1. **Immediate fix**: Deploy to Vercel with `npx vercel --prod`
2. **Best long-term**: Railway or Render for reliable Puppeteer support
3. **Maximum control**: Docker deployment to Fly.io or similar

Would you like me to help deploy to any of these platforms?
