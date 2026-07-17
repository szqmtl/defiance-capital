const Transaction = require('../models/transaction');
const { SendData, ServerError, NotFound } = require('../helpers/response');
const getter = require('../helpers/getter');

const transactionQuery = ({ filter, type }) => {
  const query = {};

  if (type) {
    query.type = type;
  }

  if (filter) {
    query.$or = [{ category: new RegExp(filter, 'i') }, { description: new RegExp(filter, 'i') }];
  }

  return query;
};

module.exports.get = async (req, res, next) => {
  try {
    const query = transactionQuery(req.query);
    const data = await getter(Transaction, query, req, res, [...Transaction.getFields('listing')]);

    return next(SendData(data));
  } catch (err) {
    return next(ServerError(err));
  }
};

module.exports.create = async ({ body }, _res, next) => {
  try {
    const data = new Transaction(body);

    data.__history = {
      event: 'create',
      method: 'create'
    };

    await data.save();

    return next(SendData(data.response('cp')));
  } catch (err) {
    return next(ServerError(err));
  }
};

module.exports.getById = async ({ params: { id } }, _res, next) => {
  try {
    const targetTransaction = await Transaction.findById(id);
    if (!targetTransaction) return next(NotFound());

    return next(SendData(targetTransaction.response('cp')));
  } catch (err) {
    return next(ServerError(err));
  }
};

module.exports.update = async ({ params: { id }, body }, _res, next) => {
  try {
    const targetTransaction = await Transaction.findById(id);
    if (!targetTransaction) return next(NotFound());

    Object.assign(targetTransaction, body);

    targetTransaction.__history = {
      event: 'update',
      method: 'patch'
    };

    await targetTransaction.save();

    return next(SendData(targetTransaction.response('cp')));
  } catch (err) {
    return next(ServerError(err));
  }
};

module.exports.delete = async ({ params: { id } }, _res, next) => {
  try {
    const targetTransaction = await Transaction.findById(id);
    if (!targetTransaction) return next(NotFound());

    targetTransaction.__history = {
      event: 'delete',
      method: 'delete'
    };

    await targetTransaction.softDelete();

    return next(SendData({ message: 'Transaction deleted successfully' }));
  } catch (err) {
    return next(ServerError(err));
  }
};