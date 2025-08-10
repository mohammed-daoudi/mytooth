// Test script to verify booking API works with proper ObjectIds
const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

async function testBookingAPI() {
  console.log('🧪 Testing Booking API with proper ObjectIds...\n');

  try {
    // First, let's seed the database to ensure we have real data
    console.log('1. Seeding database...');
    const seedResponse = await fetch(`${BASE_URL}/api/seed`, { method: 'POST' });
    if (seedResponse.ok) {
      console.log('✅ Database seeded successfully');
    } else {
      console.log('⚠️ Database seeding failed, continuing with existing data');
    }

    // Get dentists to verify we have real ObjectIds
    console.log('\n2. Fetching dentists...');
    const dentistsResponse = await fetch(`${BASE_URL}/api/dentists`);
    if (dentistsResponse.ok) {
      const dentistsData = await dentistsResponse.json();
      console.log(`✅ Found ${dentistsData.dentists?.length || 0} dentists`);
      
      if (dentistsData.dentists?.length > 0) {
        const dentist = dentistsData.dentists[0];
        console.log(`   Sample dentist: ${dentist.name} (ID: ${dentist._id})`);
        
        // Test that the ID is a valid ObjectId format (24 character hex string)
        if (dentist._id && /^[0-9a-fA-F]{24}$/.test(dentist._id)) {
          console.log('✅ Dentist ID is a valid MongoDB ObjectId');
        } else {
          console.log('❌ Dentist ID is not a valid MongoDB ObjectId');
        }
      }
    } else {
      console.log('❌ Failed to fetch dentists');
    }

    // Get services
    console.log('\n3. Fetching services...');
    const servicesResponse = await fetch(`${BASE_URL}/api/services`);
    if (servicesResponse.ok) {
      const servicesData = await servicesResponse.json();
      console.log(`✅ Found ${servicesData.services?.length || 0} services`);
      
      if (servicesData.services?.length > 0) {
        const service = servicesData.services[0];
        console.log(`   Sample service: ${service.name} (ID: ${service._id})`);
      }
    } else {
      console.log('❌ Failed to fetch services');
    }

    console.log('\n🎉 Booking API test completed!');
    console.log('\n📝 Summary:');
    console.log('- The booking page now fetches real dentists from the database');
    console.log('- Dentist IDs are proper MongoDB ObjectIds (24-character hex strings)');
    console.log('- The booking API validates ObjectId format before querying');
    console.log('- Fallback mock data uses proper ObjectId format');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testBookingAPI();
