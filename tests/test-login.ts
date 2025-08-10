// Test User Login
const testLogin = async () => {
  // First register a user
  const testUser = {
    name: "Login Test User",
    email: `logintest${Date.now()}@example.com`,
    password: "TestPassword123!",
    confirmPassword: "TestPassword123!",
    phone: "555-0124"
  };

  console.log("Setting up test user for login...");

  // Register the user first
  const registerResponse = await fetch("http://localhost:3000/api/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(testUser),
  });

  if (!registerResponse.ok) {
    console.log("❌ Failed to create test user");
    return { success: false, error: "Failed to create test user" };
  }

  console.log("✅ Test user created");

  // Now test login
  console.log("\nTesting User Login...");
  const loginData = {
    email: testUser.email,
    password: testUser.password
  };

  try {
    const response = await fetch("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(loginData),
    });

    const data = await response.json();

    if (response.ok) {
      console.log("✅ Login successful!");
      console.log("Response:", data);

      // Check if we got a token
      if (data.token) {
        console.log("✅ JWT token received");

        // Decode token to check claims
        const tokenParts = data.token.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
          console.log("✅ Token payload contains userId:", payload.userId);
          console.log("✅ Token payload contains email:", payload.email);
          console.log("✅ Token payload contains role:", payload.role);
        }
      }

      // Check if user data is returned
      if (data.user) {
        console.log("✅ User data returned");
      }

      // Test with wrong password
      console.log("\nTesting login with wrong password...");
      const wrongPasswordResponse = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: testUser.email,
          password: "WrongPassword123!"
        }),
      });

      if (!wrongPasswordResponse.ok) {
        console.log("✅ Correctly rejected wrong password");
      } else {
        console.log("❌ Security issue: Wrong password was accepted!");
        return { success: false, error: "Wrong password was accepted" };
      }

      return { success: true, data };
    } else {
      console.log("❌ Login failed:", data.error || data.message);
      return { success: false, error: data.error || data.message };
    }
  } catch (error) {
    console.log("❌ Request failed:", error);
    return { success: false, error };
  }
};

// Run the test
testLogin().then(result => {
  console.log("\nTest completed:", result.success ? "PASSED" : "FAILED");
  process.exit(result.success ? 0 : 1);
});
