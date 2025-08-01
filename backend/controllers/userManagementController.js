const User = require('../models/User');
const Phone = require('../models/Phone');
const Call = require('../models/Call');
const Payment = require('../models/Payment');
const Week = require('../models/Week');
const { updateFileNameInGoogleDrive } = require('../utils/googleDriveUploader');
const { deleteCall } = require('./adminController');

// Función para buscar usuarios
exports.getUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      where: {
        emailVerified: true
      },
      attributes: ['id', 'username', 'email', 'rol']
    });

    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

// Función para actualizar usuarios
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, rol } = req.body;
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const userWithSameEmail = await User.findOne({ where: { email: email.toLowerCase() } });
    if (userWithSameEmail && userWithSameEmail.id != id) {
      return res.status(400).json({ error: 'El correo electrónico ya está en uso' });
    }

    const userWithSameUsername = await User.findOne({ where: { username: username.toLowerCase() } });
    if (userWithSameUsername && userWithSameUsername.id != id) {
      return res.status(400).json({ error: 'El nombre de usuario ya está en uso' });
    }

    // Check if the username has changed
    if (user.username !== username) {
      // Fetch all payments for this user
      const payments = await Payment.findAll({ where: { UserId: id } });

      // For each payment, update the file name in Google Drive
      for (const payment of payments) {
        // Fetch the week
        const week = await Week.findByPk(payment.semana_id);

        // Construct the new file name
        const formattedFileName = `${week.anio}${week.mes}[${week.semana}] ${username}`;

        // Check if captura_id exists before trying to update file name in Google Drive
        if (payment.captura_id !== '') {
          try {
            // Update the file name in Google Drive
            await updateFileNameInGoogleDrive(payment.captura_id, formattedFileName);
          } catch (error) {
            await payment.update({ captura_id: '', captura_url: '' });
          }
        }
      }
    }

    await user.update({ username, email, rol });
    res.status(200).json({ message: 'Usuario actualizado con éxito', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

// Función para eliminar usuarios
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Encuentra todos los teléfonos del usuario
    const phones = await Phone.findAll({ where: { UserId: id } });

    // Luego, elimina todas las llamadas asociadas con cada teléfono del usuario
    for (let phone of phones) {
      const calls = await Call.findAll({ where: { telefono_id: phone.id } });

      for (let call of calls) {
        // Aquí reutilizamos la lógica de deleteCall
        const callReq = { params: { id: call.id } };
        const callRes = {
          status: (status) => ({
            json: (json) => json
          })
        };

        // Espera la eliminación de cada llamada antes de continuar con la siguiente
        await deleteCall(callReq, callRes);
      }
    }

    // Luego, elimina todos los teléfonos asociados con el usuario
    await Phone.destroy({ where: { UserId: id } });

    // Finalmente, elimina al usuario
    await user.destroy();
    res.status(200).json({ message: 'Usuario eliminado con éxito' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};
