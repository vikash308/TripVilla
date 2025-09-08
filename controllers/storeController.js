const Home = require("../models/home");
const User = require("../models/user");


exports.getIndex = (req, res, next) => {
  console.log("Session Value: ", req.session);
  Home.find().then((registeredHomes) => {
    res.render("store/index", {
      registeredHomes: registeredHomes,
      pageTitle: "airbnb Home",
      currentPage: "index",
      isLoggedIn: req.isLoggedIn,
      user: req.session.user,
    });
  });
};

exports.getHomes = (req, res, next) => {
  Home.find().then((registeredHomes) => {
    res.render("store/home-list", {
      registeredHomes: registeredHomes,
      pageTitle: "Homes List",
      currentPage: "Home",
      isLoggedIn: req.isLoggedIn,
      user: req.session.user,
    });
  });
};

exports.getBookings = (req, res, next) => {
  res.render("store/bookings", {
    pageTitle: "My Bookings",
    currentPage: "bookings",
    isLoggedIn: req.isLoggedIn,
    user: req.session.user,
  });
};

exports.getFavouriteList = async (req, res, next) => {
  const userId = req.session.user._id;
  const user = await User.findById(userId).populate('favourites');
  res.render("store/favourite-list", {
    favouriteHomes: user.favourites,
    pageTitle: "My Favourites",
    currentPage: "favourites",
    isLoggedIn: req.isLoggedIn,
    user: req.session.user,
  });
};

exports.postAddToFavourite = async (req, res, next) => {
  const homeId = req.body.id;
  const userId = req.session.user._id;
  const user = await User.findById(userId);
  if (!user.favourites.includes(homeId)) {
    user.favourites.push(homeId);
    await user.save();
  }
  res.redirect("/favourites");
};

exports.postRemoveFromFavourite = async (req, res, next) => {
  const homeId = req.params.homeId;
  const userId = req.session.user._id;
  const user = await User.findById(userId);
  if (user.favourites.includes(homeId)) {
    user.favourites = user.favourites.filter(fav => fav != homeId);
    await user.save();
  }
  res.redirect("/favourites");
};

exports.getHomeDetails = (req, res, next) => {
  const homeId = req.params.homeId;
  Home.findById(homeId).then((home) => {
    if (!home) {
      console.log("Home not found");
      res.redirect("/homes");
    } else {
      res.render("store/home-detail", {
        home: home,
        pageTitle: "Home Detail",
        currentPage: "Home",
        isLoggedIn: req.isLoggedIn,
        user: req.session.user,
      });
    }
  });
};


exports.describeHome = async (req, res, next) => {
  try {
    const id = req.params.id;
    const home = await Home.findById(id);

    if (!home) {
      return res.status(404).send("Home not found");
    }
    // ✅ Fetch owner details using owner ID
    const owner = await User.findById(home.owner);
    const name = owner ? `${owner.firstName} ${owner.lastName}` : "Unknown Host";

    res.render("store/describeHome", {
      home,
      pageTitle: "Describe Home",
      currentPage: "home",
      isLoggedIn: req.isLoggedIn,
      user: req.session.user,
      name
    });
  } catch (error) {
    next(error);
  }
};



exports.review = async (req,res,next)=>{
  let {id} = req.params;
  let {name, rating, comment}= req.body;

  let isLogin = req.session.user;
  if(!isLogin) return res.redirect("/login")

  let userName = await req.session.user.firstName;
  let Name = userName +" "+req.session.user.lastName;

  let user = req.session.user._id

  const home = await Home.findById(id);
  home.review.push({user, name:Name, rating,  comment})  
  await home.save();
  res.redirect(`/describe/${id}`)
}


exports.confirm = async (req, res) => {
  let homeId = req.params.id;
    const {  dates} = req.body;

    if(!req.session.user) return res.redirect("/login")

    const home = await Home.findById(homeId);
    if (!home) {
        return res.status(404).send("Home not found");
    }

    // Calculate example price details
    const nights = 2; // You can calculate based on dates
    const discount = 871;
    const taxes = 313.56;
    const total = (home.price * nights - discount + taxes).toFixed(2);

    res.render("store/confirm", {
        home,
        dates,
        nights,
        discount,
        taxes,
        total,
        pageTitle: "Confirm and Pay",
      currentPage: "home",
      isLoggedIn: req.isLoggedIn,
      user: req.session.user,
    });
};

