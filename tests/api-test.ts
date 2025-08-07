/**
 * Comprehensive API Testing Script for MyTooth App
 * This script tests all major features including auth, bookings, and admin functions
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Test data
const testUser = {
  name: 'Test User',
  email: `test${Date.now()}@mytooth.com`,
  password: 'TestPassword123!',
  phone: '555-0100'
};

const testAdmin = {
  name: 'Admin User',
  email: `admin${Date.now()}@mytooth.com`,
  password: 'AdminPassword123!',
  phone: '555-0200',
  role: 'admin'
};

const testBooking = {
  dentistId: '1',
  service: 'General Checkup',
  date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
  time: '10:00 AM',
  notes: 'Regular checkup and cleaning'
};

let authToken: string = '';
let adminToken: string = '';
let userId: string = '';
let bookingId: string = '';

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

function log(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') {
  const color = {
    success: colors.green,
    error: colors.red,
    info: colors.blue,
    warning: colors.yellow
  }[type];

  console.log(`${color}${message}${colors.reset}`);
}

// 1. TEST AUTHENTICATION FLOW
async function testAuthentication() {
  log('\n========== TESTING AUTHENTICATION ==========', 'info');

  try {
    // Test user registration
    log('Testing user registration...', 'info');
    const registerResponse = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });

    const registerData = await registerResponse.json();

    if (registerResponse.ok) {
      log('✓ User registration successful', 'success');
      userId = registerData.user?.id || registerData.userId;
      console.log('User ID:', userId);
    } else {
      log(`✗ Registration failed: ${registerData.error}`, 'error');
    }

    // Test user login
    log('Testing user login...', 'info');
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password
      })
    });

    const loginData = await loginResponse.json();

    if (loginResponse.ok) {
      log('✓ User login successful', 'success');
      authToken = loginData.token;
      console.log('JWT Token received:', authToken ? 'Yes' : 'No');
    } else {
      log(`✗ Login failed: ${loginData.error}`, 'error');
    }

    // Test protected route access
    log('Testing protected route access...', 'info');
    const profileResponse = await fetch(`${BASE_URL}/api/user/profile`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    if (profileResponse.ok) {
      log('✓ Protected route access successful', 'success');
      const profileData = await profileResponse.json();
      console.log('User profile:', profileData.user?.name);
    } else {
      log('✗ Protected route access failed', 'error');
    }

  } catch (error) {
    log(`Authentication test error: ${error}`, 'error');
  }
}

// 2. TEST BOOKING SYSTEM
async function testBookingSystem() {
  log('\n========== TESTING BOOKING SYSTEM ==========', 'info');

  try {
    // Create a new booking
    log('Creating new appointment...', 'info');
    const createResponse = await fetch(`${BASE_URL}/api/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(testBooking)
    });

    const createData = await createResponse.json();

    if (createResponse.ok) {
      log('✓ Appointment created successfully', 'success');
      bookingId = createData.booking?.id || createData.bookingId || createData._id;
      console.log('Booking ID:', bookingId);
    } else {
      log(`✗ Booking creation failed: ${createData.error}`, 'error');
    }

    // Get user's bookings
    log('Fetching user appointments...', 'info');
    const getBookingsResponse = await fetch(`${BASE_URL}/api/bookings`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    if (getBookingsResponse.ok) {
      const bookingsData = await getBookingsResponse.json();
      log(`✓ Retrieved ${bookingsData.bookings?.length || 0} appointment(s)`, 'success');
    } else {
      log('✗ Failed to fetch bookings', 'error');
    }

    // Update booking (if we have a booking ID)
    if (bookingId) {
      log('Updating appointment...', 'info');
      const updateResponse = await fetch(`${BASE_URL}/api/bookings/${bookingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          time: '2:00 PM',
          notes: 'Updated: Regular checkup and cleaning'
        })
      });

      if (updateResponse.ok) {
        log('✓ Appointment updated successfully', 'success');
      } else {
        log('✗ Failed to update appointment', 'error');
      }
    }

  } catch (error) {
    log(`Booking system test error: ${error}`, 'error');
  }
}

// 3. TEST ADMIN FUNCTIONALITY
async function testAdminDashboard() {
  log('\n========== TESTING ADMIN DASHBOARD ==========', 'info');

  try {
    // First, create an admin account
    log('Creating admin account...', 'info');
    const adminRegisterResponse = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testAdmin)
    });

    if (adminRegisterResponse.ok) {
      log('✓ Admin account created', 'success');
    }

    // Login as admin
    log('Admin login...', 'info');
    const adminLoginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testAdmin.email,
        password: testAdmin.password
      })
    });

    const adminLoginData = await adminLoginResponse.json();

    if (adminLoginResponse.ok) {
      adminToken = adminLoginData.token;
      log('✓ Admin login successful', 'success');
    } else {
      log('✗ Admin login failed', 'error');
    }

    // Test admin endpoints
    log('Testing admin user management...', 'info');
    const usersResponse = await fetch(`${BASE_URL}/api/admin/users`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });

    if (usersResponse.ok) {
      const usersData = await usersResponse.json();
      log(`✓ Admin can view users (Total: ${usersData.users?.length || 0})`, 'success');
    } else {
      log('✗ Admin user access failed', 'error');
    }

    // Test admin booking management
    log('Testing admin booking management...', 'info');
    const adminBookingsResponse = await fetch(`${BASE_URL}/api/admin/bookings`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });

    if (adminBookingsResponse.ok) {
      const bookingsData = await adminBookingsResponse.json();
      log(`✓ Admin can view all bookings (Total: ${bookingsData.bookings?.length || 0})`, 'success');
    } else {
      log('✗ Admin booking access failed', 'error');
    }

  } catch (error) {
    log(`Admin dashboard test error: ${error}`, 'error');
  }
}

// 4. TEST MONGODB CONNECTION
async function testMongoDBConnection() {
  log('\n========== TESTING MONGODB CONNECTION ==========', 'info');

  try {
    // Test database health endpoint
    log('Checking database health...', 'info');
    const healthResponse = await fetch(`${BASE_URL}/api/health`);
    const healthData = await healthResponse.json();

    if (healthResponse.ok && healthData.database === 'connected') {
      log('✓ MongoDB connection is healthy', 'success');
    } else {
      log('✗ MongoDB connection issue detected', 'error');
    }

    // Test data persistence by creating and retrieving data
    log('Testing data persistence...', 'info');

    // Create test data
    const testDataUser = {
      name: 'Persistence Test',
      email: `persist${Date.now()}@test.com`,
      password: 'PersistTest123!',
      phone: '555-9999'
    };

    const createUserResponse = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testDataUser)
    });

    if (createUserResponse.ok) {
      log('✓ Data successfully persisted to MongoDB', 'success');

      // Verify by logging in
      const verifyResponse = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testDataUser.email,
          password: testDataUser.password
        })
      });

      if (verifyResponse.ok) {
        log('✓ Data retrieval from MongoDB confirmed', 'success');
      }
    } else {
      log('✗ Data persistence test failed', 'error');
    }

  } catch (error) {
    log(`MongoDB connection test error: ${error}`, 'error');
  }
}

// 5. TEST SERVICES AND DENTISTS
async function testServicesAndDentists() {
  log('\n========== TESTING SERVICES & DENTISTS ==========', 'info');

  try {
    // Test fetching services
    log('Fetching available services...', 'info');
    const servicesResponse = await fetch(`${BASE_URL}/api/services`);

    if (servicesResponse.ok) {
      const servicesData = await servicesResponse.json();
      log(`✓ Retrieved ${servicesData.services?.length || 0} service(s)`, 'success');
      if (servicesData.services?.length > 0) {
        console.log('Sample services:', servicesData.services.slice(0, 3).map((s: any) => s.name).join(', '));
      }
    } else {
      log('✗ Failed to fetch services', 'error');
    }

    // Test fetching dentists
    log('Fetching available dentists...', 'info');
    const dentistsResponse = await fetch(`${BASE_URL}/api/dentists`);

    if (dentistsResponse.ok) {
      const dentistsData = await dentistsResponse.json();
      log(`✓ Retrieved ${dentistsData.dentists?.length || 0} dentist(s)`, 'success');
      if (dentistsData.dentists?.length > 0) {
        console.log('Sample dentists:', dentistsData.dentists.slice(0, 3).map((d: any) => d.name).join(', '));
      }
    } else {
      log('✗ Failed to fetch dentists', 'error');
    }

  } catch (error) {
    log(`Services/Dentists test error: ${error}`, 'error');
  }
}

// Main test runner
async function runAllTests() {
  log('\n╔════════════════════════════════════════════╗', 'info');
  log('║     MYTOOTH APP COMPREHENSIVE TESTING     ║', 'info');
  log('╚════════════════════════════════════════════╝', 'info');

  const startTime = Date.now();

  // Run all tests in sequence
  await testMongoDBConnection();
  await testAuthentication();
  await testBookingSystem();
  await testAdminDashboard();
  await testServicesAndDentists();

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  log('\n╔════════════════════════════════════════════╗', 'info');
  log(`║     ALL TESTS COMPLETED IN ${duration}s     ║`, 'info');
  log('╚════════════════════════════════════════════╝', 'info');

  // Summary
  log('\n========== TEST SUMMARY ==========', 'info');
  log('✓ Authentication Flow: Tested', 'success');
  log('✓ Booking System: Tested', 'success');
  log('✓ Admin Dashboard: Tested', 'success');
  log('✓ MongoDB Connection: Tested', 'success');
  log('✓ Services & Dentists: Tested', 'success');

  log('\nNote: Email notifications require additional SMTP setup', 'warning');
}

// Run tests
runAllTests().catch(error => {
  log(`Test runner error: ${error}`, 'error');
  process.exit(1);
});
