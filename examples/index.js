/* @flow */

const express = require("express");
const path    = require("path");

const port = process.env.PORT || 8080;
const app  = express();

// Static examples
app.use(express.static(path.join(__dirname)));

app.listen(port, () => console.log(`Examples are now available on port ${port}.`));