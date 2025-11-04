# E-Commerce Admin Dashboard

A modern, full-featured e-commerce admin dashboard built with Next.js 14, TypeScript, and Tailwind CSS.

## 🚀 Features

### Core Functionality
- **Dashboard**: Comprehensive analytics and business insights
- **Products Management**: Full CRUD operations with image upload
- **Orders Management**: Order tracking and status management
- **Customers**: Customer database and management
- **Settings**: Store configuration and preferences

### Advanced Features
- **Dark Mode**: Complete dark/light theme support
- **Real-time Notifications**: Intelligent notification system
- **Profile Management**: User profile with picture upload
- **Responsive Design**: Mobile-first responsive layout
- **Authentication**: Secure login/logout system
- **Data Persistence**: Local storage for data management

### Technical Features
- **TypeScript**: Full type safety
- **Modern UI**: Beautiful, professional interface
- **Performance**: Optimized for speed
- **Accessibility**: WCAG compliant
- **SEO Ready**: Meta tags and optimization

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Charts**: Recharts
- **State Management**: React Context
- **Authentication**: Custom implementation
- **Storage**: Local Storage (easily replaceable with backend)

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mernStack/client
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   ```
   http://localhost:3001
   ```

## 🔐 Default Login Credentials

- **Email**: admin@example.com
- **Password**: admin123

## 📁 Project Structure

```
client/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── dashboard/         # Dashboard page
│   │   ├── products/          # Products management
│   │   ├── orders/            # Orders management
│   │   ├── customers/         # Customers page
│   │   ├── settings/          # Settings page
│   │   ├── login/             # Authentication
│   │   └── register/          # User registration
│   ├── components/            # Reusable components
│   │   ├── Layout.tsx         # Main layout
│   │   ├── Header.tsx         # Header with notifications
│   │   ├── Sidebar.tsx        # Navigation sidebar
│   │   └── ...
│   ├── contexts/              # React contexts
│   │   ├── ThemeContext.tsx   # Theme management
│   │   └── ProfileContext.tsx # Profile management
│   ├── services/              # Business logic
│   │   ├── authService.ts     # Authentication
│   │   ├── notificationService.ts # Notifications
│   │   └── mockData.ts        # Mock data
│   ├── interfaces/            # TypeScript interfaces
│   └── utils/                 # Utility functions
├── public/                    # Static assets
└── package.json
```

## 🎨 Key Components

### Dashboard
- Real-time statistics cards
- Revenue and order charts
- Recent orders and activities
- Quick actions

### Products Management
- Product listing with search and filters
- Add/Edit/Delete products
- Image upload and management
- Stock level monitoring
- Category management

### Orders Management
- Order listing with status filters
- Order status updates
- Customer information
- Order details view

### Settings
- Store information configuration
- Notification preferences
- Appearance settings
- Profile picture management
- Admin profile settings

### Authentication
- Secure login/logout
- User registration
- Session management
- Password validation

## 🔧 Customization

### Backend Integration
The app is designed for easy backend integration. Replace localStorage calls with API calls:

```typescript
// Example: Replace in services/
const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export async function fetchProducts() {
  const response = await fetch(`${API_BASE}/api/products`);
  return response.json();
}
```

### Environment Variables
Create `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Styling
- Uses Tailwind CSS for styling
- Dark mode support built-in
- Customizable color scheme
- Responsive breakpoints

## 📱 Features Overview

### 🌓 Dark Mode
- Automatic system preference detection
- Manual toggle in header
- Complete theme coverage

### 🔔 Notifications
- Real-time notification system
- Priority-based alerts
- Actionable notifications
- Mark as read functionality

### 👤 Profile Management
- Profile picture upload
- User information display
- Settings integration

### 📊 Analytics
- Revenue tracking
- Order statistics
- Customer metrics
- Performance charts

### 🔍 Search & Filters
- Global search functionality
- Advanced filtering options
- Real-time results

## 🚀 Deployment

### Build for Production
```bash
npm run build
npm start
```

### Environment Setup
- Set `NODE_ENV=production`
- Configure API endpoints
- Set up proper authentication

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review the code comments

---

**Built with ❤️ using Next.js, TypeScript, and Tailwind CSS**
