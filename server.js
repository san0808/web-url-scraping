const express = require('express');
const { performSearch } = require('./search');

const app = express();
app.use(express.json());

// Define the API endpoint to receive search requests
app.post('/search', async (req, res) => {
  const { prompt } = req.body;

  try {
    const searchResults = await performSearch(prompt);
    res.json({ results: searchResults });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while processing your request.' });
  }
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
