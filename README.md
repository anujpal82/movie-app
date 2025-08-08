# 🎬 Movie Management Application

A full-stack web application for managing personal movie collections. Built with React (Frontend) and NestJS (Backend), featuring user authentication, movie CRUD operations, and image upload capabilities.

## 🚀 Quick Start

### Repository
- **GitHub Repository**: [https://github.com/anujpal82/movie-app](https://github.com/anujpal82/movie-app)

### Live Application
- **Login URL**: [http://56.228.5.205](http://56.228.5.205)
- **Swagger UI Documentation**: [http://56.228.5.205/docs](http://56.228.5.205/docs)

### Test Credentials
```
Email: test@gmail.com
Password: Test@123
```

## 📋 Features

### Frontend (React + TypeScript)
- **Modern UI**: Built with React, TypeScript, and Tailwind CSS
- **Multi-language Support**: Internationalization (i18n) with English, German, and Dutch
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Form Validation**: Comprehensive client-side validation with real-time feedback
- **Image Upload**: Drag-and-drop file upload with preview
- **Authentication**: JWT-based authentication with protected routes
- **Toast Notifications**: User-friendly feedback system

### Backend (NestJS + TypeScript)
- **RESTful API**: Clean, well-documented REST endpoints
- **Authentication**: JWT-based authentication with Passport.js
- **Database**: MongoDB with Mongoose ODM
- **File Storage**: AWS S3 integration for image uploads
- **Validation**: Comprehensive request validation with class-validator
- **Documentation**: Auto-generated Swagger/OpenAPI documentation
- **Error Handling**: Robust error handling and logging

## 🏗️ Project Structure

```
movie-app/
├── frontend/          # React application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── services/      # API services
│   │   ├── types/         # TypeScript types
│   │   └── utils/         # Utility functions
│   └── package.json
├── backend/           # NestJS application
│   ├── src/
│   │   ├── auth/          # Authentication module
│   │   ├── movies/        # Movies CRUD module
│   │   ├── config/        # Configuration files
│   │   └── interceptors/  # Custom interceptors
│   └── package.json
└── README.md
```

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **React Router** for navigation
- **React i18next** for internationalization
- **Lucide React** for icons

### Backend
- **NestJS** with TypeScript
- **MongoDB** with Mongoose
- **JWT** for authentication
- **AWS S3** for file storage
- **Swagger/OpenAPI** for API documentation
- **Class-validator** for validation

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- MongoDB instance
- AWS S3 bucket (for file uploads)
- Doppler CLI for environment management

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/anujpal82/movie-app.git
   cd movie-app
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   cd backend
   npm install
   
   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. **Environment Setup with Doppler**
   ```bash
   # Install Doppler CLI
   npm install -g @doppler/cli
   
   # Login to Doppler
   doppler login
   
   # Setup Doppler at root level (for both frontend and backend)
   doppler setup
   ```

4. **Run the application**
   ```bash
   # Start backend (from root directory)
   doppler run -- npm run start:dev
   
   # Start frontend (from root directory)
   doppler run -- npm run dev
   ```

## 📚 API Documentation

The API is fully documented with Swagger UI. You can access the interactive documentation at:
- **Local**: http://localhost:3001/docs
- **Production**: [http://56.228.5.205/docs](http://56.228.5.205/docs)

### Key API Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

#### Movies
- `GET /api/movies` - List movies (with pagination)
- `POST /api/movies` - Create new movie
- `GET /api/movies/:id` - Get movie by ID
- `PATCH /api/movies/:id` - Update movie
- `DELETE /api/movies/:id` - Delete movie

## 🔧 Development

### Backend Development
```bash
# From root directory
doppler run -- npm run start:dev      # Development mode with hot reload
doppler run -- npm run build          # Build for production
doppler run -- npm run test           # Run tests
doppler run -- npm run test:e2e       # Run end-to-end tests
```

### Frontend Development
```bash
# From root directory
doppler run -- npm run dev            # Development server
doppler run -- npm run build          # Build for production
doppler run -- npm run preview        # Preview production build
doppler run -- npm run lint           # Run ESLint
```

## 🧪 Testing

### Backend Tests
```bash
# From root directory
doppler run -- npm run test           # Unit tests
doppler run -- npm run test:e2e       # End-to-end tests
doppler run -- npm run test:cov       # Test coverage
```

### Frontend Tests
```bash
# From root directory
doppler run -- npm run test           # Run tests
doppler run -- npm run test:coverage  # Test coverage
```

## 🚀 Deployment

### Backend Deployment
The backend is configured for deployment with environment-specific configurations using Doppler:
- Development: `doppler run -- npm run start:dev`
- Production: `doppler run -- npm run start:prod`

### Frontend Deployment
The frontend can be deployed to any static hosting service:
- Vercel
- Netlify
- AWS S3 + CloudFront
- GitHub Pages

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [NestJS](https://nestjs.com/) for the amazing backend framework
- [React](https://reactjs.org/) for the frontend library
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [Vite](https://vitejs.dev/) for the fast build tool

---

**Happy coding! 🎬✨**
