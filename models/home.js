const mongoose = require("mongoose");

const homeSchema = mongoose.Schema({
  houseName: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    required: true,
  },
  photo: String,
  description: String,
  owner: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  review:[
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      name:String,
      rating:Number,
      comment:String
    },{Timestamp:true}
  ]
});

module.exports = mongoose.model("Home", homeSchema);