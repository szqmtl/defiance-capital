const express = require('express');
const controller = require('../controllers/transactions');
const { isAuth } = require('../middlewares/isAuth');
const { validator } = require('../middlewares/validator');

const router = express.Router();

router.route('/').get(isAuth, controller.get).post(validator('createTransaction'), isAuth, controller.create);

router
  .route('/:id')
  .get(validator({ params: 'id' }), isAuth, controller.getById)
  .patch(validator({ params: 'id', body: 'updateTransaction' }), isAuth, controller.update)
  .delete(validator({ params: 'id' }), isAuth, controller.delete);

module.exports = router;