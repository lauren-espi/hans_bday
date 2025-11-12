import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
  try {
    res.render('cake', { pageTitle: 'Cake' });
  } catch (e) {
    console.error(e);
    res.status(500).send('Internal server error');
  }
});

export default router;
