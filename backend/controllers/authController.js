const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const nodemailer = require('nodemailer');
const axios = require('axios');

exports.register = async (req, res) => {
  try {
    const { username, email, password, rol, captcha } = req.body;

    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    const verificationURL = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${captcha}`;

    const captchaResponse = await axios.post(verificationURL);
    const captchaScore = captchaResponse.data.score;

    if (!captchaResponse.data.success || captchaScore < 0.5) {
      return res.status(400).json({ error: 'Falló la verificación de reCAPTCHA. Por favor intente de nuevo.' });
    }

    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return res.status(400).json({ error: 'El correo electrónico ya está en uso' });
    }

    const usernameExists = await User.findOne({ where: { username } });
    if (usernameExists) {
      return res.status(400).json({ error: 'El nombre de usuario ya está en uso' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ username, email, password: hashedPassword, rol });

    // Genera un token para la verificación de correo electrónico
    const emailVerificationToken = jwt.sign({ id: newUser.id }, process.env.SECRET_KEY, { expiresIn: '1h' });
    const verificationLink = `${process.env.REACT_APP_FRONTEND_URL}/verify-email?token=${emailVerificationToken}`;

    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
      }
    });

    try {
      await transporter.sendMail({
        from: process.env.EMAIL,
        to: newUser.email,
        subject: 'Confirmar correo electrónico',
        text: `Por favor confirme su correo electrónico haciendo clic en el siguiente enlace: ${verificationLink}`
      });

      res.status(201).json({ success: true, message: 'Usuario registrado con éxito', redirect: '/confirm-email' });
    } catch (error) {
      // Elimina al usuario si el envío del correo electrónico falla
      await User.destroy({ where: { id: newUser.id } });
      throw error;
    }

  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

exports.resendVerifyEmail = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(400).json({ error: 'Usuario no encontrado' });
    }

    if (user.emailVerified) {
      return res.status(400).json({ error: 'Correo electrónico ya verificado' });
    }

    // Genera un token para la verificación de correo electrónico
    const emailVerificationToken = jwt.sign({ id: user.id }, process.env.SECRET_KEY, { expiresIn: '1h' });
    const verificationLink = `${process.env.REACT_APP_FRONTEND_URL}/verify-email?token=${emailVerificationToken}`;

    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
      }
    });

    try {
      await transporter.sendMail({
        from: process.env.EMAIL,
        to: user.email,
        subject: 'Confirmar correo electrónico',
        text: `Por favor confirme su correo electrónico haciendo clic en el siguiente enlace: ${verificationLink}`
      });

      res.status(200).json({ success: true, message: 'Link de confirmación reenviado con éxito.' });
    } catch (error) {
      if (error.code === 'ESOCKET') {
        res.status(500).json({ error: 'Error de conexión. Por favor verifica tu conexión a Internet y vuelve a intentarlo.' });
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

exports.verifyEmail = async (req, res) => {
  const { token } = req.query;

  try {
    const decodedToken = jwt.verify(token, process.env.SECRET_KEY);
    const user = await User.findOne({ where: { id: decodedToken.id } });

    if (!user) {
      return res.status(400).json({ error: 'Usuario no encontrado' });
    }

    if (user.emailVerified) {
      return res.status(400).json({ error: 'Correo electrónico ya verificado' });
    }

    user.emailVerified = true;
    await user.save();

    res.status(200).json({ message: 'Correo electrónico verificado con éxito' });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado' });
    }
    console.log(error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

exports.login = async (req, res) => {
  try {
    const { usernameOrEmail, password, captcha } = req.body;

    // Verificar reCAPTCHA
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    const verificationURL = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${captcha}`;

    const captchaResponse = await axios.post(verificationURL);
    const captchaScore = captchaResponse.data.score;

    if (!captchaResponse.data.success || captchaScore < 0.5) {
      return res.status(400).json({ error: 'Falló la verificación de reCAPTCHA. Por favor intente de nuevo.' });
    }
    
    let user;

    if (usernameOrEmail.includes('@')) {
      user = await User.findOne({ where: { email: usernameOrEmail } });
    } else {
      user = await User.findOne({ where: { username: usernameOrEmail } });
    }

    if (!user) {
      return res.status(401).json({ error: 'No se encontró ningún usuario con esas credenciales' });
    }

    if (!user.emailVerified) {
      return res.status(403).json({ error: 'Por favor, verifica tu correo electrónico antes de iniciar sesión.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'La contraseña es incorrecta' });
    }

    const token = jwt.sign({ id: user.id, rol: user.rol }, process.env.SECRET_KEY, { expiresIn: '1h' });

    res.status(200).json({
      message: 'Inicio de sesión exitoso',
      token,
      rol: user.rol,
      username: user.username
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

exports.resetPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(400).json({ error: 'Usuario no encontrado' });
    }

    const token = jwt.sign({ id: user.id }, process.env.SECRET_KEY, { expiresIn: '1h' });
    user.resetPasswordToken = token;
    await user.save();

    const resetLink = `${process.env.REACT_APP_FRONTEND_URL}/reset-password?token=${token}`;

    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
      }
    });

    try {
      await transporter.sendMail({
        from: process.env.EMAIL,
        to: user.email,
        subject: 'Restablecimiento de contraseña',
        text: `Para restablecer tu contraseña, por favor haz clic en el siguiente enlace: ${resetLink}`
      });
    } catch (error) {
      throw error;
    }

    res.status(200).json({ message: 'Se ha enviado un correo electrónico con instrucciones para restablecer la contraseña.' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

exports.changePassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const decodedToken = jwt.verify(token, process.env.SECRET_KEY);
    const user = await User.findOne({ where: { id: decodedToken.id } });

    if (!user) {
      return res.status(400).json({ error: 'Usuario no encontrado' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: 'Contraseña cambiada con éxito' });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado' });
    }
    console.log(error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
