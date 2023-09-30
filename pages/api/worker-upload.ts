const { parentPort } = require('worker_threads');
const { BlobServiceClient, ContainerClient } = require("@azure/storage-blob");
require('ts-node').register();

parentPort.on('message', async (data: any) => {
    const { fileData, fileName, AZURE_CONNECTION_STRING, AZURE_SAS_TOKEN, AZURE_CONTAINER_NAME } = data;

    const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_CONNECTION_STRING);
    const sasToken = AZURE_SAS_TOKEN;
    const containerName = AZURE_CONTAINER_NAME;
    const containerUrl = blobServiceClient.getContainerClient(containerName).url + sasToken;
    const containerClient = new ContainerClient(containerUrl);
    const blobClient = containerClient.getBlobClient(fileName);
    const blockBlobClient = blobClient.getBlockBlobClient();
    const finalFileBuffer = Buffer.concat(fileData);

    try {
        const response = await blockBlobClient.upload(finalFileBuffer, finalFileBuffer.length);
        parentPort.postMessage({ status: 'success', response });
    } catch (error) {
        console.log(error);
        parentPort.postMessage({ status: 'error', error });
    }
});
