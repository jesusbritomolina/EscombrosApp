const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: 'No se proporcionó un token de acceso' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: 'La sesión ha expirado, por favor inicie sesión de nuevo' });
    } else {
      console.error('Error al verificar el token de acceso:', error);
      return res.status(401).json({ message: 'Token de acceso inválido' });
    }
  }
};
