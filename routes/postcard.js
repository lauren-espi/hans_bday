//import { create } from "express-handlebars";
import cakeRoutes from "./cake.js";
import songRoutes from "./song.js"
import connectionsRoutes from "./connections.js"

const constructorMethod = (app) => {
  app.get('/', function (req, res) {
    res.render('postcard', { pageTitle: 'Postcard'});
  });

//   app.use('/postcard', postcardRoutes);
  app.use('/cake', cakeRoutes);
  app.use('/song', songRoutes);
  app.use('/connections', connectionsRoutes);

  app.use('*', (req, res) => {
    res.status(404).json({ error: 'Not found!' });
  });
};
export default constructorMethod;