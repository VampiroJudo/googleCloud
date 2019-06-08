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

function processLabels(bucketObject) {
	const storagePath = 'gs://${bucketObject.bucket}/${bucketObject.name}';
	const query = datastore.createQuery('images').select('__key__').limit(1);
	query.filter('storagePath', '=', storagePath);

	return query.run().then(data => {
		const objectExists = data[0].length > 0;
		const key = objectExists ? data[0][0][datastore.KEY] : datastore.key['Images'];

		if(objectExists && bucketObject.resource == 'not_exists') {
			return datastore.delete(key).then(() => {
				console.log('Successfully deleted entity.');
			});
		}
	})
	.catch(err => {
		console.log('Query run received an error', err);
	})
}