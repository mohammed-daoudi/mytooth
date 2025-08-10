// Test User Registration
const testRegistration = async () => {
  const testUser = {
    name: "Test User",
    email: `testuser${Date.now()}@example.com`,
    password: "TestPassword123!",
    confirmPassword: "TestPassword123!",
    phone: "555-0123"
  };

  console.log("Testing User Registration...");
  console.log("Test data:", testUser);

  try {
    const response = await fetch("http://localhost:3000/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testUser),
    });

    const data = await response.json();

    if (response.ok) {
      console.log("✅ Registration successful!");
      console.log("Response:", data);

      // Check if we got a token
      if (data.token) {
        console.log("✅ JWT token received");
      }

      // Check if user data is returned
      if (data.user) {
        console.log("✅ User data returned:", data.user);
      }

      return { success: true, data };
    } else {
      console.log("❌ Registration failed:", data.error || data.message);
      return { success: false, error: data.error || data.message };
    }
  } catch (error) {
    console.log("❌ Request failed:", error);
    return { success: false, error };
  }
};

// Run the test
testRegistration().then(result => {
  console.log("\nTest completed:", result.success ? "PASSED" : "FAILED");
  process.exit(result.success ? 0 : 1);
});
