module.exports = {
  createTransaction: {
    $id: 'createTransaction',
    type: 'object',
    properties: {
      type: { type: 'string', enum: ['expense', 'income'] },
      amount: { type: 'number', minimum: 0.01 },
      category: { type: 'string' },
      date: { type: 'string', format: 'date-time' },
      description: { type: 'string' }
    },
    required: ['type', 'amount', 'category', 'date'],
    additionalProperties: false
  },
  updateTransaction: {
    $id: 'updateTransaction',
    type: 'object',
    properties: {
      type: { type: 'string', enum: ['expense', 'income'] },
      amount: { type: 'number', minimum: 0.01 },
      category: { type: 'string' },
      date: { type: 'string', format: 'date-time' },
      description: { type: 'string' }
    },
    additionalProperties: false
  },
  transactionId: {
    $id: 'transactionId',
    type: 'object',
    properties: {
      id: { $ref: 'objectId' }
    }
  }
};