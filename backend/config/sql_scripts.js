const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const { dbConfig } = require('./database'); // Importa dbConfig

async function executeSQLScript() {
    try {
        const filePath = path.join(__dirname, 'triggers.sql');
        const sqlScript = fs.readFileSync(filePath, 'utf-8');

        const queries = sqlScript.split('--').map(query => query.trim()).filter(query => query.length > 0);

        const connection = await mysql.createConnection({
            host: dbConfig.dbHost, // Accede a las propiedades de dbConfig
            user: dbConfig.dbUser,
            password: dbConfig.dbPassword,
            database: dbConfig.dbName,
            port: process.env.DB_PORT // Asegúrate de tener DB_PORT en tu archivo .env
        });

        // Verifica si el trigger 'calls_before_insert' existe
        const triggerExists = await connection.query(
            `SELECT * FROM INFORMATION_SCHEMA.TRIGGERS WHERE TRIGGER_SCHEMA = ? AND TRIGGER_NAME = 'calls_before_insert'`,
            [dbConfig.dbName]
        );

        // Si no existe el trigger, entonces crea los triggers
        if (triggerExists[0].length === 0) {
            console.log('Triggers no encontrados, creándolos...');
            for (const query of queries) {
                console.log('Ejecutando consulta:', query);
                await connection.query(query); // Utiliza connection.query() en lugar de connection.execute()
                console.log('Consulta ejecutada con éxito:', query);
            }
            console.log('Scripts SQL ejecutados correctamente.');
        } else {
            console.log('Triggers ya existen, omitiendo la creación.');
        }

        await connection.end();
    } catch (error) {
        console.error('Error al ejecutar el script SQL:', error);
    }
}

module.exports = executeSQLScript;
