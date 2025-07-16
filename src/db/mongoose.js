const mongoose = require('mongoose')

mongoose.connect(process.env.MONGODB_URL) // THIS CONNECTS TO OUR DEV OR PROD DB. REQUIRE IN APP.JS