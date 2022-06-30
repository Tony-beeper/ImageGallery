const express = require("express");
const app = express();
const path = require("path");
const session = require("express-session");
require("dotenv").config();
const bodyParser = require("body-parser");

const Datastore = require("nedb");
const comments = new Datastore({
  filename: "db/comments.db",
  autoload: true,
  timestampData: true,
});

const users = new Datastore({
  filename: "db/users.db",
  autoload: true,
  timestampData: true,
});

const images = new Datastore({
  filename: "db/images.db",
  timestampData: true,
  autoload: true,
});

const multer = require("multer");
const upload = multer({ dest: path.join(__dirname, "uploads") });
const bcrypt = require("bcrypt");

const cookie = require("cookie");
const saltRounds = 10;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static("static"));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);

app.use(function (req, res, next) {
  req.username = req.session.username ? req.session.username : "";

  res.setHeader(
    "Set-Cookie",
    cookie.serialize("username", req.username, {
      path: "/",
      maxAge: 120 * 60 * 24 * 7, // 1 week in number of seconds
    })
  );
  console.log("HTTP request", req.username, req.method, req.url, req.body);
  next();
});

let isAuthenticated = function (req, res, next) {
  if (!req.username) return res.status(401).end("access denied");
  next();
};

// curl -H "Content-Type: application/json" -X POST -d '{"username":"alice","password":"alice"}' -c cookie.txt localhost:3000/signup/
app.post("/signup/", function (req, res, next) {
  console.log("username is:" + req.body.username);
  console.log(req.body.password);
  bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
    // Store the salted hash in the database
    if (err) res.json(err);
    const username = req.body.username;
    const password = hash;
    users.findOne({ _id: username }, function (err, user) {
      if (err) return res.status(500).end(err);
      if (user)
        return res.status(409).end("username " + username + " already exists");
      users.update(
        { _id: username },
        { _id: username, password },
        { upsert: true },
        function (err) {
          if (err) return res.status(500).end(err);
          // initialize cookie
          res.setHeader(
            "Set-Cookie",
            cookie.serialize("username", username, {
              path: "/",
              maxAge: 60 * 60 * 24 * 7,
            })
          );
          return res.json(username);
        }
      );
    });
  });
});

// curl -H "Content-Type: application/json" -X POST -d '{"username":"alice","password":"alice"}' -c cookie.txt localhost:3000/signin/
app.post("/signin/", function (req, res, next) {
  const password = req.body.password;

  req.session.username = req.body.username; // write they session key 'user' with the value 'me'

  const username = req.session.username; // read the session key 'username' into a variable
  users.findOne({ _id: username }, function (err, user) {
    if (err) return res.status(500).end(err);
    if (!user) return res.status(401).end("access denied");
    // if (user.password !== password) return res.status(401).end("access denied");
    // initialize cookie
    const hash = user.password; // Load hash from your password DB.
    bcrypt.compare(password, hash, function (err, result) {
      // result is true is the password matches the salted hash from the database
      if (err) return res.status(500).end(err);
      if (!result) return res.status(401).end("access denied");
      res.setHeader(
        "Set-Cookie",
        cookie.serialize("username", username, {
          path: "/",
          maxAge: 120 * 60 * 24 * 7,
        })
      );
      return res.json(username);
    });
  });
});

app.get("/signout/", function (req, res, next) {
  res.setHeader(
    "Set-Cookie",
    cookie.serialize("username", "", {
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 1 week in number of seconds
    })
  );
  res.redirect("/");
});

app.post("/api/comments/", isAuthenticated, function (req, res, next) {
  console.log("HTTP request", req.method, req.url, req.body);

  comments.insert(req.body, function (err, comment) {
    if (err) return res.status(500).end(err);
    return res.json(comment);
  });
});

app.post(
  "/api/images/",
  isAuthenticated,
  upload.single("picture"),
  function (req, res, next) {
    console.log("HTTP request", req.method, req.url, req.body);
    if (
      req.file.mimetype === "image/jpeg" ||
      req.file.mimetype === "image/jpg" ||
      req.file.mimetype === "image/webp" ||
      req.file.mimetype === "image/png" ||
      req.file.mimetype === "image/svg+xml"
    ) {
      let imageStas = {
        author: req.body.author,
        image: req.file,
        title: req.body.title,
      };

      images.insert(imageStas, function (err, image) {
        if (err) return res.status(500).end(err);
        return res.json(image._id);
      });
    } else {
      res.json(null);
    }
  }
);

