# Deployment Guide

This guide provides instructions for deploying your Personal Voice Assistant to various hosting platforms.

## Option 1: GitHub Pages (Free)

GitHub Pages is a simple way to host static websites directly from your GitHub repository.

1. Create a GitHub repository and push your code:
   ```
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/your-username/personal-voice-assistant.git
   git push -u origin main
   ```

2. Go to your repository on GitHub, click on "Settings"

3. Scroll down to the "GitHub Pages" section

4. Under "Source", select "main" branch and click "Save"

5. Your site will be published at `https://your-username.github.io/personal-voice-assistant/`

**Note**: GitHub Pages requires HTTPS, which is necessary for the Web Speech API to work properly.

## Option 2: Netlify (Free)

Netlify offers a generous free tier and is very easy to set up.

1. Sign up for a free account at [Netlify](https://www.netlify.com/)

2. Click "New site from Git"

3. Connect to your GitHub repository

4. Configure build settings (not needed for this project, as it's static HTML/CSS/JS)

5. Click "Deploy site"

6. Your site will be available at a Netlify subdomain (e.g., `https://your-site-name.netlify.app`)

## Option 3: Vercel (Free)

Vercel is another excellent platform for hosting static sites.

1. Sign up for a free account at [Vercel](https://vercel.com/)

2. Click "Import Project"

3. Connect to your GitHub repository

4. Configure project settings (defaults should work fine)

5. Click "Deploy"

6. Your site will be available at a Vercel subdomain (e.g., `https://personal-voice-assistant.vercel.app`)

## Option 4: Any Web Hosting Service

Since this is a simple static website, you can host it on any web hosting service that allows you to upload HTML, CSS, and JavaScript files.

1. Purchase hosting from a provider like Bluehost, HostGator, etc.

2. Upload the files to your hosting account using FTP or their web interface

3. Your site will be available at your domain or subdomain

## Important Notes for All Deployments

1. **HTTPS is Required**: The Web Speech API only works on secure origins (HTTPS or localhost). Make sure your hosting provider supports HTTPS.

2. **API Key Security**: Remember that the API key is stored in the user's browser and is visible in the frontend code. In a production environment, you might want to implement a backend service to handle API calls securely.

3. **Cross-Origin Requests**: If you encounter CORS issues with the OpenRouter API, you may need to implement a simple backend proxy or use a CORS proxy service.

## Testing Your Deployment

After deploying, make sure to test:

1. That the site loads correctly
2. That speech recognition works (requires HTTPS)
3. That the assistant responds to your questions
4. That text-to-speech works properly

If you encounter any issues, check the browser console for error messages.