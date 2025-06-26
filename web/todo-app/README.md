# AI-Powered Todo App

A modern, intelligent todo application built with React, TypeScript, and Deno that showcases the integration of AI API and Profile Service within the monorepo ecosystem.

## ✨ Features

### Core Todo Functionality
- ✅ Create, edit, delete, and complete tasks
- 🏷️ Organize tasks with categories and priorities
- 🔍 Advanced filtering and search capabilities
- 📊 Progress tracking and statistics
- 💾 Local storage persistence

### AI-Powered Features
- 🤖 **AI Task Generation**: Generate intelligent task suggestions based on your goals
- 🎯 **Smart Categorization**: Automatic task categorization using AI
- 💡 **Completion Suggestions**: Get AI-powered tips for completing tasks
- 🎉 **Motivational Messages**: AI-generated encouragement based on your progress

### Profile & Credits System
- 👤 **User Profiles**: Manage your profile with name and avatar
- 💰 **Credits System**: Earn and spend credits for AI features
- 🎁 **Daily Bonuses**: Claim daily credit bonuses
- 📈 **Transaction History**: Track your credit usage and earnings

### Modern UI/UX
- 🎨 **Beautiful Design**: Modern gradient backgrounds and smooth animations
- 📱 **Responsive**: Works perfectly on desktop, tablet, and mobile
- ⚡ **Fast Performance**: Built with Vite for lightning-fast development and builds
- 🌟 **Intuitive Interface**: Clean, user-friendly design

## 🚀 Quick Start

### Prerequisites