app.get("/api/comments/:imageId", function (req, res, next) {
  console.log("HTTP request", req.method, req.url, req.body);

  comments
    .find({ imageId: req.params.imageId })
    .sort({ createdAt: -1 })
    .exec(function (err, comments) {
      if (err) return res.status(500).end(err);
      return res.json(comments);
    });
});

app.get("/api/galleries/", function (req, res, next) {
  console.log("HTTP request", req.method, req.url, req.body);
  users
    .find({})
    .sort({ createdAt: -1 })
    .exec(function (err, galleries) {
      if (err) return res.status(500).end(err);
      return res.json(galleries);
    });
});

app.get("/api/images1/:imageId/:username", function (req, res, next) {
  console.log("HTTP request", req.method, req.url, req.body);

  if (req.params.imageId === "-2") {
    images
      .find({ author: req.params.username })
      .sort({ createdAt: -1 })
      .exec(function (err, item) {
        if (err) return res.status(500).end(err);
        if (item.length === 0) {
          res.json(null);
        } else {
          item.reverse();
          res.json(item[0]);
        }
      });
  } else {
    images.findOne({ _id: req.params.imageId }, function (err, item) {
      if (err) return res.status(500).end(err);
      if (!item) {
        return res.json(null); //should be 404 here
      } else {
        res.json(item);
      }
    });
  }
});

app.get("/api/images/second/:imageId/", function (req, res, next) {
  console.log("HTTP request", req.method, req.url, req.body);
  let path = "";
  let mimetype = "";

  images.findOne({ _id: req.params.imageId }).exec(function (err, item) {
    if (err) return res.status(500).end(err);
    if (!item) {
      res.json(null);
      // return res.status((404).end("imageId " + req.params.user + "DNE in DB"));
    } else {
      path = item.image.path;
      mimetype = item.image.mimetype;
      res.setHeader("Content-Type", mimetype);
      res.sendFile(path);
    }
  });
});

app.get("/api/images1/next/:imageId/:username", function (req, res, next) {
  console.log("HTTP request", req.method, req.url, req.body);
  images
    .find({ author: req.params.username })
    .sort({ createdAt: 1 })
    .exec(function (err, images) {
      if (err) return res.status(500).end(err);
      let index = images.findIndex(function (image) {
        return image._id === req.params.imageId;
      });
      let dexPlusOne = index + 1;
      if (index === -1 || dexPlusOne >= images.length) {
        res.send(images[0]);
      } else res.send(images[index + 1]);
    });
});

app.get("/api/images1/previous/:imageId/:username", function (req, res, next) {
  console.log("HTTP request", req.method, req.url, req.body);

  images
    .find({ author: req.params.username })
    .sort({ createdAt: 1 })
    .exec(function (err, images) {
      if (err) return res.status(500).end(err);
      let index = images.findIndex(function (image) {
        return image._id === req.params.imageId;
      });
      if (index === 0) res.send(images.reverse()[0]);
      else if (index === -1) res.json(null);
      else res.send(images[index - 1]);
    });
});

app.delete(
  "/api/comments/:commentId/",
  isAuthenticated,
  function (req, res, next) {
    console.log("HTTP request", req.method, req.url, req.body);

    comments.remove(
      { _id: req.params.commentId },
      {},
      function (err, numRemoved) {
        if (err) return res.status(500).end(err);
        return res.json(numRemoved);
      }
    );
  }
);

app.delete("/api/images/:imageId/", isAuthenticated, function (req, res, next) {
  console.log("HTTP request", req.method, req.url, req.body);

  images.remove({ _id: req.params.imageId }, {}, function (err, numRemoved) {
    if (err) return res.status(500).end(err);
    return res.json(numRemoved);
  });
});

const http = require("http");
const PORT = 3000;

http.createServer(app).listen(PORT, function (err) {
  if (err) console.log(err);
  else console.log("HTTP server on http://localhost:%s", PORT);
});
