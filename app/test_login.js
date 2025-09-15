const fetch = require('node-fetch')

async function testLogin() {
  try {
    // test login
    const loginResponse = await fetch('http://localhost:3000/api/auth/signin/credentials', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'john@doe.com',
        password: 'johndoe123',
        redirect: false
      })
    })
    
    console.log('login test status:', loginResponse.status)
    
    // test dashboard endpoint
    const dashResponse = await fetch('http://localhost:3000/api/dashboard')
    console.log('dashboard test status:', dashResponse.status)
    
    if (dashResponse.ok) {
      const data = await dashResponse.json()
      console.log('tasks found:', data.tasks?.length || 0)
      console.log('categories found:', data.categories?.length || 0)
      console.log('stats:', data.stats)
    }
    
  } catch (error) {
    console.error('test error:', error.message)
  }
}

testLogin()
