const fs = require('fs');
const { google } = require('googleapis');

const jwtClient = new google.auth.JWT(
  process.env.CLIENT_EMAIL,
  null,
  process.env.PRIVATE_KEY.replace(/\\n/g, '\n'),
  ['https://www.googleapis.com/auth/drive'],
  null
);

async function uploadFileToGoogleDrive(file, fileName, folderId) {
  try {
    const googleDrive = google.drive({ version: 'v3', auth: jwtClient });

    // Buscar el archivo existente con el mismo nombre en la carpeta de destino
    const searchExistingFileResponse = await googleDrive.files.list({
      q: `mimeType='${file.mimetype}' and trashed = false and name='${fileName}' and parents in '${folderId}'`,
      fields: 'files(id)',
    });

    const existingFileId = searchExistingFileResponse.data.files.length > 0 ? searchExistingFileResponse.data.files[0].id : null;

    const media = {
      mimeType: file.mimetype,
      body: fs.createReadStream(file.path),
    };

    let fileResponse;

    if (existingFileId) {
      // Eliminar el archivo existente
      await googleDrive.files.delete({ fileId: existingFileId });
    }

    // Crear un nuevo archivo
    const fileMetadata = {
      name: fileName,
      mimeType: file.mimetype,
      parents: [folderId],
    };

    fileResponse = await googleDrive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id, webViewLink',
    });

    return fileResponse.data;
  } catch (error) {
    if (error.code === 'ERR_SOCKET_CONNECTION_TIMEOUT') {
      return res.status(500).json({ message: 'Internet inestable, intente nuevamente o recargue la pagina' });
    } else {
      console.error(error);
    }
  }
}

async function deleteFileFromGoogleDrive(fileId) {
  try {
    await jwtClient.authorize();
    const drive = google.drive({ version: 'v3', auth: jwtClient });
    await drive.files.delete({ fileId });
    return { id: '', webViewLink: '' }; // Devolver un objeto con propiedades vacías
  } catch (error) {
    console.error('Error al eliminar el archivo de Google Drive:', error);
    throw error;
  }
}

async function updateFileNameInGoogleDrive(fileId, newFileName) {
  try {
    await jwtClient.authorize();
    const drive = google.drive({ version: 'v3', auth: jwtClient });
    const response = await drive.files.update({
      fileId: fileId,
      requestBody: {
        name: newFileName
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error al actualizar el nombre del archivo en Google Drive:', error);
    throw error;
  }
}

module.exports = {
  uploadFileToGoogleDrive,
  deleteFileFromGoogleDrive,
  updateFileNameInGoogleDrive
};
