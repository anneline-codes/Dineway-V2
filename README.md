# Dineway — Restaurant Solutions

A full-stack MERN application for restaurant discovery, table reservations, and menu exploration.

![Dineway](https://img.shields.io/badge/Dineway-v2.0.0-C9A84C?style=for-the-badge&logo=react)

## 🌟 Features

### For Diners
- **Restaurant Discovery** - Browse partner restaurants with filtering and search
- **Table Reservations** - Real-time table booking with date/time selection
- **Menu Exploration** - View detailed menus from all partner restaurants
- **Reviews & Ratings** - Read and write reviews for restaurants
- **Reservation Management** - View, track, and cancel your bookings

### For Restaurants
- **Restaurant Registration** - Onboard to the platform
- **Menu Management** - Add, edit, and remove menu items
- **Reservation Dashboard** - Manage incoming reservations
- **Review Management** - Monitor customer feedback

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool and dev server
- **React Router v6** - Client-side routing
- **Zustand** - State management
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client
- **React Hook Form** - Form handling
- **Lucide React** - Icon library
- **React Hot Toast** - Notifications
- **date-fns** - Date formatting

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Nodemailer** - Email sending
- **Multer** - File upload handling
- **Cloudinary** - Image hosting
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing
- **express-rate-limit** - Rate limiting

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **MongoDB** (local or MongoDB Atlas)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/anneline-codes/Dineway-V2.git
cd Dineway-V2
```

### 2. Install Dependencies

```bash
# Install all dependencies (root, client, and server)
npm run install:all
```

Or install manually:
```bash
# Root dependencies
npm install

# Client dependencies
cd client && npm install

# Server dependencies
cd server && npm install
```

### 3. Environment Configuration

#### Server Environment (`.env` in `/server`)

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/dineway
JWT_SECRET=dineway_jwt_secret_key_2026
JWT_REFRESH_SECRET=dineway_refresh_secret_key_2026
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
NODE_ENV=development

# Cloudinary (optional - for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email (optional - for contact form and notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

#### Client Environment (`.env` in `/client`)

```env
VITE_API_URL=http://localhost:5000/api/v1
```

### 4. Seed the Database

Populate the database with sample data:

```bash
npm run seed
```

This creates:
- 2 users (admin and customer)
- 6 restaurants
- 12 tables
- 18 menu items
- 3 reviews
- 2 sample reservations

**Default Users:**
- **Admin:** admin@dineway.com / Admin1234!
- **Customer:** cynthia@gmail.com / Test1234!

### 5. Start the Development Servers

```bash
# Start both client and server concurrently
npm run dev
```

Or start separately:
```bash
# Server only (port 5000)
npm run dev:server

# Client only (port 5173)
npm run dev:client
```

### 6. Access the Application

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000/api/v1
- **API Health Check:** http://localhost:5000/api/health

## 📁 Project Structure

```
dineway/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/     # Navbar, Footer
│   │   │   └── ui/         # Reusable UI components
│   │   ├── context/        # React Context (Theme)
│   │   ├── pages/          # Route pages
│   │   ├── services/       # API service layer
│   │   └── store/          # Zustand store (Auth)
│   ├── index.html
│   └── package.json
├── server/                 # Express backend
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Express middleware
│   ├── models/             # Mongoose models
│   ├── routes/             # Express routers
│   ├── utils/              # Utility functions
│   ├── index.js            # Server entry point
│   └── package.json
├── package.json            # Root package.json
└── README.md
```

## 🍽️ API Endpoints

### Authentication (`/api/v1/auth`)
- `POST /register` - Register new user
- `POST /login` - Login user
- `POST /logout` - Logout user
- `POST /refresh-token` - Refresh access token
- `GET /me` - Get current user

### Restaurants (`/api/v1/restaurants`)
- `GET /` - List all restaurants (with filters)
- `GET /:slug` - Get restaurant by slug
- `POST /` - Create restaurant (auth required)
- `PUT /:id` - Update restaurant
- `DELETE /:id` - Delete restaurant
- `PATCH /:id/register` - Register restaurant (admin)
- `GET /stats/count` - Get statistics

### Reservations (`/api/v1/reservations`)
- `POST /` - Create reservation (auth required)
- `GET /my` - Get user's reservations (auth required)
- `GET /restaurant/:id` - Get restaurant reservations
- `PATCH /:id/status` - Update reservation status

### Menu (`/api/v1/menu`)
- `GET /restaurant/:id` - Get restaurant menu
- `POST /` - Add menu item (auth required)
- `PUT /:id` - Update menu item
- `DELETE /:id` - Delete menu item

### Reviews (`/api/v1/reviews`)
- `POST /` - Submit review (auth required)
- `GET /restaurant/:id` - Get restaurant reviews
- `GET /latest` - Get latest reviews
- `DELETE /:id` - Delete review

### Tables (`/api/v1/tables`)
- `GET /restaurant/:id` - Get restaurant tables
- `GET /available` - Get available tables
- `POST /` - Create table (admin)

### Newsletter (`/api/v1/newsletter`)
- `POST /subscribe` - Subscribe to newsletter

### Contact (`/api/v1/contact`)
- `POST /` - Submit contact form

## 🎨 Design System

### Colors
- **Primary Gold:** `#C9A84C`
- **Gold Hover:** `#E0BE6A`
- **Gold Light:** `rgba(201, 168, 76, 0.1)`
- **Success:** `#4CAF50`
- **Error:** `#E53935`

### Dark Mode (Default)
- **Background Primary:** `#0D0D0D`
- **Background Secondary:** `#1A1A1A`
- **Text Primary:** `#E5E0D5`
- **Text Muted:** `#8A8070`

### Light Mode
- **Background Primary:** `#F5F1EB`
- **Background Secondary:** `#FFFFFF`
- **Text Primary:** `#2C2416`
- **Text Muted:** `#7A6E60`

### Typography
- **Headings:** Playfair Display (serif)
- **Body:** Inter (sans-serif)

## 🧪 Testing

```bash
# Run tests (coming soon)
npm test
```

## 📦 Building for Production

```bash
# Build frontend for production
npm run build

# Preview production build
npm run preview
```

## 🔒 Security Features

- **JWT Authentication** with access and refresh tokens
- **HttpOnly Cookies** for secure token storage
- **Password Hashing** with bcryptjs
- **Rate Limiting** on auth routes
- **CORS Protection**
- **Helmet.js** for security headers
- **MongoDB Sanitization** to prevent NoSQL injection
- **Input Validation** with validator.js

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Authors

- **Anne Line** - [@anneline-codes](https://github.com/anneline-codes)

## 🙏 Acknowledgments

- [Lucide Icons](https://lucide.dev/)
- [Unsplash](https://unsplash.com/) for placeholder images
- [Google Fonts](https://fonts.google.com/) for Playfair Display and Inter

## 📞 Support

For support, email support@dineway.com or join our Slack channel.

---

Built with ❤️ by the Dineway Team