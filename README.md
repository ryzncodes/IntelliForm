# intelliForm

A dynamic form builder and survey platform built with Next.js 14, Supabase, and TypeScript. Create, manage, and analyze intelligent forms with ease.

## Features

- 🎨 Dynamic form builder with drag-and-drop interface
- 📝 Smart form validation and response handling
- 🔄 Multi-step form support with progress tracking
- 📱 Responsive design that works on all devices
- 🔒 Secure authentication and data storage with Supabase
- 📊 Real-time analytics and response tracking
- 🔙 Undo/Redo support with keyboard shortcuts
- ⭐ Advanced question types (Rating, Scale, etc.)
- 📋 Multiple form templates and customization options
- 📈 Export responses in various formats

## Form Builder Features

- ✨ Rich text editing with keyboard shortcuts
- 🔄 Undo/Redo functionality (Cmd/Ctrl + Z)
- 📝 Multiple question types:
  - Short Text & Long Text
  - Single & Multiple Choice
  - Rating (Star rating)
  - Scale (Numeric with labels)
  - Date & Time
  - Email & Phone
  - Number
- 🎯 Section-based organization
- 💾 Auto-save and draft support
- 👁️ Live preview mode

## Form Response Features

- ✅ Instant form validation
- 🔄 Auto-save responses
- 📱 Mobile-friendly response interface
- 🎯 Custom success pages
- 📊 Response analytics dashboard
- 🔒 Secure response storage
- 📤 Response export capabilities

## Tech Stack

- **Frontend:** Next.js 14, TailwindCSS, TypeScript, Shadcn UI
- **Backend:** Next.js API Routes, Supabase
- **Database:** PostgreSQL (via Supabase)
- **Authentication:** Supabase Auth
- **Deployment:** Vercel
- **State Management:** React Hooks
- **Form Handling:** Custom form hooks
- **Notifications:** Sonner toast

## Getting Started

1. Clone the repository:

```bash
git clone https://github.com/yourusername/intelliform.git
cd intelliform
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env.local
```

Fill in your Supabase credentials in `.env.local`

4. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Project Structure

```
intelliForm/
├── app/              # Next.js app directory
│   ├── auth/        # Authentication pages
│   ├── dashboard/   # User dashboard
│   ├── forms/       # Form pages
│   └── api/         # API routes
├── components/       # Reusable React components
│   ├── forms/       # Form-related components
│   ├── ui/          # UI components
│   └── shared/      # Shared components
├── lib/             # Utility functions and shared logic
│   ├── hooks/       # Custom React hooks
│   ├── utils/       # Utility functions
│   └── supabase/    # Supabase client and types
├── public/          # Static assets
└── types/           # TypeScript type definitions
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
