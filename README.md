# Sahara — Everyday Digital Companion for Seniors

> **“Don’t make seniors learn technology. Make technology learn seniors.”**

Sahara is a GenAI-powered web companion designed specifically for senior citizens. It combines voice interaction, large high-contrast visual controls, personalized assistance, proactive medicine reminders, scam protection, and automated bill simplification into one calm, elder-friendly interface.

---

## 🌟 Key Features

1. **My Day (Proactive Daily Schedule)**
   - Calm, non-intrusive daily timeline.
   - Text-to-speech audio reader with adjustable speed and multiple languages (English, Hindi, Gujarati, Tamil, etc.).
   - Integrated weather, gentle hydration reminders, and appointment briefings.

2. **Scam Shield (AI Fraud Detection)**
   - Plain-language analysis of suspicious SMS, WhatsApp messages, lottery alerts, and phishing emails.
   - Safety verdict badge: **SAFE**, **SUSPICIOUS**, or **SCAM / DANGER**.
   - One-touch copyable response to help seniors politely refuse suspicious requests without stress.

3. **Prescription & Health Simplifier**
   - Translates shorthand doctor notes into everyday meal times (e.g., *"Take after breakfast with water"*).
   - Interactive daily pill checklist with audio chime confirmations.

4. **Bill Simplifier & Guided Payments**
   - Breaks down utility and electricity bills into 4 simple figures: amount due, due date, previous comparison, and the reason for any price changes.
   - **Help Me Do This**: 3-step guided payment assistant ensuring safety at every click.

5. **Family Connect & "Confirm Before Acting"**
   - Quick one-tap voice message composer for loved ones.
   - Built-in **Confirm Before Acting** safety modal requiring explicit confirmation before any payments or sensitive messages are processed.
   - Gentle, proactive wellness check-in that verifies with the senior first before worrying family members.

6. **Accessibility First**
   - 3-step adjustable typography (`Normal`, `Large`, `Extra Large`).
   - High Contrast / Dark Mode toggle.
   - Voice-first audio synthesis with variable speaking rate.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- A Gemini API Key from [Google AI Studio](https://aistudio.google.com/)

### Installation

1. Clone or download this repository:
   ```bash
   git clone https://github.com/your-username/sahara.git
   cd sahara
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env
   ```
   Add your `GEMINI_API_KEY` to `.env`:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:3000`.

5. Build for production:
   ```bash
   npm run build
   npm start
   ```

---

## 🛠️ Tech Stack
- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React, Motion
- **Backend**: Node.js, Express
- **AI**: Google GenAI SDK (`@google/genai`) with Gemini models
- **Audio & Accessibility**: Web Speech API, Web Audio API chime synthesis, WCAG-compliant high-contrast themes
