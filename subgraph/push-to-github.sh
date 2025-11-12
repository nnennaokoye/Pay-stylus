#!/bin/bash

# Replace YOUR_GITHUB_USERNAME with your actual GitHub username
GITHUB_USERNAME="Akhil-Rawat"
REPO_NAME="subscription-escrow-subgraph"

echo "🚀 Setting up remote repository..."
echo "Repository URL: https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"

# Add remote origin
git remote add origin https://github.com/$GITHUB_USERNAME/$REPO_NAME.git

# Rename master to main (GitHub's default)
git branch -M main

# Push to GitHub
git push -u origin main

echo "✅ Repository pushed successfully!"
echo "📊 Your subgraph repository is now available at:"
echo "https://github.com/$GITHUB_USERNAME/$REPO_NAME"

echo ""
echo "🔗 Clone command for others:"
echo "git clone https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"
