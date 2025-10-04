# Clinkr 🔗

**Smarten Your Links** - A modern, privacy-focused link-in-bio and analytics platform designed for creators, entrepreneurs, and professionals.

🌐 **Live Demo**: [clinkr.live](https://clinkr.live) *(Work in Progress)*

## ✨ What is Clinkr?

Clinkr is a comprehensive link management and analytics platform that helps you organize all your important links and track audience engagement in real-time. Perfect for creators, entrepreneurs, and professionals who want to showcase their work and understand their audience better.

### 🎯 Key Features

- **🔗 Link-in-Bio Pages**: Create beautiful, customizable pages to showcase all your links
- **📊 Real-time Analytics**: Track clicks, views, and engagement metrics with detailed insights
- **🌍 Geographic Insights**: Know where your visitors come from with detailed geographic data and heat maps
- **📱 Device Analytics**: Track user devices and browsers to optimize experiences across platforms
- **🔒 Privacy-First**: We never sell your data and you control your information
- **⚡ Lightning Fast**: Built for speed with modern technologies and optimized performance
- **🎨 Customizable**: Edit titles, add custom thumbnails, reorder links, and customize themes
- **📈 Performance Tracking**: Monitor link performance trends over time
- **🔐 Secure**: Industry-standard encryption and security measures

## 🛠️ Tech Stack

### Frontend
- **React 19** - Modern React with latest features
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations and transitions
- **React Router DOM** - Client-side routing

### UI Components & Libraries
- **Radix UI** - Accessible, unstyled UI components
- **Lucide React** - Beautiful, customizable icons
- **Recharts** - Composable charting library
- **React Leaflet** - Interactive maps with Leaflet
- **React Hot Toast** - Elegant notifications

### Backend & Database
- **Supabase** - Backend-as-a-Service with PostgreSQL
- **PostgreSQL** - Robust relational database
- **Row Level Security (RLS)** - Database-level security

### Analytics & Maps
- **Leaflet** - Interactive maps
- **Leaflet Heat** - Heat map visualization
- **Vercel Analytics** - Performance and usage analytics

### Payment Processing
- **Razorpay** - Payment gateway integration

### Development Tools
- **ESLint** - Code linting
- **TypeScript ESLint** - TypeScript-specific linting
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixing

### Deployment
- **Vercel** - Frontend hosting and deployment
- **Custom Domain Support** - Premium feature for custom domains

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/clinkr.git
   cd clinkr
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Fill in your Supabase credentials and other required environment variables.

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

## 📁 Project Structure

```
clinkr/
├── src/
│   ├── components/
│   │   ├── auth/           # Authentication components
│   │   ├── Dashboard/      # Main dashboard
│   │   ├── homepage/       # Landing page components
│   │   ├── profile/        # User profile pages
│   │   └── legal/          # Legal pages (Privacy, Terms, etc.)
│   ├── contexts/           # React contexts
│   └── utils/              # Utility functions
├── public/                 # Static assets
├── schema.sql             # Database schema
└── vercel.json            # Vercel deployment config
```

## 🎨 Features Overview

### Free Plan
- ✅ Unlimited link tracking
- ✅ Basic analytics
- ✅ Customizable link pages
- ✅ Real-time click tracking
- ✅ Basic geographic data

### Premium Features
- 🌍 Advanced geographic insights
- 📱 Detailed device analytics
- 📊 CSV data exports
- 🎨 Custom domains
- 🎯 Advanced customization options
- 📈 Enhanced analytics dashboard

## 🔒 Privacy & Security

- **Privacy-First**: We never sell your data
- **Data Control**: You control your information
- **Anonymized Analytics**: All analytics are anonymized
- **Industry-Standard Encryption**: Secure data transmission and storage
- **Row Level Security**: Database-level security with Supabase RLS

## 🤝 Contributing

We welcome contributions! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

**Made with ❤️ for creators, entrepreneurs, and professionals worldwide.**
