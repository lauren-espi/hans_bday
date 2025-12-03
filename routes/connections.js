import express from 'express';
import all_categories from '../data/categories.js';

const router = express.Router();

// Global consistent color mapping
const GLOBAL_CATEGORY_COLORS = {
  "Where We Went On a Date": 'yellow',
  "Movie Related Works": 'blue',
  "Pickleball Lingo": 'green',
  "Beer Ingredients In a Compound Word": 'purple'
};

// Fisher-Yates shuffle, return first n
function pickRandom(arr, n) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, n);
}

/* ------------------------- GET: LOAD GAME ------------------------- */
router.get('/', (req, res) => {
  try {
    // Always start a fresh game
    const categories = Object.keys(all_categories);
    const selectedCategories = pickRandom(categories, 4);

    let words = [];
    selectedCategories.forEach((cat) => {
      const picks = pickRandom(all_categories[cat], 4);
      words = words.concat(picks);
    });

    // Shuffle final 16 words
    words = pickRandom(words, words.length);

    // Initialize session state
    req.session.used_colors = [];
    req.session.category_colors = {};
    req.session.mistakes = 4;
    req.session.already_guessed = [];
    req.session.grid = [];

    for (let i = 0; i < 4; i++) {
      req.session.grid.push(words.slice(i * 4, i * 4 + 4));
    }

    const mistakesArray = new Array(req.session.mistakes).fill(0);
    const emptyArray = new Array(4 - req.session.mistakes).fill(0);

    res.render('connections', {
      pageTitle: 'Connections',
      grid: req.session.grid,
      mistakes: req.session.mistakes,
      mistakesArray,
      emptyArray,
      alreadyGuessedKeysJSON: JSON.stringify([]),
    });

  } catch (e) {
    console.error(e);
    res.status(500).send('Internal server error');
  }
});

/* ---------------------- POST: SUBMIT GUESS ---------------------- */
router.post('/submit_guess', (req, res) => {
  try {
    const selectedWords = req.body.selectedWords || [];

    if (!Array.isArray(selectedWords) || selectedWords.length === 0) {
      return res.json({ result: 'error', message: 'No words selected' });
    }

    const alreadyGuessed = req.session.already_guessed || [];

    const selectedSetKey = JSON.stringify([...selectedWords].sort());

    if (alreadyGuessed.some(g => JSON.stringify([...g].sort()) === selectedSetKey)) {
      return res.json({
        result: 'error',
        message: 'Words have already been guessed!',
        alreadyGuessed: true,
        disableSubmit: true
      });
    }

    // Determine category from first word
    let firstCategory = null;
    for (const [category, words] of Object.entries(all_categories)) {
      if (words.includes(selectedWords[0])) {
        firstCategory = category;
        break;
      }
    }

    if (!firstCategory) {
      return res.json({ result: 'error', message: 'First word not in any category' });
    }

    // Validate all 4 words match category
    const allCorrect = selectedWords.every(w =>
      all_categories[firstCategory].includes(w)
    );

    if (!allCorrect) {
      req.session.mistakes = (req.session.mistakes || 4) - 1;
      alreadyGuessed.push(selectedWords);
      req.session.already_guessed = alreadyGuessed;

      return res.json({
        result: 'failure',
        message: 'Try again!',
        mistakes: req.session.mistakes,
        alreadyGuessed: false
      });
    }

    // SUCCESS — Assign category color
    if (!req.session.category_colors) req.session.category_colors = {};
    if (!req.session.used_colors) req.session.used_colors = [];

    let color;

    if (firstCategory in req.session.category_colors) {
      color = req.session.category_colors[firstCategory];
    } else {
      const globalColor = GLOBAL_CATEGORY_COLORS[firstCategory];

      if (globalColor && !req.session.used_colors.includes(globalColor)) {
        color = globalColor;
      } else {
        const possible = ['blue', 'green', 'yellow', 'purple']
          .filter(c => !req.session.used_colors.includes(c));

        if (possible.length === 0) {
          return res.json({ result: 'error', message: 'No more colors available' });
        }

        color = possible[0];
      }

      req.session.used_colors.push(color);
      req.session.category_colors[firstCategory] = color;
    }

    // Save successful guess
    alreadyGuessed.push(selectedWords);
    req.session.already_guessed = alreadyGuessed;

    return res.json({
      result: 'success',
      message: `Yay! Category: ${firstCategory}`,
      color,
      category: firstCategory,
      words: all_categories[firstCategory],
      alreadyGuessed: false
    });

  } catch (e) {
    console.error(e);
    res.status(500).json({ result: 'error', message: 'Server error' });
  }
});

/* ---------------------- POST: NEW GAME ---------------------- */
router.post('/new', (req, res) => {
  try {
    req.session.grid = [];
    req.session.used_colors = [];
    req.session.category_colors = {};
    req.session.mistakes = 4;
    req.session.already_guessed = [];

    return res.json({ result: 'ok' });

  } catch (e) {
    console.error('Error resetting game session', e);
    return res.status(500).json({
      result: 'error',
      message: 'Could not reset game'
    });
  }
});

export default router;
