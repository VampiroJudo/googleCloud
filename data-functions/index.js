const Datastore = require('@google-cloud/datastore');
const Storage = require('@google-cloud/storage');
const vision = require('@google-cloud/vision');

const datastore = Datastore();
const storage = Storage();
const vision = new vision.ImageAnnotatorClient();

exports.imageTagger = (event, callback) => {
	const object = event.data;
	console.log(object);

	if(!object.contentType.startsWith('image/')) {
		console.log('This is not an image');
		callback();
		return;
	}
}	