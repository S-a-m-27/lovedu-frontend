// Setup script to create a test user in Supabase
// Run this script once to create the test user

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://avyvigkmcdqawzaydoan.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2eXZpZ2ttY2RxYXd6YXlkb2FuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzMDU3ODksImV4cCI6MjA3Njg4MTc4OX0.oo2CotdfNJAQ8ZesoyP4gfJ9pyWoq8CMA4xtWPW4vd0'

const supabase = createClient(supabaseUrl, supabaseKey)

async function createTestUser() {
  console.log('Creating test user...')
  
  try {
    // Create the test user
    const { data, error } = await supabase.auth.signUp({
      email: 'test@ku.edu.kw',
      password: 'testpassword123',
      options: {
        data: {
          name: 'Test User',
          university_domain: 'ku.edu.kw'
        }
      }
    })

    if (error) {
      console.error('Error creating test user:', error.message)
      if (error.message.includes('already registered')) {
        console.log('✅ Test user already exists!')
        console.log('📧 Email: test@ku.edu.kw')
        console.log('🔑 Password: testpassword123')
        return
      }
    } else {
      console.log('✅ Test user created successfully!')
      console.log('📧 Email: test@ku.edu.kw')
      console.log('🔑 Password: testpassword123')
      console.log('⚠️  Note: You may need to confirm the email in Supabase dashboard')
    }
  } catch (err) {
    console.error('Unexpected error:', err)
  }
}

createTestUser()







