const mongoose = require('mongoose')
const url = process.env.MONGODB_URI

mongoose.set('strictQuery',false)
mongoose.connect(url)
  .then(() => {
    console.log('connected to MONGODB')
  })
  .catch(error => {
    console.log('error connecting to MongoDB:', error.message)
  })

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 3,
    required: true,
  },
  number: {
    type: String,
    validate: {
      validator: function (value) {
        const phoneRegex = /^(0[2-9]|1[0-9])-([0-9]{7,})$/;
        return phoneRegex.test(value);
      },
      message: props => `${props.value} is not a valid phone number! Format should be XX-XXXXXXXX.`,
    },
    required: true,
  },
});

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
      returnedObject.id = returnedObject._id.toString()
      delete returnedObject._id
      delete returnedObject.__v
  }
})

module.exports = mongoose.model('Person', personSchema)