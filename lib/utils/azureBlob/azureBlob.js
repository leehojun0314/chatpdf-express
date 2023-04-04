"use strict";

var _storageBlob = require("@azure/storage-blob");
var _jsBase = require("js-base64");
var _path = _interopRequireDefault(require("path"));
var _axios = require("./axios");
var _duplicatedObj = _interopRequireDefault(require("./class/duplicatedObj"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const storageAccountName = process.env.REACT_APP_STORAGE_NAME; // Fill string with your Storage resource name

function getContainerClient(sasToken, containerId) {
  const blobService = new _storageBlob.BlobServiceClient(`https://${storageAccountName}.blob.core.windows.net/?${sasToken}`);
  // const blobService = new BlobClient(
  // 	`https://${storageAccountName}.blob.core.windows.net/?${sasToken}`,
  // );
  return blobService.getContainerClient(containerId);
}
function getSrcUrl(sasToken, containerId, blobName) {
  //img , video tag의 src로 들어가면 됩니다.
  return `https://${storageAccountName}.blob.core.windows.net/${containerId}/${blobName}?${sasToken}`;
}
async function downloadBlob(sasToken, containerId, blobName) {
  sasToken = await (0, _axios.getSasKey)(containerId);
  let aTag = document.createElement('a');
  aTag.href = getSrcUrl(sasToken, containerId, blobName);
  document.body.appendChild(aTag);
  aTag.click();
  document.body.removeChild(aTag);
  return;
}
async function downloadBlobList(sasToken, containerId, downloadList) {
  sasToken = await (0, _axios.getSasKey)(containerId);
  var interval = setInterval(download, 350, downloadList);
  async function download(downloadList) {
    var blob = downloadList.pop();
    var a = document.createElement('a');
    a.setAttribute('href', getSrcUrl(sasToken, containerId, blob.name));
    a.setAttribute('download', '');
    // a.setAttribute('target', '_blank');
    a.click();
    if (downloadList.length === 0) {
      clearInterval(interval);
    }
  }
}
async function listBlobsFlat(containerId, sasToken, prefix) {
  //prefix는 문자열 ex) 'a/b/'
  const returnedBlobs = [];
  sasToken = await (0, _axios.getSasKey)(containerId);
  const containerClient = getContainerClient(sasToken, containerId);
  for await (const blob of containerClient.listBlobsFlat({
    includeTags: true,
    includeMetadata: true,
    prefix: prefix ? prefix : ''
  })) {
    if (blob.tags?.author) {
      blob.tags.author = (0, _jsBase.decode)(blob.tags.author);
    }
    blob.selected = false;
    if (_path.default.basename(blob.name) !== 'index') {
      //exclude file which made for create folder. (가상 hierarch 특성상 폴더 안에 파일이 없으면 폴더가 자동삭제 되기 때문.)
      returnedBlobs.push(blob);
    }
  }
  return returnedBlobs;
}
async function listBlobsHierarchy(folderPath,
//arr ['testFolder1' , 'asd'] if root: []
containerId, sasToken) {
  const returnedBlobs = [];
  sasToken = await (0, _axios.getSasKey)(containerId);
  const containerClient = getContainerClient(sasToken, containerId);
  for await (const blob of containerClient.listBlobsByHierarchy(`/`, {
    includeTags: true,
    includeMetadata: true,
    prefix: folderPath.length > 0 ? `${folderPath.join('/')}/` : null
  })) {
    if (blob.tags?.author) {
      blob.tags.author = (0, _jsBase.decode)(blob.tags.author);
    }
    if (_path.default.basename(blob.name) !== 'index') {
      //exclude file which made for create folder. (가상 hierarch 특성상 폴더 안에 파일이 없으면 폴더가 자동삭제 되기 때문.)
      returnedBlobs.push(blob);
    }
  }
  return returnedBlobs;
}
async function deleteBlob(blobName, folderPath, containerId, sasToken) {
  sasToken = await (0, _axios.getSasKey)(containerId);
  const containerClient = getContainerClient(sasToken, containerId);
  let dir = folderPath.length > 0 ? folderPath.join('/') + '/' : '';
  console.log(dir + blobName);
  await containerClient.deleteBlob(dir + _path.default.basename(blobName));
}
async function deleteFolder(folderName, containerId, sasToken) {
  sasToken = await (0, _axios.getSasKey)(containerId);
  const containerClient = getContainerClient(sasToken, containerId);
  for await (const blob of containerClient.listBlobsFlat({
    prefix: folderName
  })) {
    await containerClient.deleteBlob(blob.name);
  }
}
async function renameBlob(targetPath, targetContainerId, changedName, folderPath, sasToken, author) {
  //targetPath ex : ['folder1', 'folder2', 'target', 'folder3', 'folder4']
  //folderPath ex : ['folder1', 'folder2']
  sasToken = await (0, _axios.getSasKey)(targetContainerId);
  let splitArr = targetPath.split('/');
  let slicedBlobPath = splitArr.slice(folderPath.length, splitArr.length);
  slicedBlobPath[0] = changedName;
  slicedBlobPath.unshift(...folderPath);
  //slicedBlobPath ex: ['folder1', 'folder2', 'changedName', 'folder3', folder4']
  let changedPath = slicedBlobPath.join('/');
  const containerClient = getContainerClient(sasToken, targetContainerId);
  const targetBlobClient = containerClient.getBlockBlobClient(targetPath);
  const changedBlobClient = containerClient.getBlockBlobClient(changedPath);
  await changedBlobClient.beginCopyFromURL(`https://${storageAccountName}.blob.core.windows.net/${targetContainerId}/${encodeURI(targetPath)}?${sasToken}`, {
    tags: {
      author: (0, _jsBase.encode)(author)
    }
  });
  await targetBlobClient.delete();
}
async function renameFolder(targetPath, targetContainerId, changedName, folderPath, sasToken, author) {
  sasToken = await (0, _axios.getSasKey)(targetContainerId);
  const containerClient = getContainerClient(sasToken, targetContainerId);
  for await (let blob of containerClient.listBlobsFlat({
    prefix: targetPath
  })) {
    await renameBlob(blob.name, targetContainerId, changedName, folderPath, sasToken, author);
  }
}
async function copyBlob(targetPath, targetContainerId, targetSasToken, destinationPath, destinationContainerId, destinationSasToken, isDelete, author, handleDuplication, duplicateChecked = false) {
  //targetPath ex: ['folder1', 'folder2', 'target'].join('/')
  //destinationPath ex: ['dsetination', 'folder2', 'target'].join('/)
  //check duplication
  targetSasToken = await (0, _axios.getSasKey)(targetContainerId);
  destinationSasToken = await (0, _axios.getSasKey)(destinationContainerId);
  if (!duplicateChecked) {
    if (await checkExistsByPath(destinationPath, destinationContainerId, destinationSasToken)) {
      if (isDelete && targetContainerId === destinationContainerId && targetPath === destinationPath) {
        //이동인데 제자리 이동이면 아무것도 하지 않음
        return;
      }
      const dupObj = new _duplicatedObj.default(targetPath, targetContainerId, targetSasToken, destinationPath, destinationContainerId, destinationSasToken, isDelete, author);
      handleDuplication(dupObj);
      return;
    }
  }
  const destinationContainerClient = getContainerClient(destinationSasToken, destinationContainerId);
  const targetContainerClient = getContainerClient(targetSasToken, targetContainerId);
  const blobClient = destinationContainerClient.getBlockBlobClient(destinationPath);
  await blobClient.beginCopyFromURL(`https://${storageAccountName}.blob.core.windows.net/${targetContainerId}/${encodeURI(targetPath)}?${targetSasToken}`, {
    tags: {
      author: (0, _jsBase.encode)(author)
    }
  });
  // await blobClient.setTags({ author: encode(author) });
  if (isDelete) {
    await targetContainerClient.getBlockBlobClient(targetPath).delete();
  }
}
async function copyFolder(targetPath, targetContainerId, targetSasToken, destinationPath, destinationContainerId, destinationSasToken, isDelete, author, folderPath, handleDuplication) {
  targetSasToken = await (0, _axios.getSasKey)(targetContainerId);
  destinationSasToken = await (0, _axios.getSasKey)(destinationContainerId);
  const containerClient = getContainerClient(targetSasToken, targetContainerId);
  for await (const blob of containerClient.listBlobsFlat({
    prefix: targetPath
  })) {
    let targetPathArr = blob.name.split('/');
    let centerPath = targetPathArr.filter((el, idx) => folderPath[idx] !== el).join('/');
    let finalPath = destinationPath + centerPath;
    await copyBlob(blob.name, targetContainerId, targetSasToken, finalPath, destinationContainerId, destinationSasToken, isDelete, author, handleDuplication);
  }
}
async function checkExists(file, filePath, containerId, sasToken) {
  //업로드 할 때
  sasToken = await (0, _axios.getSasKey)(containerId);
  const containerClient = getContainerClient(sasToken, containerId);
  const fileName = file.webkitRelativePath ? file.webkitRelativePath : file.name;
  const finalPath = filePath + fileName;
  const blobClient = containerClient.getBlockBlobClient(finalPath);
  let result = await blobClient.exists();
  return result;
}
async function checkExistsByPath(filePath, containerId, sasToken) {
  sasToken = await (0, _axios.getSasKey)(containerId);
  const containerClient = getContainerClient(sasToken, containerId);
  const blobClient = containerClient.getBlockBlobClient(filePath);
  let result = await blobClient.exists();
  return result;
}
async function uploadFileToBlob(file, filePath, containerId, author, handleProgress, sasToken, abortSignal) {
  if (!file) return null;
  sasToken = await (0, _axios.getSasKey)(containerId);
  const containerClient = getContainerClient(sasToken, containerId);
  const fileName = file.webkitRelativePath ? file.webkitRelativePath : file.name;
  const finalPath = filePath + fileName;

  //check if index exists
  let indexExists;
  let blobClientForIndex = containerClient.getBlockBlobClient(_path.default.dirname(finalPath) + '/index');
  indexExists = await blobClientForIndex.exists();
  if (!indexExists) {
    //해당 폴더에 index가 있을경우 추가
    await blobClientForIndex.uploadData('');
  }
  let blobClient = containerClient.getBlockBlobClient(finalPath);
  //progress
  var res = await blobClient.uploadData(file, {
    onProgress: handleProgress,
    abortSignal: abortSignal,
    tags: {
      author: (0, _jsBase.encode)(author)
    }
  });
  return res;
}
async function createNewFolder(path, containerId, sasToken) {
  sasToken = await (0, _axios.getSasKey)(containerId);
  const containerClient = getContainerClient(sasToken, containerId);
  const blobClient = containerClient.getBlockBlobClient(`${path}index`);
  let response = {};
  let exists = await blobClient.exists();
  if (!exists) {
    await blobClient.uploadData('');
    response.result = true;
  } else {
    response.result = false;
  }
  return response;
}
async function getFolders(folderPath, containerId) {
  //파일 이동/복사 모달에서 사용
  const folderList = [];
  let sasToken = await (0, _axios.getSasKey)(containerId);
  const containerClient = getContainerClient(sasToken, containerId);
  const blobs = containerClient.listBlobsByHierarchy('/', {
    prefix: folderPath.length > 0 ? folderPath.join('/') + '/' : null
  });
  for await (let blob of blobs) {
    if (blob.kind === 'prefix') {
      folderList.push(blob);
    }
  }
  return folderList;
}
async function findByTags(sasToken, containerId, search) {
  sasToken = await (0, _axios.getSasKey)(containerId);
  const blobService = new _storageBlob.BlobServiceClient(`https://${storageAccountName}.blob.core.windows.net/${containerId}?${sasToken}`);
  let result = [];
  for await (const blob of blobService.findBlobsByTags(`name='${(0, _jsBase.encode)(search)}'`)) {
    result.push(blob);
  }
  return result;
}
module.exports = {};