export default function checkToken(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (authHeader) {
      const token = authHeader.split(' ')[1]; 
      if (token === 'your_token') {
          next(); // Token is valid, proceed to the next middleware or route handler
      } else {
          res.status(401).send({
              message: "Unauthorized"
          });
      }
  } else {
      res.status(403).send({
          message: "Access Forbidden. No token provided."
      });
  }
}