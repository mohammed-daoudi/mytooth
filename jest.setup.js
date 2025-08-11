// This file runs before any tests
const { MongoMemoryServer } = require('mongodb-memory-server');
const NodeEnvironment = require('jest-environment-node');
const path = require('path');
const fs = require('fs');

const globalConfigPath = path.join(__dirname, 'globalConfig.json');

class MongoEnvironment extends NodeEnvironment {
  constructor(config) {
    super(config);
  }

  async setup() {
    console.log('Setting up test environment');
    
    // Start MongoDB Memory Server
    this.global.__MONGOD__ = await MongoMemoryServer.create({
      instance: {
        dbName: 'testdb',
      },
      binary: {
        version: '6.0.0',
      },
    });
    
    // Set the MongoDB URI for tests
    process.env.MONGODB_URI = this.global.__MONGOD__.getUri();
    
    // Write the URI to a global config file for use in tests
    fs.writeFileSync(
      globalConfigPath,
      JSON.stringify({
        mongoUri: process.env.MONGODB_URI,
      })
    );
    
    // Ensure the environment variable is set
    process.env.NODE_ENV = 'test';
    process.env.JWT_SECRET = 'test-secret';
    
    await super.setup();
  }

  async teardown() {
    console.log('Tearing down test environment');
    
    // Clean up MongoDB Memory Server
    await this.global.__MONGOD__.stop();
    
    // Clean up the global config file
    if (fs.existsSync(globalConfigPath)) {
      fs.unlinkSync(globalConfigPath);
    }
    
    await super.teardown();
  }
}

module.exports = MongoEnvironment;
