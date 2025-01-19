// routes/cattleRoutes.js

const express = require('express');
const router = express.Router();
const cattleController = require('../Controllers/cattleController');

// Search cattle by names
router.post('/search', cattleController.searchCattle);

// Update production for single cattle
router.post('/production/update', cattleController.updateProduction);

// Get production history for specific cattle
router.get('/production/:cattleId', cattleController.getProductionHistory);

// Batch update production for multiple cattle
router.post('/production/batch-update', cattleController.batchUpdateProduction);

module.exports = router;