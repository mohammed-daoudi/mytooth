// Test JWT Token Generation and Validation
import jwt from 'jsonwebtoken';

const testJWT = async () => {
  // First create a user and get a token
  const testUser = {
    name: "JWT Test User",
    email: `jwttest${Date.now()}@example.com`,
    password: "TestPassword123!",
    confirmPassword: "TestPassword123!",
    phone: "555-0125"
  };

  console.log("Creating test user for JWT testing...");

  const registerResponse = await fetch("http://localhost:3000/api/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(testUser),
  });

  const registerData = await registerResponse.json();

  if (!registerResponse.ok) {
    console.log("❌ Failed to create test user");
    return { success: false, error: "Failed to create test user" };
  }

  console.log("✅ Test user created with token");

  const token = registerData.token;
  const JWT_SECRET = "a-super-secret-jwt-key-for-mytooth-app-2024-secure-token-generation";

  console.log("\nTesting JWT Token Generation...");

  // Test 1: Check token structure
  const tokenParts = token.split('.');
  if (tokenParts.length === 3) {
    console.log("✅ Token has correct structure (header.payload.signature)");
  } else {
    console.log("❌ Token structure is invalid");
    return { success: false, error: "Invalid token structure" };
  }

  // Test 2: Decode and verify token locally
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    console.log("✅ Token signature is valid");
    console.log("✅ Token payload:", {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      aud: decoded.aud,
      iss: decoded.iss
    });

    // Check required claims
    if (decoded.userId) console.log("✅ Contains userId claim");
    if (decoded.email) console.log("✅ Contains email claim");
    if (decoded.role) console.log("✅ Contains role claim");
    if (decoded.exp) console.log("✅ Contains expiration claim");
    if (decoded.iat) console.log("✅ Contains issued at claim");
    if (decoded.aud === 'my-tooth-users') console.log("✅ Contains correct audience");
    if (decoded.iss === 'my-tooth-clinic') console.log("✅ Contains correct issuer");

    // Check expiration (should be 1 hour from now)
    const now = Math.floor(Date.now() / 1000);
    const expiresIn = decoded.exp - now;
    if (expiresIn > 3500 && expiresIn < 3700) {
      console.log("✅ Token expires in ~1 hour");
    }

  } catch (error: any) {
    console.log("❌ Token verification failed:", error.message);
    return { success: false, error: error.message };
  }

  // Test 3: Test token refresh endpoint
  console.log("\nTesting token refresh...");
  try {
    const refreshResponse = await fetch("http://localhost:3000/api/auth/refresh", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
    });

    const refreshData = await refreshResponse.json();

    if (refreshResponse.ok && refreshData.token) {
      console.log("✅ Token refresh successful");

      // Verify new token is different
      if (refreshData.token !== token) {
        console.log("✅ New token is different from old token");
      }

      // Verify new token is valid
      const newDecoded = jwt.verify(refreshData.token, JWT_SECRET) as any;
      if (newDecoded.userId === registerData.user.userId) {
        console.log("✅ New token contains same userId");
      }
    } else {
      console.log("❌ Token refresh failed:", refreshData.error || refreshData.message);
    }
  } catch (error) {
    console.log("❌ Refresh request failed:", error);
  }

  // Test 4: Test with invalid token
  console.log("\nTesting with invalid token...");
  const invalidToken = "invalid.token.here";

  const invalidResponse = await fetch("http://localhost:3000/api/user/profile", {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${invalidToken}`
    },
  });

  if (!invalidResponse.ok) {
    console.log("✅ Invalid token correctly rejected");
  } else {
    console.log("❌ Security issue: Invalid token was accepted!");
    return { success: false, error: "Invalid token was accepted" };
  }

  return { success: true };
};

// Run the test
testJWT().then(result => {
  console.log("\nTest completed:", result.success ? "PASSED" : "FAILED");
  process.exit(result.success ? 0 : 1);
});
