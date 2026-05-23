const express = require('express');
const searchController = require('../controllers/search.controller');

const router = express.Router();

router.get('/matches', searchController.searchMatches);
router.get('/players', searchController.searchPlayers);
router.get('/openings', searchController.searchOpenings);
router.get('/eco', searchController.searchEco);
router.get('/moves', searchController.searchMoves);
router.get('/fuzzy', searchController.searchFuzzy);
router.get('/autocomplete', searchController.searchAutocomplete);
router.get('/recent', searchController.getRecent);
router.get('/popular', searchController.getPopular);
router.get('/advanced', searchController.searchAdvanced);
router.get('/player-rating', searchController.searchByPlayerRating);
router.get('/date-range', searchController.searchByDateRange);
router.get('/opening-family', searchController.searchByOpeningFamily);
router.get('/checkmate-patterns', searchController.searchCheckmatePatterns);
router.get('/endgames', searchController.searchEndgames);

module.exports = router;
