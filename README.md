# intelliForm

A dynamic form builder and survey platform built with Next.js 14, Supabase, and TypeScript. Create, manage, and analyze intelligent forms with ease.

## Features

- 🎨 Dynamic form builder with drag-and-drop interface
- 📱 Responsive design that works on all devices
- 🔒 Secure authentication and data storage with Supabase
- 📊 Real-time analytics and response tracking
- 🤖 AI-powered form suggestions and optimization
- 📋 Multiple form templates and customization options
- 📈 Export responses in various formats

## Tech Stack

- **Frontend:** Next.js 14, TailwindCSS, TypeScript
- **Backend:** Next.js API Routes, Supabase
- **Database:** PostgreSQL (via Supabase)
- **Authentication:** Supabase Auth
- **Deployment:** Vercel

## Getting Started

1. Clone the repository:

```bash
git clone https://github.com/yourusername/intelliform.git
cd intelliform
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Set up environment variables:

```bash
cp .env.example .env.local
```

Fill in your Supabase credentials in `.env.local`

4. Run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Project Structure

```
intelliForm/
├── app/              # Next.js app directory
├── components/       # Reusable React components
├── lib/             # Utility functions and shared logic
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
