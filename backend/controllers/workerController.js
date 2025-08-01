const User = require('../models/User');
const Phone = require('../models/Phone');
const Call = require('../models/Call');
const Payment = require('../models/Payment');
const Week = require('../models/Week');

exports.getWeeks = async (req, res) => {
  try {
    const weeks = await Week.findAll({
      attributes: ['anio', 'mes', 'semana'],
      include: [
        {
          model: Call,
          required: true, // Esto hará que solo se incluyan las semanas que tienen llamadas
          attributes: [], // No necesitamos ningún atributo de las llamadas, solo queremos saber si existen
          include: [
            {
              model: Phone,
              required: true,
              where: {
                UserId: req.user.id, // Filtrar por el UserId del usuario actual
              },
              attributes: [],
            },
          ],
        },
      ],
      group: ['Week.id', 'anio', 'mes', 'semana'], // Agrupar por los campos de la semana
      order: [['anio', 'ASC'], ['mes', 'ASC'], ['semana', 'ASC']],
    });

    res.json({ weeks });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

exports.getWorkerData = async (req, res) => {
  try {
    const { year, month, week } = req.query;

    const worker = await User.findOne({ where: { id: req.user.id } });
    if (!worker) {
      return res.status(404).json({ message: 'Trabajador no encontrado' });
    }

    const phones = await Phone.findAll({ where: { UserId: req.user.id } });

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
    });

    const payments = await Payment.findAll({
      where: { 
        UserId: req.user.id,
        semana_id: weekId  // Utiliza el ID de la semana para buscar los pagos
      },
      include: [
        { model: Week, required: true },
      ],
    });

    res.json({ worker, phones, calls, payments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

exports.getBankEmail = async (req, res) => {
  try {
    const user = await User.findOne({ where: { id: req.user.id } });
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    res.json({ bankEmail: user.bankEmail });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

exports.updateBankEmail = async (req, res) => {
  try {
    const { bankEmail } = req.body;
    await User.update({ bankEmail: bankEmail }, { where: { id: req.user.id } });
    res.json({ message: 'Correo del banco actualizado con éxito' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};
