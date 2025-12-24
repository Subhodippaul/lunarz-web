# Deployment Guide

This guide covers deploying the Lunarz Web e-commerce platform to various hosting providers.

## Prerequisites

Before deploying, ensure you have:
- A Firebase project set up with Firestore and Authentication enabled
- Environment variables configured
- Firebase security rules updated for production
- Application tested locally

## Vercel (Recommended)

Vercel provides seamless Next.js deployment with automatic builds and deployments.

### Steps:

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign in with GitHub
   - Click "New Project"
   - Import your repository

3. **Configure Environment Variables**
   - In Vercel dashboard, go to Project Settings > Environment Variables
   - Add all variables from your `.env.local`:
     ```
     NEXT_PUBLIC_FIREBASE_API_KEY
     NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
     NEXT_PUBLIC_FIREBASE_PROJECT_ID
     NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
     NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
     NEXT_PUBLIC_FIREBASE_APP_ID
     NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
     ```

4. **Deploy**
   - Click "Deploy"
   - Vercel will automatically build and deploy your application

5. **Update Firebase Settings**
   - Add your Vercel domain to Firebase Authentication authorized domains
   - Update any hardcoded URLs in your application

## Netlify

### Steps:

1. **Build Configuration**
   Create `netlify.toml` in your project root:
   ```toml
   [build]
     command = "npm run build"
     publish = ".next"

   [[plugins]]
     package = "@netlify/plugin-nextjs"
   ```

2. **Deploy**
   - Connect your GitHub repository to Netlify
   - Set build command: `npm run build`
   - Set publish directory: `.next`
   - Add environment variables in Netlify dashboard

## Railway

### Steps:

1. **Connect Repository**
   - Go to [railway.app](https://railway.app)
   - Create new project from GitHub repo

2. **Configure**
   - Railway auto-detects Next.js projects
   - Add environment variables in Railway dashboard
   - Deploy automatically triggers

## DigitalOcean App Platform

### Steps:

1. **Create App**
   - Go to DigitalOcean App Platform
   - Create app from GitHub repository

2. **Configure Build**
   - Build command: `npm run build`
   - Run command: `npm start`
   - Add environment variables

## Self-Hosted (Docker)

### Dockerfile:
```dockerfile
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
```

### Docker Compose:
```yaml
version: '3.8'
services:
  lunarz-web:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_FIREBASE_API_KEY=${NEXT_PUBLIC_FIREBASE_API_KEY}
      - NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=${NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN}
      - NEXT_PUBLIC_FIREBASE_PROJECT_ID=${NEXT_PUBLIC_FIREBASE_PROJECT_ID}
      - NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=${NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET}
      - NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=${NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID}
      - NEXT_PUBLIC_FIREBASE_APP_ID=${NEXT_PUBLIC_FIREBASE_APP_ID}
      - NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=${NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID}
```

## Post-Deployment Checklist

After deploying to any platform:

### 1. Update Firebase Configuration
- Add your production domain to Firebase Authentication authorized domains
- Update Firestore security rules for production (use the provided `firestore.rules`)

### 2. Test Core Functionality
- [ ] User registration and login
- [ ] Google OAuth authentication
- [ ] Product browsing and search
- [ ] Add to cart functionality
- [ ] Checkout process
- [ ] User profile management
- [ ] Order history

### 3. Performance Optimization
- Enable compression in your hosting provider
- Configure CDN if available
- Monitor Core Web Vitals

### 4. Security
- Ensure HTTPS is enabled
- Review and update Firestore security rules
- Monitor authentication logs

### 5. Monitoring
- Set up error tracking (Sentry, LogRocket, etc.)
- Configure analytics
- Monitor Firebase usage and quotas

## Environment Variables Reference

Required environment variables for production:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

## Troubleshooting Deployment Issues

### Build Failures
- Check Node.js version compatibility (18+)
- Ensure all dependencies are in `package.json`
- Verify TypeScript compilation passes locally

### Runtime Errors
- Check environment variables are set correctly
- Verify Firebase configuration
- Check browser console for client-side errors

### Authentication Issues
- Ensure production domain is added to Firebase authorized domains
- Check OAuth provider configuration
- Verify redirect URLs are correct

### Database Connection Issues
- Check Firestore security rules
- Verify Firebase project configuration
- Ensure network connectivity to Firebase

For additional help, refer to your hosting provider's documentation or the main README.md file.