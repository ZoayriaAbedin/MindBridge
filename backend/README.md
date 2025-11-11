# MindBridge Backend API

A comprehensive mental health platform backend that connects patients with mental health professionals.

## 🎯 Features

- **User Management**: Role-based authentication (Patient, Doctor, Admin)
- **Doctor Discovery**: Search and filter doctors by location, specialization, and budget
- **Smart Recommendations**: Location and budget-based doctor recommendations
- **Appointment System**: Book, manage, and track therapy sessions
- **Medical History**: Secure patient medical records and symptom tracking
- **Prescriptions**: Digital prescription management (medications, exercises, therapy)
- **Support Groups**: Community-based therapy and peer support groups
- **Confidential Files**: Doctor-only secure patient file storage

## 🛠️ Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: Helmet, CORS, bcrypt
- **File Upload**: Multer
- **Validation**: express-validator
- **Rate Limiting**: express-rate-limit

## 📋 Prerequisites

- Node.js >= 16.0.0
- MySQL >= 8.0
- npm >= 8.0.0

## 🚀 Installation

1. **Clone the repository**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   copy .env.example .env
   ```
   
   Edit `.env` and update the following:
   - Database credentials (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME)
   - JWT secret keys
   - Google Maps API key (for location features)
   - CORS origin (your frontend URL)

4. **Setup database**
   ```bash
   # Create database
   mysql -u root -p
   CREATE DATABASE mindbridge_db;
   exit;

   # Run schema
   npm run db:setup

   # (Optional) Seed with sample data
   npm run db:seed
   ```

5. **Start the server**
   ```bash
   # Development mode with auto-reload
   npm run dev

   # Production mode
   npm start
   ```

## 📚 API Documentation

Once the server is running, visit:
- Health Check: `http://localhost:5000/health`
- API Documentation: `http://localhost:5000/api/v1`

### Main Endpoints

#### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/auth/profile` - Get current user profile
- `PUT /api/v1/auth/profile` - Update profile
- `POST /api/v1/auth/change-password` - Change password

#### Doctors
- `GET /api/v1/doctors/search` - Search doctors
- `GET /api/v1/doctors/:id` - Get doctor details
- `GET /api/v1/doctors/recommended/for-me` - Get personalized recommendations
- `POST /api/v1/doctors/:id/approve` - Approve doctor (admin)

#### Appointments
- `GET /api/v1/appointments` - List appointments
- `POST /api/v1/appointments` - Book appointment
- `PUT /api/v1/appointments/:id` - Update appointment
- `POST /api/v1/appointments/:id/cancel` - Cancel appointment

#### Prescriptions
- `GET /api/v1/prescriptions` - List prescriptions
- `GET /api/v1/prescriptions/:id` - Get prescription details
- `POST /api/v1/prescriptions` - Create prescription (doctor)
- `PUT /api/v1/prescriptions/:id` - Update prescription (doctor)

#### Medical History
- `GET /api/v1/medical-history/patient/:patientId` - Get patient history
- `POST /api/v1/medical-history/patient/:patientId` - Add history entry
- `PUT /api/v1/medical-history/:id` - Update history entry
- `DELETE /api/v1/medical-history/:id` - Delete history entry

#### Support Groups
- `GET /api/v1/support-groups` - List support groups
- `GET /api/v1/support-groups/:id` - Get group details
- `POST /api/v1/support-groups` - Create group (doctor/admin)
- `POST /api/v1/support-groups/:id/join` - Join group
- `POST /api/v1/support-groups/:id/leave` - Leave group

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt rounds
- **Rate Limiting**: Prevents brute force attacks
- **Input Validation**: express-validator for all inputs
- **SQL Injection Prevention**: Parameterized queries
- **CORS Protection**: Configurable cross-origin policies
- **Helmet**: Security headers

## 📁 Project Structure

```
backend/
├── config/
│   └── database.js          # Database connection
├── controllers/
│   ├── auth.controller.js
│   ├── appointment.controller.js
│   ├── doctor.controller.js
│   ├── medicalHistory.controller.js
│   ├── prescription.controller.js
│   └── supportGroup.controller.js
├── database/
│   ├── schema.sql           # Database schema
│   └── seed.sql             # Sample data
├── middleware/
│   ├── auth.middleware.js
│   ├── validation.middleware.js
│   ├── rateLimiter.middleware.js
│   └── upload.middleware.js
├── routes/
│   ├── auth.routes.js
│   ├── user.routes.js
│   ├── doctor.routes.js
│   ├── appointment.routes.js
│   ├── prescription.routes.js
│   ├── medicalHistory.routes.js
│   └── supportGroup.routes.js
├── uploads/                 # File uploads directory
├── .env.example            # Environment template
├── package.json
└── server.js               # Main application
```

## 🎭 User Roles

### Patient
- Create profile with location and budget preferences
- Search and view doctors
- Get personalized doctor recommendations
- Book and manage appointments
- View prescriptions
- Track medical history
- Join support groups

### Doctor
- Complete professional profile
- Manage appointments
- Create prescriptions
- Add patient medical history
- Upload confidential files
- Create and manage support groups

### Admin
- Approve doctor registrations
- Manage users
- Oversee all appointments
- Access analytics (future)

## 🧪 Testing

```bash
npm test
```

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| NODE_ENV | Environment mode | development |
| PORT | Server port | 5000 |
| DB_HOST | MySQL host | localhost |
| DB_USER | MySQL user | root |
| DB_PASSWORD | MySQL password | - |
| DB_NAME | Database name | mindbridge_db |
| JWT_SECRET | JWT signing secret | - |
| JWT_EXPIRE | Token expiration | 7d |
| CORS_ORIGIN | Frontend URL | http://localhost:3000 |
| GOOGLE_MAPS_API_KEY | Google Maps API | - |

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Support

For support, email support@mindbridge.com or open an issue in the repository.

## 🗺️ Roadmap

- [ ] Email notifications
- [ ] SMS reminders
- [ ] Video consultation integration
- [ ] Payment gateway integration
- [ ] Analytics dashboard
- [ ] Mobile app API
- [ ] Real-time chat
- [ ] AI-powered doctor matching

---

Built with ❤️ for mental health professionals and patients
