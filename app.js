const path = require('path');
require('dotenv').config();

// External Modules
const express = require('express');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const { default: mongoose } = require('mongoose');
const multer = require('multer');
const { cloudinary, storage } = require('./cloudConfig'); // ✅ New for Cloudinary
const DB_PATH = process.env.DB_PATH;

// Local Modules
const storeRouter = require("./routes/storeRouter");
const hostRouter = require("./routes/hostRouter");
const authRouter = require("./routes/authRouter");
const rootDir = require("./utils/pathUtil");
const errorsController = require("./controllers/errors");

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

// MongoDB Session Store
const store = new MongoDBStore({
  uri: DB_PATH,
  collection: 'sessions'
});

// ✅ Remove local randomString and diskStorage logic
// ✅ Use Cloudinary storage instead
const upload = multer({ storage }); // Using Cloudinary Storage

app.use(express.urlencoded());
app.use(upload.single('photo')); // ✅ Handles image upload to Cloudinary

app.use(express.static(path.join(rootDir, 'public')));

// ✅ Remove local "/uploads" serving because we are using Cloudinary now

app.use(session({
  secret: "KnowledgeGate AI with Complete Coding",
  resave: false,
  saveUninitialized: true,
  store
}));

app.use((req, res, next) => {
  req.isLoggedIn = req.session.isLoggedIn;
  next();
});

app.use(authRouter);
app.use(storeRouter);

app.use("/host", (req, res, next) => {
  if (req.isLoggedIn) {
    next();
  } else {
    res.redirect("/login");
  }
});
app.use("/host", hostRouter);

app.use(errorsController.pageNotFound);

const PORT = process.env.PORT || 3000;

mongoose.connect(DB_PATH).then(() => {
  console.log('Connected to Mongo');
  app.listen(PORT, () => {
    console.log(`Server running on address http://localhost:${PORT}`);
  });
}).catch(err => {
  console.log('Error while connecting to Mongo: ', err);
});
