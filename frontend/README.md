# Movie App with Authentication

A modern React TypeScript application with comprehensive authentication system, featuring signup, signin, form validation, and beautiful UI components.

## Features

### 🔐 Authentication System

- **Sign Up**: Complete registration with name, email, and password
- **Sign In**: Secure login with email and password
- **Form Validation**: Real-time validation with error messages
- **Alert System**: Beautiful success/error notifications
- **Token Management**: Automatic token storage and retrieval
- **Protected Routes**: Secure route protection

### 🎨 UI/UX Features

- **Modern Design**: Glassmorphism design with backdrop blur
- **Responsive**: Mobile-first responsive design
- **Loading States**: Animated loading spinners
- **Form Validation**: Real-time field validation with visual feedback
- **Alert Notifications**: Animated success/error alerts
- **Internationalization**: Multi-language support (EN, DE, NL)

### 🏗️ Architecture

- **Centralized API Service**: Clean API abstraction layer
- **Type Safety**: Full TypeScript implementation
- **Error Handling**: Comprehensive error management
- **Validation Utilities**: Reusable validation functions
- **Component Architecture**: Modular, reusable components

## API Integration

The application integrates with a REST API running on `http://localhost:3001`:

### Authentication Endpoints

#### Register User

```bash
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

#### Login User

```bash
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

## Project Structure

```
src/
├── components/
│   ├── Alert.tsx              # Reusable alert component
│   ├── SignIn.tsx             # Login form with validation
│   ├── SignUp.tsx             # Registration form with validation
│   ├── ProtectedRoute.tsx     # Route protection component
│   └── ...
├── services/
│   ├── apiService.ts          # Centralized API service
│   ├── authService.ts         # Authentication service
│   └── movieService.ts        # Movie management service
├── utils/
│   └── validation.ts          # Form validation utilities
├── types/
│   └── Movie.ts              # TypeScript interfaces
└── locales/
    ├── en.json               # English translations
    ├── de.json               # German translations
    └── nl.json               # Dutch translations
```

## Key Components

### Alert Component

- **Types**: Success, Error, Info
- **Auto-dismiss**: Configurable duration
- **Animations**: Smooth slide-in/out transitions
- **Icons**: Contextual icons for each type

### Form Validation

- **Email Validation**: Regex pattern matching
- **Password Requirements**: Minimum 6 characters
- **Name Validation**: Letters and spaces only
- **Real-time Feedback**: Clear error messages
- **Field-specific Errors**: Individual field validation

### API Service

- **Centralized**: Single point for all API calls
- **Error Handling**: Consistent error management
- **Token Management**: Automatic auth header injection
- **Type Safety**: Full TypeScript support

## Getting Started

1. **Install Dependencies**

   ```bash
   npm install
   ```

2. **Start the Development Server**

   ```bash
   npm run dev
   ```

3. **Start the API Server**

   ```bash
   # Make sure your API server is running on http://localhost:3001
   ```

4. **Access the Application**
   - Open `http://localhost:5173` in your browser
   - Navigate to `/signup` to create an account
   - Or `/signin` to log in

## Authentication Flow

1. **Registration**:

   - User fills out signup form
   - Real-time validation provides feedback
   - Form submission calls `/auth/register`
   - Success: User is logged in and redirected
   - Error: Alert shows specific error message

2. **Login**:

   - User enters credentials
   - Validation ensures proper format
   - Form submission calls `/auth/login`
   - Success: User is logged in and redirected
   - Error: Alert shows authentication error

3. **Protected Routes**:
   - Routes check authentication status
   - Unauthenticated users redirected to login
   - Authenticated users can access protected content

## Error Handling

The application handles various error scenarios:

- **Network Errors**: Connection issues
- **Validation Errors**: Form field validation
- **Authentication Errors**: Invalid credentials
- **Server Errors**: API endpoint errors
- **User Feedback**: Clear error messages with alerts

## Styling

The application uses Tailwind CSS with a custom dark theme:

- **Background**: Dark gradient with glassmorphism
- **Cards**: Semi-transparent with backdrop blur
- **Primary Color**: Green accent (#22c55e)
- **Error States**: Red borders and text
- **Success States**: Green accents
- **Animations**: Smooth transitions and loading states

## Internationalization

The app supports multiple languages:

- **English** (en): Default language
- **German** (de): Deutsche Übersetzung
- **Dutch** (nl): Nederlandse vertaling

Language switching is available through the LanguageSwitcher component.

## Security Features

- **Token Storage**: Secure localStorage management
- **Input Validation**: Client-side validation
- **Error Sanitization**: Safe error message display
- **Route Protection**: Authentication-based routing
- **CSRF Protection**: API service handles headers

## Development

### Adding New API Endpoints

1. **Update API Service**:

   ```typescript
   // In apiService.ts
   async newEndpoint<T>(data: any): Promise<T> {
     return this.post<T>('/your-endpoint', data);
   }
   ```

2. **Create Service Method**:
   ```typescript
   // In your service file
   async newFeature(data: any): Promise<ResponseType> {
     return apiService.newEndpoint<ResponseType>(data);
   }
   ```

### Adding New Validation Rules

1. **Update Validation Utils**:

   ```typescript
   // In validation.ts
   export const validateNewField = (value: string): string | null => {
     // Your validation logic
   };
   ```

2. **Use in Components**:
   ```typescript
   const errors = validateNewField(formData.field);
   ```

## Contributing

1. Follow the existing code structure
2. Add proper TypeScript types
3. Include validation for new forms
4. Add translations for new text
5. Test error scenarios
6. Update documentation

## License

This project is licensed under the MIT License.
