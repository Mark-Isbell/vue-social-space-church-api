const path = require("path");
const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const colors = require("colors");
const fileupload = require("express-fileupload");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const xss = require("xss-clean");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");
const cors = require("cors");
const errorHandler = require("./middleware/error");

// Load env vars
switch(process.env.NODE_ENV) {
  case "dev":
        console.log(`Environment: dev`.red);
        {dotenv.config({ path: "./config/dev.env" }); }
        break;
  case "test":
        console.log(`Environment: test`.red);
        {dotenv.config({ path: "./config/test.env" }); }
        break;
  default:
        console.log(`Environment: prod`.red);
        {dotenv.config({ path: "./config/prod.env" }); }
        break;
}

/*
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  )
*/


// Route files
const church = require("./routes/church"); 
const auth = require("./routes/auth"); 
const member = require("./routes/member"); 
const moderator = require("./routes/moderator"); 
const stream = require("./routes/stream"); 
const sequelizesync = require("./routes/sequelizesync");
const directmessage = require("./routes/directmessage");

const app = express();

// Body parser
app.use(express.json({limit: '50mb'}));

// Cookie parser
app.use(cookieParser());

// Dev logging middleware
if (process.env.NODE_ENV === "dev") {
  app.use(morgan("dev"));
}

// File uploading
app.use(fileupload());

// Set security headers
app.use(helmet());

// Prevent XSS attacks
app.use(xss());

// Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 mins
  max: 500,
});

app.use(limiter);

// Prevent http param pollution
app.use(hpp());

var whitelist = process.env.CORS_ORIGIN_WHITELIST_DOMAIN.split(",");
// console.log(whitelist); 

var corsOptions = {
  origin: whitelist,
  credentials: true,
}
app.use(cors(corsOptions));

// Set static folder
app.use(express.static(path.join(__dirname, "public")));

// Mount routers
app.use("/api/v1/church", church);
app.use("/api/v1/auth", auth);
app.use("/api/v1/member", member);
app.use("/api/v1/moderator", moderator);
app.use("/api/v1/stream", stream);
app.use("/api/v1/sequelizesync", sequelizesync);
app.use("/api/v1/directmessage", directmessage);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  )
);

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`.red);
  //Close server and exit process
  server.close(() => process.exit(1));
});
