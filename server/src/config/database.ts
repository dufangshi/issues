export const databaseConfig = {
  development: {
    mongodb: {
      uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/issues',
      options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    }
  },
  production: {
    mongodb: {
      uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/issues',
      options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    }
  }
}; 