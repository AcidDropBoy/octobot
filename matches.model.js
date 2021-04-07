const mongoose = require('mongoose')
const Schema = mongoose.Schema

const MatchesSchema = new Schema ({
   match: {
      type: String
   },
   home: {
      type: String
   },
   guest: {
      type: String
   },
   date: {
      type: String
   },
   type: {
      type: String
   }
})

mongoose.model('matches', MatchesSchema)