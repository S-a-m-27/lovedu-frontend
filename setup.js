const fs = require('fs');
const path = require('path');

// Create .env.local file if it doesn't exist
const envPath = path.join(__dirname, '.env.local');
const envExamplePath = path.join(__dirname, '.env.example');

if (!fs.existsSync(envPath)) {
  if (fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ Created .env.local from .env.example');
  } else {
    const envContent = `# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Backend API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000

# PayPal Configuration (for future use)
PAYPAL_CLIENT_ID=your_paypal_client_id_here
PAYPAL_CLIENT_SECRET=your_paypal_client_secret_here
`;
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Created .env.local with default values');
  }
  console.log('📝 Please update .env.local with your actual Supabase credentials');
} else {
  console.log('✅ .env.local already exists');
}

console.log('\n🚀 Setup complete! Run "npm run dev" to start the development server.');







