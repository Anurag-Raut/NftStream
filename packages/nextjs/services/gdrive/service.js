const { google } = require('googleapis');
const fs = require('fs');
const readline = require('readline');
const path=require('path')

const credentials = require('../../../../../../streamvault-392317-3047b303f72c.json');

// Configure authentication
const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/drive.file'],
});

const drive = google.drive({ version: 'v3', auth });



async function createFolder(folderName, parentFolderId) {
    const folderMetadata = {
      name: folderName,
    //   parents: [parentFolderId],
      mimeType: 'application/vnd.google-apps.folder',
    };
  
    try {
      const response = await drive.files.create({
        resource: folderMetadata,
        fields: 'id',
      });
  
      console.log('Folder created successfully. Folder ID:', response.data.id);
      return response.data.id;
    } catch (error) {
      console.error('Error creating folder:', error.message);
    }
  }


async function uploadToDrive(source, destinationFolderId,folderName, parentFolderId = '') {
    const stats = fs.lstatSync(source);
  
    if (stats.isFile()) {
        console.log('hemlu')
      const fileName = path.basename(source);
      const fileMetadata = {
        name: fileName,
        // parents: [destinationFolderId],
      };
  
      const media = {
        mimeType: 'application/octet-stream',
        body: fs.createReadStream(source),
      };
  
      try {
        const response = await drive.files.create({
          resource: fileMetadata,
          media: media,
          fields: 'id',
        });
  
        console.log(`File uploaded successfully. File ID: ${response.data.id}`);
      } catch (error) {
        console.error('Error uploading file:', error.message);
      }
    } else if (stats.isDirectory()) {
    //   const folderName = path.basename(source);
      const folderMetadata = {
        name: folderName,
        // parents: [destinationFolderId],
        mimeType: 'application/vnd.google-apps.folder',
      };
  
      try {
        const folderResponse = await drive.files.create({
          resource: folderMetadata,
          fields: 'id',
        });
  
        const folderId = folderResponse.data.id;
        console.log(`Folder created successfully. Folder ID: ${folderId}`);
  
        const files = fs.readdirSync(source);
        for (const file of files) {
          const filePath = path.join(source, file);
          await uploadToDrive(filePath, folderId);
        }
      } catch (error) {
        console.error('Error creating folder:', error.message);
      }
    }
  
}
async function findFolderByName(folderName) {
    try {
      const response = await drive.files.list({
        q: `mimeType='application/vnd.google-apps.folder' and name='${folderName}'`,
        fields: 'files(id, name)',
      });
  
      const folders = response.data.files;
      if (folders.length > 0) {
        console.log('Folder found. Folder ID:', folders[0].id);
        return folders[0].id;
      } else {
        console.log('Folder not found.');
        return null;
      }
    } catch (error) {
      console.error('Error finding folder:', error.message);
    }
  }



