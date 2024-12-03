const jsonServer = require("json-server");
const cors = require("cors");
const path = require("path");

const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, "db.json"));
const middlewares = jsonServer.defaults();

const normalizeString = (str) =>
  str
    ?.normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

server.use((req, res, next) => {
  if (req.method === "GET" && req.query.keyword) {
    const keyword = normalizeString(req.query.keyword);
    const data = router.db.get("results").value();

    const filteredData = data.filter((item) => {
      const isInTitle = normalizeString(item.title || "").includes(keyword);

      const isInAuthors =
        Array.isArray(item.authors) &&
        item.authors.some((author) => {
          return normalizeString(author.name || "").includes(keyword);
        });

      const isInGenres =
        Array.isArray(item.bookshelves) &&
        item.bookshelves.some((genre) => {
          return normalizeString(genre || "").includes(keyword);
        });

      return isInTitle || isInAuthors || isInGenres;
    });

    if (filteredData.length > 0) {
      res.jsonp(filteredData);
    } else {
      res.status(404).jsonp({ message: "No results found" });
    }
  } else {
    next();
  }
});

server.use(
  cors({
    origin: "*",
  })
);
server.use(middlewares);
server.use(router);

server.listen(8080, () => {
  console.log("JSON Server is running on http://localhost:8080");
});
