# Frontend Authentication & Admin Panel Setup

## ✅ Completed Features

### 1. API Service Layer (`src/lib/api.ts`)
- Complete API client with all backend endpoints
- JWT token management (get, set, remove from localStorage)
- Automatic token injection in request headers
- Error handling for API responses

### 2. Authentication Pages

#### Login Page (`src/pages/Login.tsx`)
- Email/password login form
- Form validation using Zod and React Hook Form
- Integration with backend `/api/auth/login` endpoint
- Automatic redirect based on user role (admin → /admin, others → /)
- Test credentials displayed for easy testing

#### Register Page (`src/pages/Register.tsx`)
- Full registration form (name, email, phone, password, role)
- Role selection (Customer or Provider)
- Form validation
- Integration with backend `/api/auth/register` endpoint
- Automatic login after registration

### 3. Admin Panel (`src/pages/AdminPanel.tsx`)
- **Dashboard Tab**: 
  - Booking statistics (total, completed, pending, cancelled, revenue)
  - Provider statistics (total, verified, available)
  - Visual cards with metrics
- **Users Tab**:
  - Complete user list with details
  - Role badges
  - Verification status
- **Providers Tab**:
  - Provider management table
  - Verify/Unverify provider functionality
  - Provider details (rating, services, hourly rate)

### 4. Protected Routes (`src/components/ProtectedRoute.tsx`)
- Route protection middleware
- Role-based access control
- Automatic redirect to login if not authenticated
- Role validation for admin routes

### 5. Navigation Updates (`src/components/layout/Navbar.tsx`)
- Login/Logout functionality
- User dropdown menu with profile info
- Admin Panel link (only visible to admin users)
- Mobile-responsive menu with auth support
- Logout handler with token cleanup

### 6. App Configuration (`src/App.tsx`)
- New routes: `/login`, `/register`, `/admin`
- Auth state initialization on app load
- Protected route for admin panel
- Automatic user loading from stored token

## 🔐 Authentication Flow

1. **Login**:
   - User enters email/password
   - API call to `/api/auth/login`
   - Token stored in localStorage
   - User data stored in Zustand store
   - Redirect based on role

2. **Registration**:
   - User fills registration form
   - API call to `/api/auth/register`
   - Token stored automatically
   - User redirected to appropriate page

3. **Session Persistence**:
   - Token stored in localStorage
   - On app load, token is used to fetch current user
   - User state maintained across page refreshes

4. **Logout**:
   - Token removed from localStorage
   - User state cleared from store
   - Redirect to home page

## 📁 File Structure

```
src/
├── lib/
│   └── api.ts                    # API client & token management
├── pages/
│   ├── Login.tsx                 # Login page
│   ├── Register.tsx              # Registration page
│   └── AdminPanel.tsx            # Admin dashboard
├── components/
│   ├── ProtectedRoute.tsx        # Route protection component
│   └── layout/
│       └── Navbar.tsx            # Updated navbar with auth
└── App.tsx                       # Updated with new routes
```

## 🚀 Usage

### Login
1. Navigate to `/login`
2. Enter credentials:
   - **Admin**: admin@example.com / admin123
   - **Customer**: customer@example.com / password123
3. Click "Sign in"
4. Redirected based on role

### Register
1. Navigate to `/register`
2. Fill in all fields
3. Select role (Customer or Provider)
4. Click "Create account"
5. Automatically logged in and redirected

### Admin Panel
1. Login as admin user
2. Click user icon in navbar
3. Select "Admin Panel" from dropdown
4. View dashboard, manage users, and verify providers

## 🔑 Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:5000/api
```

If not set, defaults to `http://localhost:5000/api`

## 📝 API Endpoints Used

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user (protected)
- `GET /api/admin/statistics/bookings` - Booking stats (admin)
- `GET /api/admin/statistics/providers` - Provider stats (admin)
- `GET /api/admin/users` - Get all users (admin)
- `PATCH /api/admin/providers/:id/verify` - Verify provider (admin)

## 🎯 Key Features

- ✅ JWT token-based authentication
- ✅ Role-based access control (customer, provider, admin)
- ✅ Protected routes
- ✅ Session persistence
- ✅ Admin dashboard with statistics
- ✅ User and provider management
- ✅ Responsive design
- ✅ Form validation
- ✅ Error handling
- ✅ Toast notifications

## 🔄 Next Steps

To use authentication in other pages:
1. Import `useAppStore` to access user state
2. Use `ProtectedRoute` component for protected pages
3. Use `authAPI` functions for authenticated API calls
4. Check `user.role` for role-based UI rendering

Example:
```typescript
import { useAppStore } from '@/store/useAppStore';

function MyComponent() {
  const { user } = useAppStore();
  
  if (!user) {
    return <div>Please login</div>;
  }
  
  return <div>Welcome, {user.name}!</div>;
}
```

