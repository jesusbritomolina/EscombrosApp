const User = require('../models/User');
const Phone = require('../models/Phone');
const Call = require('../models/Call');
const Payment = require('../models/Payment');
const Week = require('../models/Week');
const fs = require('fs');
const { uploadFileToGoogleDrive, deleteFileFromGoogleDrive } = require('../utils/googleDriveUploader');
const { Sequelize, Op } = require('sequelize');
const { backupDataToGoogleSheets } = require('../utils/googleSheetsUploader');

// Obtener ID de Fecha
exports.getWeekID = async (req, res) => {
  try {
    const { year, month, week } = req.query;

    // Encuentra el ID de la semana correspondiente
    const weekRecord = await Week.findOne({
      where: {
        anio: year,
        mes: month,
        semana: week
      }
    });

    if (!weekRecord) {
      return res.status(404).json({ message: 'Semana no encontrada' });
    }

    const weekId = weekRecord.id;
    res.json({ weekId });
  } catch (error) {
    console.error('Error al obtener el ID de la semana:', error);
    res.status(500).json({ message: 'Error al obtener el ID de la semana' });
  }
};

// Obtener Fechas
exports.getWeeks = async (req, res) => {
  try {
    const weeks = await Week.findAll({
      attributes: ['anio', 'mes', 'semana'],
      group: ['Week.id', 'anio', 'mes', 'semana'], // Agrupar por los campos de la semana
      order: [['anio', 'ASC'], ['mes', 'ASC'], ['semana', 'ASC']],
    });

    res.json({ weeks });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

// Tablas BD y usuario logeado
exports.getAdminData = async (req, res) => {
  try {
    const { year, month, week } = req.query;

    // Asegurarse de que year, month y week estén definidos
    if (year === undefined || month === undefined || week === undefined) {
      return res.status(400).json({ message: 'Los parámetros year, month y week son obligatorios' });
    }

    const worker = await User.findOne({ where: { id: req.user.id } });
    if (!worker) {
      return res.status(404).json({ message: 'Trabajador no encontrado' });
    }

    const users = await User.findAll({
      where: {
        emailVerified: true
      }
    });

    const phones = await Phone.findAll();

    // Encuentra el ID de la semana correspondiente
    const weekRecord = await Week.findOne({
      where: {
        anio: year,
        mes: month,
        semana: week
      }
    });

    if (!weekRecord) {
      return res.status(404).json({ message: 'Semana no encontrada' });
    }

    const weekId = weekRecord.id;

    const calls = await Call.findAll({
      where: { 
        telefono_id: phones.map((phone) => phone.id),
        semana_id: weekId  // Utiliza el ID de la semana para buscar las llamadas
      },
      include: [
        { model: Phone, required: true },
        { model: Week, required: true },
      ],
      order: [[Phone, 'UserId', 'ASC']]
    });

    const payments = await Payment.findAll({
      where: {
        semana_id: weekId  // Utiliza el ID de la semana para buscar los pagos
      },
      include: [
        { model: Week, required: true },
      ],
      order: [['UserId', 'ASC']]
    });

    res.json({ worker, users, phones, calls, payments });
  } catch (error) {
    if (error.code === 'ERR_SOCKET_CONNECTION_TIMEOUT') {
      return res.status(500).json({ message: 'Internet inestable, intente nuevamente o recargue la pagina' });
    } else {
      console.error(error);
    }
  }
};

// Añadir Llamada
exports.addCall = async (req, res) => {
  try {
    const { telefono_id, semana_id } = req.body;

    if (!telefono_id || !semana_id) {
      return res.status(400).json({ message: 'Los campos "telefono_id" y "semana_id" son obligatorios' });
    }

    const existingCall = await Call.findOne({ where: { telefono_id, semana_id } });
    if (existingCall) {
      return res.status(400).json({ message: 'Ya hay una llamada para este teléfono en la semana seleccionada.' });
    }

    const callData = req.body;
    const newCall = await Call.create(callData);

    if (!newCall) {
      return res.status(500).json({ message: 'Error al añadir la llamada' });
    }

    res.status(201).json({ message: 'Llamada añadida con éxito', newCall });
  } catch (error) {
    if (error.code === 'ERR_SOCKET_CONNECTION_TIMEOUT') {
      return res.status(500).json({ message: 'Internet inestable, intente nuevamente o recargue la pagina' });
    } else {
      console.error(error);
      return res.status(500).json({ message: 'Error del servidor' });
    }
  }
};

// Editar llamada
exports.updateCall = async (req, res) => {
  try {
    const { id } = req.params;
    const callData = req.body;
    const call = await Call.findByPk(id);

    if (!call) {
      return res.status(404).json({ message: 'Llamada no encontrada' });
    }

    if (callData.totalAmount === null || callData.totalAmount === undefined || callData.totalAmount === '') {
      res.status(400).json({ message: 'El monto total no puede ser nulo, indefinido ni vacío' });
      return;
    }
    
    await call.update(callData);
    res.status(200).json({ message: 'Llamada actualizada con éxito', call });
  } catch (error) {
    if (error.code === 'ERR_SOCKET_CONNECTION_TIMEOUT') {
      return res.status(500).json({ message: 'Internet inestable, intente nuevamente o recargue la pagina' });
    } else {
      console.error(error);
    }
  }
};

// Eliminar Llamada
exports.deleteCall = async (req, res) => {
  try {
    const { id } = req.params;
    const call = await Call.findByPk(id, {
      include: [Phone]
    });

    if (!call) {
      return res.status(404).json({ message: 'Llamada no encontrada' });
    }

    // Guardamos los datos necesarios para las verificaciones posteriores
    const userId = call.Phone.UserId;
    const weekId = call.semana_id;

    await call.destroy();

    // Comprobar si quedan llamadas para el mismo usuario en la misma semana
    const remainingCalls = await Call.count({
      where: {
        telefono_id: { [Op.in]: Sequelize.literal(`(SELECT id FROM phones WHERE UserId = ${userId})`) },
        semana_id: weekId
      }
    });

    const payment = await Payment.findOne({
      where: {
        UserId: userId,
        semana_id: weekId
      }
    });

    // Si no quedan llamadas, eliminar el pago y la captura correspondiente
    if (remainingCalls === 0) {
      if (payment) {
        // Eliminar la captura de Google Drive
        const fileId = payment.captura_id;
        if (fileId) {
          try {
            await deleteFileFromGoogleDrive(fileId);
          } catch (error) {
            return res.status(500).json({ message: 'Error al eliminar la captura de Google Drive: ' + error.message });
          }
        }

        // Eliminar el pago
        try {
          await payment.destroy();
        } catch (error) {
          return res.status(500).json({ message: 'Error al eliminar el pago: ' + error.message });
        }
      }
    }

    res.status(200).json({ message: 'Llamada eliminada con éxito' });
  } catch (error) {
    if (error.code === 'ERR_SOCKET_CONNECTION_TIMEOUT') {
      return res.status(500).json({ message: 'Internet inestable, intente nuevamente o recargue la pagina' });
    } else {
      console.error(error);
    }
  }
};

// Editar pago
exports.updatePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const paymentData = req.body;
    const payment = await Payment.findByPk(id);
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
    const user = await User.findByPk(payment.UserId);

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const username = user ? user.username : 'Desconocido';
    
    const week = await Week.findByPk(payment.semana_id);
    const formattedFileName = `${week.anio}${week.mes}[${week.semana}] ${username}`;

    if (!payment) {
      return res.status(404).json({ message: 'Pago no encontrado' });
    }

    if (req.file) {
      // Eliminar la imagen existente de Google Drive
      const fileId = payment.captura_id;
      if (fileId) {
        try {
          const { id: deletedId, webViewLink: deletedWebViewLink } = await deleteFileFromGoogleDrive(fileId);
          paymentData.captura_id = deletedId;
          paymentData.captura_url = deletedWebViewLink;
        } catch (error) {
          return res.status(500).json({ message: 'Internet inestable, intente nuevamente o recargue la pagina' });
        }
      }

      // Subir imagen a Google Drive
      try {
        const { id: imageFileId, webViewLink } = await uploadFileToGoogleDrive(req.file, formattedFileName, folderId);

        // Eliminar archivo local
        fs.unlinkSync(req.file.path);

        // Agregar el ID del archivo de imagen y la URL al paymentData
        paymentData.captura_id = imageFileId;
        paymentData.captura_url = webViewLink;
      } catch (error) {
        return res.status(500).json({ message: 'Internet inestable, intente nuevamente o recargue la pagina' });
      }
    } else if (req.body.deleteImage === 'true') {
      // Eliminar la imagen existente de Google Drive
      const fileId = payment.captura_id;
      if (fileId) {
        try {
          const { id: deletedId, webViewLink: deletedWebViewLink } = await deleteFileFromGoogleDrive(fileId);
          paymentData.captura_id = deletedId;
          paymentData.captura_url = deletedWebViewLink;
        } catch (error) {
          return res.status(500).json({ message: 'Internet inestable, intente nuevamente o recargue la pagina' });
        }
      }
    }

    await payment.update(paymentData);
    res.status(200).json({ message: 'Pago actualizado con éxito', payment });
  } catch (error) {
    if (error.code === 'ERR_SOCKET_CONNECTION_TIMEOUT') {
      return res.status(500).json({ message: 'Internet inestable, intente nuevamente o recargue la pagina' });
    } else {
      console.error(error);
    }
  }
};