- **Deno 2.3.6+**: [Install Deno](https://deno.land/manual/getting_started/installation)
- **AI API Service**: Must be running on port 8000
- **Profile Service**: Must be running on port 8080

### 1. Start Required Services

First, ensure the AI API and Profile services are running:

```bash
# Terminal 1: Start AI API Service
cd internal/ai-api
deno task dev

# Terminal 2: Start Profile Service  
cd internal/profile-service
deno task dev
```

### 2. Start the Todo App

```bash
# Navigate to the todo app directory
cd web/todo-app

# Start the development server
deno task dev
```

The app will be available at `http://localhost:3000`

### 3. Environment Configuration (Optional)

Create a `.env` file to customize API URLs:

```bash
cp .env.example .env
```

Edit `.env` with your preferred settings:

```env
VITE_AI_API_URL=http://localhost:8000
VITE_PROFILE_API_URL=http://localhost:8080
VITE_DEV_MODE=true
```

## 🏗️ Architecture

### Technology Stack

- **Frontend**: React 19 with TypeScript
- **Build Tool**: Vite 6.1 with Deno integration
- **Styling**: Modern CSS with custom properties and animations
- **State Management**: React hooks with local state
- **Data Persistence**: Browser localStorage with versioning
- **AI Integration**: Custom SDK for AI API service
- **Profile Management**: Custom SDK for Profile service

### Project Structure

```
web/todo-app/
├── src/
│   ├── components/          # React components
│   │   ├── Header.tsx       # App header with branding
│   │   ├── ProfileCard.tsx  # User profile and credits
│   │   ├── TodoList.tsx     # Todo list container
│   │   ├── TodoItem.tsx     # Individual todo item
│   │   ├── TodoForm.tsx     # Create/edit todo form
│   │   ├── AIAssistant.tsx  # AI task generation
│   │   ├── FilterBar.tsx    # Search and filtering
│   │   ├── StatsCard.tsx    # Progress statistics
│   │   └── ...              # Utility components
│   ├── services/            # API integration layer
│   │   ├── aiService.ts     # AI API integration
│   │   ├── profileService.ts # Profile service integration
│   │   └── todoService.ts   # Local todo management
│   ├── types.ts             # TypeScript type definitions
│   ├── App.tsx              # Main application component
│   ├── App.css              # Application-specific styles
│   ├── index.css            # Global styles and utilities
│   └── main.tsx             # Application entry point
├── public/                  # Static assets
├── e2e/                     # End-to-end tests
├── deno.json               # Deno configuration and dependencies
├── vite.config.ts          # Vite build configuration
├── index.html              # HTML template
└── README.md               # This file
```

### Service Integration

The app integrates with two core services:

1. **AI API Service** (`internal/ai-api`)
   - Task generation and suggestions
   - Smart categorization
   - Completion tips and motivation

2. **Profile Service** (`internal/profile-service`)
   - User profile management
   - Credits system and transactions
   - Cross-domain identity management

## 🎮 Usage Guide

### Getting Started

1. **First Visit**: The app will automatically create an anonymous profile and give you initial credits
2. **Claim Daily Bonus**: Click the "🎁 Claim Daily Bonus" button to get free credits
3. **Create Tasks**: Use the "+ Add Task" button or try the "✨ AI Assistant"

### Creating Tasks

#### Manual Creation
1. Click "+ Add Task"
2. Fill in the title (required)
3. Add description, priority, category, and due date (optional)
4. Click "Create Task"

#### AI-Powered Creation
1. Click "✨ AI Assistant"
2. Describe what you want to accomplish
3. Choose number of tasks to generate
4. Review and select the AI suggestions
5. Click "Create Selected Tasks"

### Managing Tasks

- **Complete**: Check the checkbox to mark as done
- **Edit**: Click the ✏️ icon to modify task details
- **Delete**: Click the 🗑️ icon to remove tasks
- **Filter**: Use the filter bar to find specific tasks

### Profile Management

- **Edit Profile**: Click "✏️ Edit" in the profile card
- **Monitor Credits**: View your balance and transaction history
- **Daily Bonus**: Claim once per day for free credits

## 🧪 Testing

### Running Tests

```bash
# Run unit tests
deno task test

# Run tests in watch mode
deno task test:watch

# Run end-to-end tests
deno task test:e2e

# Run all tests
deno task test:all
```

### Test Structure

- **Unit Tests**: Component and service testing
- **Integration Tests**: Service interaction testing
- **E2E Tests**: Full application workflow testing

## 🚀 Building for Production

```bash
# Build the application
deno task build

# Preview the production build
deno task preview

# Serve static files
deno task serve
```

The built files will be in the `dist/` directory.

## 🔧 Development

### Available Scripts

- `deno task dev` - Start development server with hot reload
- `deno task build` - Build for production
- `deno task preview` - Preview production build
- `deno task test` - Run unit tests
- `deno task test:e2e` - Run end-to-end tests

### Code Style

The project follows modern TypeScript and React best practices:

- Functional components with hooks
- TypeScript strict mode
- Consistent naming conventions
- Comprehensive error handling
- Responsive design patterns

## 🤝 Contributing

1. Follow the monorepo development guidelines
2. Ensure all tests pass before submitting
3. Add tests for new features
4. Update documentation as needed

## 📝 License

This project is part of the monorepo ecosystem. See the root LICENSE file for details.

## 🆘 Troubleshooting

### Common Issues

**App won't start:**
- Ensure AI API and Profile services are running
- Check that ports 8000 and 8080 are available
- Verify Deno version is 2.3.6 or later

**AI features not working:**
- Check AI API service is running and healthy
- Ensure you have sufficient credits
- Verify API URLs in environment configuration

**Profile/Credits issues:**
- Check Profile service is running
- Clear browser storage if needed
- Verify cross-domain cookie settings

**Build errors:**
- Clear Deno cache: `deno cache --reload`
- Check TypeScript errors in the console
- Ensure all dependencies are properly installed

For more help, refer to the individual service documentation:
- [AI API Development Guide](../../internal/ai-api/DEVELOPMENT_GUIDE.md)
- [Profile Service Development Guide](../../internal/profile-service/DEVELOPMENT_GUIDE.md)
