# ✈️ AI Travel Planner

An AI-powered travel planning platform built with **Next.js**, **TypeScript**, **Firebase**, and **Tailwind CSS** that helps users create personalized travel itineraries, save trips, and interact with an AI travel assistant.

## 🚀 Features

### 🗺️ AI Trip Generation
Generate personalized travel itineraries based on:
- Destination
- Budget
- Trip Duration
- Interests & Preferences

### 🤖 AI Travel Assistant
Chat with an AI assistant to:
- Ask questions about destinations
- Get travel recommendations
- Learn about local culture and attractions
- Receive travel tips before and during your trip

### 🔐 Authentication
- Google Sign-In with Firebase Authentication
- Secure user sessions
- Personalized travel experience

### 💾 Save Trips
- Save generated itineraries to Firestore
- Access trips anytime from your dashboard
- Persistent travel history

### 📋 My Trips Dashboard
- View all saved trips
- Access trip details
- Manage and organize travel plans

### 📄 Trip Details Page
- View complete itinerary breakdown
- Daily activities
- Budget information
- Travel recommendations

### 📱 Responsive Design
- Mobile-friendly UI
- Tablet support
- Optimized desktop experience

---

## 🛠️ Tech Stack

### Frontend
- Next.js 15
- React
- TypeScript
- Tailwind CSS

### State Management
- Zustand

### Backend & Database
- Firebase Authentication
- Cloud Firestore

### AI Integration
- Gemini API

### Notifications
- React Hot Toast

---

## 📂 Project Structure

```bash
app/
├── api/
├── dashboard/
├── generate/
├── trip/
├── auth/
└── page.tsx

components/
├── navbar/
├── chat/
├── trip/
└── ui/

firebase/
├── config.ts

lib/
├── api-client.ts
├── firebase/
└── helpers/

types/
```

---

## ⚙️ Environment Variables

Create a `.env.local` file in the root directory and add:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

GEMINI_API_KEY=
```

---

## 🏃‍♂️ Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/kilan080/ai-travel-planner.git
```

### 2. Navigate to the Project

```bash
cd ai-travel-planner
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Create a `.env.local` file and add your Firebase and Gemini API credentials.

### 5. Run Development Server

```bash
npm run dev
```

Open:

```txt
http://localhost:3000
```

---

## 🎯 Future Improvements

- AI itinerary editing
- Interactive travel maps
- PDF itinerary export
- AI packing list generator
- Trip collaboration
- Weather integration
- Expense tracking
- Public trip sharing

---

## 🌍 Live Demo

Add your deployed application link here:

```txt
https://ai-travel-planner-kol.vercel.app
```

---

## 👨‍💻 Author

**Olamilekan Kilani**

Frontend Developer passionate about building modern web applications, AI-powered products, and scalable user experiences.

- GitHub: https://github.com/kilan080

---

## 📄 License

This project is licensed under the MIT License.