// Añadir Fecha
exports.addWeek = async (req, res) => {
  try {
    const { year, month, week } = req.body;

    const weekExists = await Week.findOne({ where: { anio: year, mes: month, semana: week } });
    if (weekExists) {
      return res.status(400).json({ error: 'Esta fecha ya existe' });
    }

    // Crear la semana en la base de datos
    const newWeek = await Week.create({ anio: year, mes: month, semana: week });

    res.status(201).json({ message: 'Fecha añadida con éxito', week: newWeek });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Eliminar fecha
exports.deleteWeek = async (req, res) => {
  try {
    const { id } = req.params;
    const week = await Week.findByPk(id, {
      include: {
        model: Payment,
        as: 'Payments', // Asegúrate de que este alias sea correcto
      },
    });

    if (!week) {
      return res.status(404).json({ message: 'Semana no encontrada' });
    }

    if (week.Payments) {
      for (const payment of week.Payments) {
        if (payment.captura_id) {
          try {
            // Elimina la captura de Google Drive
            await deleteFileFromGoogleDrive(payment.captura_id);
          } catch (error) {
            return res.status(500).json({ message: 'Error al eliminar captura de Google Drive' });
          }
        }
      }
    }

    // Elimina la semana de la base de datos
    // Las llamadas y pagos asociados se eliminarán automáticamente debido a la opción 'onDelete: CASCADE'
    await week.destroy();

    res.status(200).json({ message: 'Semana eliminada con éxito' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

// Editar Fecha
exports.updateWeek = async (req, res) => {
  try {
    const { id } = req.params; // Recoger el ID de los parámetros de la ruta
    const weekData = req.body; // Recoger los datos de la semana del cuerpo de la solicitud

    // Buscar la semana que se va a actualizar
    const weekToUpdate = await Week.findByPk(id);

    if (!weekToUpdate) {
      return res.status(404).json({ message: 'Semana no encontrada' });
    }

    // Actualizar la semana en la base de datos
    const updatedWeek = await weekToUpdate.update(weekData);

    res.status(200).json({ message: 'Fecha actualizada con éxito', week: updatedWeek });
  } catch (error) {
    if (error.code === 'ERR_SOCKET_CONNECTION_TIMEOUT') {
      return res.status(500).json({ message: 'Internet inestable, intente nuevamente o recargue la pagina' });
    } else {
      console.error(error);
    }
  }
};

// Añadir Teléfono
exports.addPhone = async (req, res) => {
  try {
    const { phoneNumber, UserId } = req.body;

    const phoneExists = await Phone.findOne({ where: { phoneNumber: phoneNumber } });
    if (phoneExists) {
      return res.status(400).json({ error: 'Este número de teléfono ya existe' });
    }

    const newPhone = await Phone.create({ phoneNumber: phoneNumber, UserId: UserId });

    res.status(201).json({ message: 'Teléfono añadido con éxito', phone: newPhone });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Editar Teléfono
exports.updatePhone = async (req, res) => {
  try {
    const { id } = req.params;
    const { phoneNumber, UserId } = req.body;

    const phoneToUpdate = await Phone.findByPk(id);

    if (!phoneToUpdate) {
      return res.status(404).json({ message: 'Teléfono no encontrado' });
    }

    // Verificar si el nuevo número de teléfono ya existe en otros registros
    const phoneExists = await Phone.findOne({ where: { phoneNumber: phoneNumber, id: { [Op.ne]: id } } });

    if (phoneExists) {
      return res.status(400).json({ error: 'Este número de teléfono ya existe' });
    }

    const updatedPhone = await phoneToUpdate.update({ phoneNumber: phoneNumber, UserId: UserId });

    res.status(200).json({ message: 'Teléfono actualizado con éxito', phone: updatedPhone });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Desactivar Teléfono
exports.deactivatePhone = async (req, res) => {
  try {
    const { id } = req.params;
    const phoneToDeactivate = await Phone.findByPk(id);

    if (!phoneToDeactivate) {
      return res.status(404).json({ message: 'Teléfono no encontrado' });
    }

    phoneToDeactivate.isActive = false;
    await phoneToDeactivate.save();

    res.status(200).json({ message: 'Teléfono desactivado con éxito' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Activar Teléfono
exports.activatePhone = async (req, res) => {
  try {
    const { id } = req.params;
    const phoneToActivate = await Phone.findByPk(id);

    if (!phoneToActivate) {
      return res.status(404).json({ message: 'Teléfono no encontrado' });
    }

    phoneToActivate.isActive = true;
    await phoneToActivate.save();

    res.status(200).json({ message: 'Teléfono activado con éxito' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Eliminar Teléfono
exports.deletePhone = async (req, res) => {
  try {
    const { id } = req.params;
    const phoneToDelete = await Phone.findByPk(id);

    if (!phoneToDelete) {
      return res.status(404).json({ message: 'Teléfono no encontrado' });
    }

    await phoneToDelete.destroy();

    res.status(200).json({ message: 'Teléfono eliminado con éxito' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Exportar todas las semanas a Google Sheets
exports.backupData = async (req, res) => {
  try {
    const callsData = await Call.findAll({
        attributes: ['id', 'telefono_id', 'semana_id', 'calls1stCut', 'firstCut', 'calls2ndCut', 'secondCut', 'callsFinalCut', 'finalCut', 'totalCalls', 'totalAmount'],
        include: [{
          model: Phone,
          attributes: ['phoneNumber', 'UserId'], // Incluir el ID de usuario en el atributo "UserId"
          include: [{
            model: User,
            attributes: ['id', 'username'] // Incluir el ID de usuario en los atributos
          }]
        }]
    });

    const paymentsData = await Payment.findAll({
        attributes: ['id', 'UserId', 'semana_id', 'totalCallsSum', 'totalAmountSum', 'pago', 'estatus', 'banco', 'captura_id', 'captura_url'],
        include: [{
          model: User,
          attributes: ['id', 'username', 'email'] // Incluir el ID de usuario en los atributos
        }]
    });

    // Convertir los datos a un formato básico de JavaScript (sin los metadatos adicionales que Sequelize incluye)
    const formattedCallsData = callsData.map(call => {
      const plainCall = call.get({ plain: true });
      return {
        UserID_L: plainCall.Phone.UserId, // Acceder al ID de usuario a través del modelo Phone
        Semana_L: plainCall.semana_id,
        Nombre: plainCall.Phone.User.username,
        Teléfono: plainCall.Phone.phoneNumber,
        Llam1: plainCall.calls1stCut,
        "1ER": plainCall.firstCut,
        Llam2: plainCall.calls2ndCut,
        "2DO": plainCall.secondCut,
        LlamF: plainCall.callsFinalCut,
        Final: plainCall.finalCut,
        LlamT: plainCall.totalCalls,
        Total: plainCall.totalAmount
      };
    });

    const formattedPaymentsData = paymentsData.map(payment => {
      const plainPayment = payment.get({ plain: true });
      return {
        UserID_P: plainPayment.User.id,
        Semana_P: plainPayment.semana_id,
        Nombre: plainPayment.User.username,
        Correo: plainPayment.User.email,
        LlamP: plainPayment.totalCallsSum,
        Pago: plainPayment.totalAmountSum,
        Fecha: plainPayment.pago,
        Estatus: plainPayment.estatus,
        Banco: plainPayment.banco,
        Cap: plainPayment.captura_url ? `=HYPERLINK("${plainPayment.captura_url}"; "Ver")` : ''
      };
    });

    const weeks = new Set(); 

    formattedCallsData.forEach(call => {
      if(call.Semana_L !== undefined) {
        weeks.add(call.Semana_L);
      }
    });
    formattedPaymentsData.forEach(payment => {
      if(payment.Semana_P !== undefined) {
        weeks.add(payment.Semana_P);
      }
    });

    for (let weekId of weeks) {
      const callsForWeek = formattedCallsData.filter(call => call.Semana_L === weekId);
      const paymentsForWeek = formattedPaymentsData.filter(payment => payment.Semana_P === weekId);
      
      await backupDataToGoogleSheets(weekId, callsForWeek, paymentsForWeek);
    }

    return Promise.resolve('Datos respaldados con éxito.');
  } catch (error) {
    console.error('Error al respaldar los datos:', error);
    return Promise.reject('Hubo un error al respaldar los datos.');
  }
};

exports.backupDataHttp = async (req, res) => {
  try {
    const message = await exports.backupData();
    res.status(200).json({ message: message });
  } catch (error) {
    console.error('Error al respaldar los datos:', error);
    res.status(500).json({ message: 'Hubo un error al respaldar los datos.' });
  }
};

// Exportar una semana a Google Sheets
exports.backupDataWeek = async (req, res) => {
  try {
    const { id } = req.params;

    const week = await Week.findByPk(id);

    if (!week) {
      return res.status(400).json({ message: 'No se pudo encontrar la semana seleccionada.' });
    }

    const callsData = await Call.findAll({
        where: { semana_id: week.id },
        attributes: ['id', 'telefono_id', 'semana_id', 'calls1stCut', 'firstCut', 'calls2ndCut', 'secondCut', 'callsFinalCut', 'finalCut', 'totalCalls', 'totalAmount'],
        include: [{
          model: Phone,
          attributes: ['phoneNumber', 'UserId'], 
          include: [{
            model: User,
            attributes: ['id', 'username'] 
          }]
        }]
    });

    const paymentsData = await Payment.findAll({
        where: { semana_id: week.id },
        attributes: ['id', 'UserId', 'semana_id', 'totalCallsSum', 'totalAmountSum', 'pago', 'estatus', 'banco', 'captura_id', 'captura_url'],
        include: [{
          model: User,
          attributes: ['id', 'username', 'email']
        }]
    });

    // Convertir los datos a un formato básico de JavaScript (sin los metadatos adicionales que Sequelize incluye)
    const formattedCallsData = callsData.map(call => {
      const plainCall = call.get({ plain: true });
      return {
        UserID_L: plainCall.Phone.UserId, // Acceder al ID de usuario a través del modelo Phone
        Semana_L: plainCall.semana_id,
        Nombre: plainCall.Phone.User.username,
        Teléfono: plainCall.Phone.phoneNumber,
        Llam1: plainCall.calls1stCut,
        "1ER": plainCall.firstCut,
        Llam2: plainCall.calls2ndCut,
        "2DO": plainCall.secondCut,
        LlamF: plainCall.callsFinalCut,
        Final: plainCall.finalCut,
        LlamT: plainCall.totalCalls,
        Total: plainCall.totalAmount
      };
    });

    const formattedPaymentsData = paymentsData.map(payment => {
      const plainPayment = payment.get({ plain: true });
      return {
        UserID_P: plainPayment.User.id,
        Semana_P: plainPayment.semana_id,
        Nombre: plainPayment.User.username,
        Correo: plainPayment.User.email,
        LlamP: plainPayment.totalCallsSum,
        Pago: plainPayment.totalAmountSum,
        Fecha: plainPayment.pago,
        Estatus: plainPayment.estatus,
        Banco: plainPayment.banco,
        Cap: plainPayment.captura_url ? `=HYPERLINK("${plainPayment.captura_url}"; "Ver")` : ''
      };
    });

    await backupDataToGoogleSheets(week.id, formattedCallsData, formattedPaymentsData);

    res.status(200).json({ message: 'Datos de la semana seleccionada respaldados con éxito.' });
  } catch (error) {
    console.error('Error al respaldar los datos:', error);
    res.status(500).json({ message: 'Hubo un error al respaldar los datos.' });
  }
};
