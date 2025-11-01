# 🎬 Media Enhancer

**AI-Powered Video & Audio Editing Platform**

A modern web application for video and audio editing with artificial intelligence enhancements. Built with React, Express, PostgreSQL, and Google Gemini AI.

---

## ✨ Features

- 🔐 **Authentication** - Secure user authentication with Clerk
- 💳 **Subscriptions** - Flexible pricing tiers with Stripe
- 📹 **Video Editor** - Web-based video editing interface
- 🤖 **AI Enhancements** - Powered by Google Gemini 2.0
- ☁️ **Cloud Storage** - Reliable storage with Cloudflare R2
- 📊 **Usage Tracking** - Monitor your storage and export limits

---

## 🏗️ Tech Stack

### Frontend
- React 18 + TypeScript
- Vite
- Tailwind CSS
- Clerk React
- React Router
- TanStack Query

### Backend
- Node.js + Express
- TypeScript
- Clerk Express SDK
- Stripe
- PostgreSQL (Supabase)
- Cloudflare R2

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- npm 10+
- Accounts created on:
  - [Clerk](https://clerk.com) (Authentication)
  - [Supabase](https://supabase.com) (Database)
  - [Stripe](https://stripe.com) (Payments)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/VCNPRO/Media-Enhancer.git
cd Media-Enhancer
```

2. **Configure Backend**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your API keys
```

3. **Configure Frontend**
```bash
cd ../frontend
npm install
cp .env.example .env.local
# Edit .env.local with your API keys
```

4. **Set up Database**
- Go to Supabase SQL Editor
- Run the schema from `backend/src/database/schema.sql`

5. **Start Development Servers**

Terminal 1 (Backend):
```bash
cd backend
npm run dev
```

Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```

6. **Open the app**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

---

## 📋 Environment Variables

### Backend (`backend/.env`)
```env
PORT=3001
NODE_ENV=development
CLERK_PUBLISHABLE_KEY=pk_test_your_key
CLERK_SECRET_KEY=sk_test_your_key
DATABASE_URL=postgresql://user:pass@host:5432/db
STRIPE_SECRET_KEY=sk_test_your_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_key
GEMINI_API_KEY=your_key
```

### Frontend (`frontend/.env.local`)
```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_key
VITE_API_URL=http://localhost:3001
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key
```

---

## 📚 Documentation

- [Next Steps](./NEXT_STEPS.md) - Implementation guide
- [Architecture](./ARCHITECTURE.md) - System design and tech details

---

## 💰 Pricing Tiers

### 🆓 Starter
- 5GB Storage
- 10 Projects
- 50 Exports/month
- Up to 5 min videos

### ⭐ Creator ($14.99/month)
- 50GB Storage
- 100 Projects
- 500 Exports/month
- Up to 30 min videos
- AI Enhancements
- No watermark

### 🚀 Professional ($49.99/month)
- 500GB Storage
- Unlimited Projects
- Unlimited Exports
- Up to 2 hour videos
- Advanced AI Features
- Priority Support

---

## 🗺️ Roadmap

### Phase 1 - MVP (Current)
- [x] Authentication system
- [x] Basic UI/UX
- [x] Database schema
- [ ] File upload
- [ ] Video editor basics
- [ ] Subscription flow

### Phase 2 - Core Features
- [ ] Video processing
- [ ] AI enhancements
- [ ] Export system
- [ ] Usage tracking
- [ ] Admin dashboard

### Phase 3 - Advanced Features
- [ ] Collaborative editing
- [ ] Video templates
- [ ] Mobile app
- [ ] API for integrations

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 👤 Author

**VCNPRO**
- GitHub: [@VCNPRO](https://github.com/VCNPRO)

---

## 🙏 Acknowledgments

- [Clerk](https://clerk.com) - Authentication
- [Supabase](https://supabase.com) - Database hosting
- [Stripe](https://stripe.com) - Payment processing
- [Google Gemini](https://ai.google.dev) - AI capabilities
- [Cloudflare R2](https://cloudflare.com/r2) - File storage

---

**Made with ❤️ by VCNPRO**
