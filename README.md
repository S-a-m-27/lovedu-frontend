# University AI Studio

A bilingual (English + Arabic, RTL) ChatGPT-style frontend web app built with Next.js 14, designed for Kuwait University members.

## Features

🔐 **Authentication (Supabase)**
- Supabase Auth integration
- Domain restriction (@ku.edu.kw and @grad.ku.edu.kw)
- Session management

💳 **PayPal Subscription Middleware**
- Subscription status checking
- Professional subscription page
- Mock PayPal integration

💬 **Chat Interface**
- ChatGPT-style UI with sidebar
- Multiple AI assistants (Type X, References, Therapy GPT)
- Source indicators (Internal PDF, Web search)
- Mode selection (GPT vs Perplexity)

🌍 **Bilingual & RTL Support**
- English/Arabic language switching
- RTL layout for Arabic
- next-intl integration

🎨 **Design**
- Tailwind CSS + shadcn/ui components
- University colors (navy blue, gold)
- Dark/light mode toggle
- Framer Motion animations
- Fully responsive

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd university-ai-studio
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
PAYPAL_CLIENT_ID=your_paypal_client_id_here
PAYPAL_CLIENT_SECRET=your_paypal_client_secret_here
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
app/
├── (auth)/
│   ├── login/page.tsx
│   └── signup/page.tsx
├── (paywall)/
│   └── subscribe/page.tsx
├── (protected)/
│   └── chat/page.tsx
├── layout.tsx
├── page.tsx
└── middleware.ts

components/
├── ui/
│   ├── button.tsx
│   ├── input.tsx
│   └── card.tsx
├── ChatSidebar.tsx
├── ChatMessage.tsx
├── LanguageSwitcher.tsx
└── ThemeToggle.tsx

hooks/
├── useSupabaseAuth.ts
├── useCheckSubscription.ts
└── useLanguage.ts

lib/
├── supabaseClient.ts
├── paypalClient.ts
└── utils.ts

messages/
├── en.json
└── ar.json
```

## Features Overview

### Authentication Flow
1. Unauthenticated users → `/login`
2. Domain validation (Kuwait University emails only)
3. After login → subscription check
4. No subscription → `/subscribe`
5. Active subscription → `/chat`

### Chat Interface
- **Sidebar**: New chat, assistant selection, settings, logout
- **Main Area**: Message history with smooth scrolling
- **Input**: Message input with send button
- **Header**: Assistant name and mode selection

### Internationalization
- Language switching (EN/AR)
- RTL support for Arabic
- Persistent language preference
- Translated UI elements

### Theme Support
- Dark/light mode toggle
- Persistent theme preference
- Smooth transitions

## Customization

### Adding New Assistants
Edit the assistants array in `components/ChatSidebar.tsx`:

```typescript
const assistants = [
  { id: 'newAssistant', name: 'New Assistant', icon: YourIcon },
  // ... existing assistants
]
```

### Adding New Languages
1. Create new message file in `messages/` directory
2. Update `i18n.ts` locales array
3. Add language switcher option

### Styling
- Colors: Edit CSS variables in `app/globals.css`
- Components: Modify Tailwind classes in component files
- Animations: Update Framer Motion configurations

## Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push

### Other Platforms
1. Build the project: `npm run build`
2. Start production server: `npm start`
3. Configure environment variables

## Backend Integration

This frontend is designed to work with a FastAPI backend. Key integration points:

- **Authentication**: Supabase Auth
- **Chat API**: RESTful endpoints for message handling
- **Subscription**: PayPal webhook integration
- **File Upload**: PDF processing for internal sources

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, email support@university-ai-studio.com or create an issue in the repository.







