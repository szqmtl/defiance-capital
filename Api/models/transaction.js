const mongoose = require('mongoose');
const softDelete = require('../helpers/softDelete');
const dbFields = require('../helpers/dbFields');
const mongooseHistory = require('../helpers/mongooseHistory');

const { Schema } = mongoose;

const schema = Schema(
  {
    type: {
      type: String,
      enum: ['expense', 'income'],
      required: true,
      index: true
    },
    amount: {
      type: Number,
      min: 0.01,
      required: true
    },
    category: {
      type: String,
      trim: true,
      maxlength: 64,
      required: true,
      index: true
    },
    date: {
      type: Date,
      required: true,
      index: true
    },
    description: {
      type: String,
      trim: true,
      maxlength: 255,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

schema.plugin(softDelete);
schema.plugin(dbFields, {
  fields: {
    public: ['_id', 'type', 'amount', 'category', 'date', 'description', 'createdAt'],
    listing: ['_id', 'type', 'amount', 'category', 'date', 'description', 'createdAt'],
    cp: ['_id', 'type', 'amount', 'category', 'date', 'description', 'updatedAt', 'createdAt']
  }
});

schema.pre('save', function (next) {
  try {
    // Normalize the payload so create and update return the same shape.
    if (this.amount !== undefined) this.amount = Number(this.amount);
    if (this.date && !(this.date instanceof Date)) this.date = new Date(this.date);

    return next();
  } catch (error) {
    return next(error);
  }
});

schema.plugin(
  mongooseHistory({
    mongoose,
    modelName: 'transactions_h',
    userCollection: 'User',
    accountCollection: 'Company',
    userFieldName: 'user',
    accountFieldName: 'company',
    noDiffSaveOnMethods: []
  })
);

module.exports = mongoose.models.Transaction || mongoose.model('Transaction', schema);