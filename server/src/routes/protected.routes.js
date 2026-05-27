const express = require('express');
const matchController = require('../controllers/match.controller');
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(protect);

router.get('/matches', matchController.getAll);
router.post('/matches', matchController.create);
router.patch('/matches/:id', matchController.update);
router.delete('/matches/:id', matchController.delete);

module.exports = router;
