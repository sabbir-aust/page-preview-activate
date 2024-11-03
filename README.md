# Playwright Project Setup

This guide provides instructions for setting up the project environment with Node.js, Visual Studio Code, and Playwright.

## Prerequisites
Ensure you have access to the Software Center inside your VM.

## Step-by-Step Setup Instructions

### Step 1: Install Node.js and Visual Studio Code
1. Open **Software Center** from inside your VM.
2. Search for **Node.js** and **Visual Studio Code**, and install the latest versions of both.

### Step 2: Install Git Bash
1. Download [Git Bash](https://git-scm.com/downloads) and run the installer.
2. Follow the installation prompts to complete the setup.

### Step 3: Clone the Project Repository
1. Navigate to the location where you want to pull the project.
2. Open Git Bash in this location.
3. Initialize a Git repository and clone the project by running the following commands:
   ```bash
   git init
   git clone https://github.com/sabbir-aust/page-preview-activate

### Step 4: Open the Project in Visual Studio Code
After cloning, open the project folder in Visual Studio Code.

### Step 5: Install Playwright
In the terminal (inside VS Code), run the following command to install Playwright:
    npm install @playwright/test

When prompted, select JavaScript as the language.
When asked for a directory, type tests instead of e2e, then press Enter to complete the installation.

### Step 6: Run the Test
After Playwright is installed, you can run a specific test by using the following command:
    npx playwright test preview-activate.spec.js --project chromium

### Additional Resources
    Playwright Documentation
    Git Bash Documentation
    Visual Studio Code Documentation

### Following these steps will set up the project environment and prepare you to run Playwright tests.
This README provides a clear, step-by-step guide for setting up the project, including installing necessary software, cloning the project, and running a Playwright test.