exports.errorHandler = (err, req, res, next) => {
  if (err) {
    console.log(err);
  }
  res.status(500).json({ error: err.message || err });
};
