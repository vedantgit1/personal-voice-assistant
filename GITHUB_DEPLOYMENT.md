# GitHub Pages Deployment Guide

This guide will help you deploy your Personal Voice Assistant to GitHub Pages.

## Prerequisites

1. A GitHub account
2. Git installed on your computer

## Step 1: Create a GitHub Repository

1. Go to [GitHub](https://github.com) and sign in to your account
2. Click the "+" icon in the top right corner and select "New repository"
3. Name your repository (e.g., "personal-voice-assistant")
4. Choose "Public" visibility
5. Click "Create repository"

## Step 2: Push Your Code to GitHub

1. Open a terminal or command prompt
2. Navigate to your project directory
3. Initialize a Git repository (if not already done):
   ```
   git init
   ```
4. Add all files to the repository:
   ```
   git add .
   ```
5. Commit the files:
   ```
   git commit -m "Initial commit"
   ```
6. Add your GitHub repository as a remote:
   ```
   git remote add origin https://github.com/YOUR_USERNAME/personal-voice-assistant.git
   ```
   (Replace YOUR_USERNAME with your GitHub username)
7. Push your code to GitHub:
   ```
   git push -u origin main
   ```

## Step 3: Enable GitHub Pages

### Option 1: Manual Setup

1. Go to your repository on GitHub
2. Click on "Settings"
3. Scroll down to the "GitHub Pages" section
4. Under "Source", select "main" branch
5. Click "Save"
6. Your site will be published at `https://YOUR_USERNAME.github.io/personal-voice-assistant/`

### Option 2: Using GitHub Actions (Recommended)

This repository already includes a GitHub Actions workflow file (`.github/workflows/deploy.yml`) that will automatically deploy your site to GitHub Pages whenever you push to the main branch.

1. Go to your repository on GitHub
2. Click on "Settings"
3. Click on "Pages" in the left sidebar
4. Under "Source", select "GitHub Actions"
5. Your site will be deployed automatically when you push to the main branch

## Step 4: Test Your Deployment

1. Wait a few minutes for the deployment to complete
2. Visit `https://YOUR_USERNAME.github.io/personal-voice-assistant/`
3. Verify that your Personal Voice Assistant is working correctly

## Troubleshooting

- If your site doesn't appear, check the "Actions" tab in your repository to see if there were any deployment errors
- Make sure your repository is public, as GitHub Pages is only available for public repositories on free accounts
- If the Web Speech API doesn't work, make sure you're accessing the site via HTTPS

## Updating Your Site

To update your site after making changes:

1. Make your changes locally
2. Commit them:
   ```
   git add .
   git commit -m "Description of changes"
   ```
3. Push to GitHub:
   ```
   git push
   ```
4. The GitHub Actions workflow will automatically deploy your changes