# Hans Birthday Website

## Run locally

From the project root:

```bash
npm install
npm start
```

Then open:

```text
http://localhost:3000
```


## Project structure

- `app.js` – app entry point
- `routes/` – route handlers
- `views/` – Handlebars templates
- `public/` – static assets (CSS, JS, images)
- `data/` – category/data files

## Notes

The app uses Express and Express Handlebars, and the `start` script is configured in `package.json` to run:

```bash
node app.js
```