async function getFilesInFolder(folderId) {
  try {
    const response = await drive.files.list({
      q: `'${folderId}' in parents`,
      fields: 'files(id, name)',
    });

    const files = response.data.files;
    if (files.length > 0) {
      console.log('Files in the folder:');
      files.forEach((file) => {
        console.log(`- File Name: ${file.name}, File ID: ${file.id}`);
      });
    } else {
      console.log('No files found in the folder.');
    }
  } catch (error) {
    console.error('Error retrieving files:', error.message);
  }
}







  async function getAllFolders() {
    try {
      const response = await drive.files.list({
        q: "mimeType='application/vnd.google-apps.folder'",
        fields: 'files(id, name)',
      });
  
      const folders = response.data.files;
      if (folders.length > 0) {
        console.log('Folders in Google Drive:');
        folders.forEach((folder) => {
          console.log(`- Folder Name: ${folder.name}, Folder ID: ${folder.id}`);
        });
      } else {
        console.log('No folders found in Google Drive.');
      }
    } catch (error) {
      console.error('Error retrieving folders:', error.message);
    }
  }



  async function deleteItem(itemId) {
    try {
      await drive.files.delete({
        fileId: itemId,
      });
  
      console.log('Item deleted successfully. Item ID:', itemId);
    } catch (error) {
      console.error('Error deleting item:', error.message);
    }
  }


  async function deleteAll() {
    try {
      const response = await drive.files.list({
        fields: 'files(id)',
      });
  
      const items = response.data.files;
      if (items.length > 0) {
        console.log('Deleting all files and folders in Google Drive...');
        for (const item of items) {
          await deleteItem(item.id);
        }
        console.log('All files and folders deleted successfully.');
      } else {
        console.log('No items found in Google Drive.');
      }
    } catch (error) {
      console.error('Error retrieving items:', error.message);
    }
  }



  function uploadFolder(auth) {
    const drive = google.drive({ version: 'v3', auth });
  
    const folderName = 'Folder Name'; // Name of the folder to create in Google Drive
    const folderPath = 'path/to/folder'; // Path to the local folder to upload
  
    // Create a folder in Google Drive
    drive.files.create(
      {
        requestBody: {
          name: folderName,
          mimeType: 'application/vnd.google-apps.folder',
        },
      },
      (err, folder) => {
        if (err) {
          console.error('Error creating folder:', err);
          return;
        }
  
        const folderId = folder.data.id;
        uploadFiles(folderId, folderPath, drive);
      }
    );
  }
  
  // Upload files recursively to Google Drive
  function createDirectory(auth) {
    const drive = google.drive({ version: 'v3', auth });
  
    const parentFolderId = 'YOUR_PARENT_FOLDER_ID'; // ID of the parent folder (or root folder if empty)
    const folderName = 'New Folder'; // Name of the new folder to create
    const folderPath = 'path/to/files'; // Path to the local folder containing files to upload
  
    // Check if parent folder exists
    drive.files.get(
      { fileId: parentFolderId, fields: 'id' },
      (err, file) => {
        if (err) {
          console.error('Error getting parent folder:', err);
          return;
        }
  
        if (!file.data.id) {
          // Parent folder doesn't exist, create it
          drive.files.create(
            {
              requestBody: {
                name: folderName,
                mimeType: 'application/vnd.google-apps.folder',
                parents: [parentFolderId],
              },
            },
            (err, folder) => {
              if (err) {
                console.error('Error creating parent folder:', err);
                return;
              }
  
              const newParentFolderId = folder.data.id;
              uploadFiles(newParentFolderId, folderPath, drive);
            }
          );
        } else {
          // Parent folder exists, use it
          uploadFiles(parentFolderId, folderPath, drive);
        }
      }
    );
  }
  
  // Upload files to the specified folder
  function uploadFiles(parentFolderId, folderPath, drive) {
    fs.readdir(folderPath, { withFileTypes: true }, (err, files) => {
      if (err) {
        console.error('Error reading folder:', err);
        return;
      }
  
      files.forEach((file) => {
        const filePath = `${folderPath}/${file.name}`;
  
        if (file.isDirectory()) {
          // Skip subfolders
          console.log(`Skipping subfolder: ${file.name}`);
        } else {
          // Upload file to the parent folder
          const media = {
            mimeType: 'application/octet-stream',
            body: fs.createReadStream(filePath),
          };
  
          drive.files.create(
            {
              requestBody: {
                name: file.name,
                parents: [parentFolderId],
              },
              media,
            },
            (err, res) => {
              if (err) {
                console.error('Error uploading file:', err);
                return;
              }
              console.log('File uploaded:', res.data.name);
            }
          );
        }
      });
    });
  }

const hlsFolderPath = '../VOD/output/fold'; // Path to the root folder of your HLS files
const destinationFolderId = ''; // The ID of the destination folder in Google Drive
const folderName='anurag'
// findFolderByName("anurag")
// createFolder(1,);
// deleteAll()
// getAllFolders()
// getFilesInFolder('1sCg4d8dKLcY5V2D3RVL2RlBvyL8mTROe')
uploadFiles('',hlsFolderPath,drive)
// uploadToDrive(hlsFolderPath, destinationFolderId,folderName);

// export {uploadToDrive};