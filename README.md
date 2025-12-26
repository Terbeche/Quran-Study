# 📖 Quran Study

A modern web application for studying the Quran with verse tagging, collections, community insights, and audio recitation features.

[![Live Demo](https://img.shields.io/badge/demo-live-success)](https://quran-study-fb6a35aba4c7.herokuapp.com/)
[![GitHub](https://img.shields.io/badge/github-repository-blue)](https://github.com/Terbeche/Quran-Study)
[![Next.js](https://img.shields.io/badge/Next.js-15.5.6-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)


## Screen shots

- ![](./screen/screen1.png)
- ![](./screen/screen2.png)
- ![](./screen/screen3.png)
- ![](./screen/screen4.png)
- ![](./screen/screen5.png)
- ![](./screen/screen6.png)
- ![](./screen/screen7.png)

## Built With

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Drizzle](https://img.shields.io/badge/Drizzle-000000?style=for-the-badge&logo=drizzle&logoColor=white)
![NextAuth.js](https://img.shields.io/badge/NextAuth.js-000000?style=for-the-badge&logo=nextauth&logoColor=white)
![Heroku](https://img.shields.io/badge/Heroku-430098?style=for-the-badge&logo=heroku&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Git](https://img.shields.io/badge/GIT-E44C30?style=for-the-badge&logo=git&logoColor=white)
![VS Code](https://img.shields.io/badge/VS_Code-007ACC?style=for-the-badge&logo=visual-studio-code&logoColor=white)

### 📚 **Quran Reading & Study**
- Browse all 114 chapters (Surahs) with Arabic text and translations
- Verse-by-verse audio recitation with multiple reciters
- Chapter audio player with verse highlighting
- Search functionality across the entire Quran
- Responsive design for mobile, tablet, and desktop

### 🏷️ **Personal Tags**
- Tag verses with custom labels for personal study
- Create, edit, and delete tags
- Filter verses by tags
- Toggle tag visibility (public/private)

### 👥 **Community Features**
- View community tags created by other users
- Vote on community tags (upvote/downvote)
- Discover popular verses through community engagement
- Share your insights with other users

### 📚 **Collections**
- Organize verses into custom collections
- Create thematic collections (favorite verses, memorization, etc.)
- Add/remove verses from collections
- Edit and manage your collections

### 🌍 **Internationalization**
- Multi-language support (English, French, Arabic)
- RTL support for Arabic interface
- Locale-aware routing


## 🚀 Live Demo

Visit the live application: [https://quran-study-fb6a35aba4c7.herokuapp.com/](https://quran-study-fb6a35aba4c7.herokuapp.com/)

Available in multiple languages:
- English: [https://quran-study-fb6a35aba4c7.herokuapp.com/en](https://quran-study-fb6a35aba4c7.herokuapp.com/en)
- French: [https://quran-study-fb6a35aba4c7.herokuapp.com/fr](https://quran-study-fb6a35aba4c7.herokuapp.com/fr)
- Arabic: [https://quran-study-fb6a35aba4c7.herokuapp.com/ar](https://quran-study-fb6a35aba4c7.herokuapp.com/ar)

### **APIs**
- **[Quran.com API](https://api-docs.quran.foundation/)** - Quran text, translations, and metadata

### **Deployment**
- **[Heroku](https://www.heroku.com/)** - Production hosting

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js 18+** - [Download](https://nodejs.org/)
- **npm** or **yarn** - Package manager
- **MySQL 8.0+** - Database (local or cloud)
- **Git** - Version control

## 🔧 Installation

### 1. Clone the repository

```bash
git clone https://github.com/Terbeche/Quran-Study.git
cd Quran-Study
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env.local` file in the root directory:

```env
# Database
DATABASE_URL="mysql://user:password@localhost:3306/quran_study"

# NextAuth
AUTH_SECRET="your-random-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Quran API (Optional - app works without these)
# API_BASE_URL="https://api.quran.com/api/v4"
# QURAN_API_CLIENT_ID="your-client-id"
# QURAN_API_CLIENT_SECRET="your-client-secret"
# QURAN_API_TOKEN_URL="https://api.quran.com/oauth/token"
```

**Generate AUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 4. Set up the database

```bash
# Push database schema
npm run db:push
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features

### Quran Reading & Study

- **Verse Display:** Arabic text with English translations
- **Audio Recitation:** Listen to verses with professional reciters
- **Chapter Navigation:** Browse all 114 Surahs with metadata

### Personal Tags

- **Tag Management:** Create, edit, and delete personal tags
- **Verse Tagging:** Mark verses for study, memorization, or reflection
- **Tag Visibility:** Toggle between public and private tags

### Community Features

- **Community Tags:** View tags created by other users
- **Voting System:** Upvote/downvote community tags
- **Popular Verses:** Discover trending verses through community engagement

### Collections

- **Collection Management:** Create thematic collections
- **Verse Organization:** Add/remove verses from collections
- **Collection Sharing:** Share your collections with others

## 🗄️ Database Schema

The application uses MySQL with the following main tables:

- **users** - User accounts and profiles
- **accounts** - NextAuth account linking
- **sessions** - User sessions
- **tags** - Personal and community tags
- **tag_votes** - Community tag voting system
- **collections** - User-created verse collections
- **collection_verses** - Many-to-many relationship for collections and verses

## 🌐 API Integration

### Quran.com API
- Verse data and translations
- Chapter metadata
- Audio recitation files

## 📄 License

This project is open source and available under the MIT License.

---

# **Built with ❤️ for the Muslim community**
