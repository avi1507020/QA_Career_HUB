# 🚀 QA Career Hub

Welcome to the **QA Career Hub**, a modern, comprehensive dashboard designed specifically for Quality Assurance professionals to track career progression, generate professional content, and manage their job hunt with style. Built with a sleek dark-themed glassmorphism aesthetic, this application acts as your personal command center.

## ✨ Features

- **💼 Job Tracker Board (Kanban)**
  - Fully interactive drag-and-drop Kanban board (`@hello-pangea/dnd`).
  - Track applications across 6 stages: *Applied*, *Interview Scheduled*, *Technical Round*, *HR Round*, *Selected*, and *Rejected*.
  - Responsive, centered modal pop-ups for easily adding or editing job details.
  - Celebrate success and handle rejections with dynamic custom toast notifications.

- **🤖 LinkedIn Post Generator**
  - AI-powered content creation designed to help you stand out.
  - Generates tailored posts inside modern, scrollable custom cards.
  - Includes an Image Prompt Generator and "Copy to Clipboard" functionality.

- **🔐 Secure Authentication & Cloud Storage**
  - Integrated with **Firebase** for seamless User Authentication.
  - **Firestore Database** syncing ensures your Kanban data and profile are safely stored, synced in real-time, and isolated per user cross-device.

- **👨‍💻 Personal Portfolio View**
  - Responsive "About" portfolio page complete with a hero section, skills, and professional experience layout.

- **🎨 Modern & Responsive Design**
  - Built with a vibrant dark-mode glassmorphism interface.
  - Fluid animations, micro-interactions, modal backdrops, and blur effects.
  - Fully responsive layout ensuring comfortable usage on Mobile, Tablet, and Desktop.

## 🛠️ Technology Stack

- **Core**: React 18, Vite
- **Styling**: Vanilla CSS (Tailored UI Tokens, Fluid Resizing, Glassmorphism)
- **Backend & Auth**: Firebase Authentication & Cloud Firestore
- **Drag & Drop**: `@hello-pangea/dnd`
- **Icons**: `lucide-react`
- **Testing**: Vitest & React Testing Library (Robust suite covering UI interaction, state isolation, and Firebase mocking)

## 🚀 Getting Started

### Prerequisites

- Node.js (v16.0 or higher recommended)
- A Firebase Project (for Auth and Database)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/avi1507020/QA_Career_HUB.git
   cd QA_Career_HUB
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Firebase:**
   Create a `.env` file in the root directory and add your Firebase project configurations:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   The application will be running locally at `http://localhost:5173`.

## 🧪 Testing

The repository runs a robust set of Unit and Integration tests using **Vitest**.

To run all tests:
```bash
npm run test
```

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the issues page and submit pull requests.

## 📝 License
This project is open-source and free to use.
