const { BlobServiceClient } = require('@azure/storage-blob');

let containerClient = null;

const getContainerClient = () => {
  if (!containerClient) {
    const blobServiceClient = BlobServiceClient.fromConnectionString(
      process.env.AZURE_STORAGE_CONNECTION_STRING
    );
    containerClient = blobServiceClient.getContainerClient(
      process.env.AZURE_STORAGE_CONTAINER_NAME
    );
  }
  return containerClient;
};

module.exports = { getContainerClient };
