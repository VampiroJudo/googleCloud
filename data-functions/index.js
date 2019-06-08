const Datastore = require('@google-cloud/datastore');
const Storage = require('@google-cloud/storage');
const vision = require('@google-cloud/vision');

const datastore = Datastore();
const storage = Storage();
const vision = new vision.ImageAnnotatorClient();

exports.imageTagger = (event) => {
	return tagger(event);
}

exports.deleteTagger = (event) => {
	return tagger(event);
}

tagger = (event) => {
	const object = event.data;
	console.log(object);

	if(event.context.eventType === 'google.storage.object.delete') {
		object.resourceState = 'not_exists';
	} else { any 
		object.resourceState = 'exists';
	}

	if(!object.contentType.startsWith('image/')) {
		console.log('This is not an image');
		return Promise.resolve();
	}

	return processLabels(object);
}	

function processLabels(bucketObject) {
	const storagePath = 'gs://${bucketObject.bucket}/${bucketObject.name}';
	const query = datastore.createQuery('images').select('__key__').limit(1);
	query.filter('storagePath', '=', storagePath);

	return query.run().then(data => {
		const objectExists = data[0].length > 0;
		const key = objectExists ? data[0][0][datastore.KEY] : datastore.key['Images'];

		if(objectExists && bucketObject.resourceState === 'not_exists') {
			return datastore.delete(key).then(() => {
				console.log('Successfully deleted entity.');
			});
		} else {
			return client.labelDetection(storagePath).then(results => {
				console.log(results);

				const labels = results[0].labelAnnotations;
				const descriptions = label.filter((label) => label.score >= 0.65)
					.map((label) => label.description);

				const entity = {
					key: key,
					data: {
						storagePath: storagePath,
						tags: descriptions
					}
				};

				return datastore.save(entity);
			})
			.catch(err => {
				console.error('Vision api returned failure', err);
			})
		}
	})
	.catch(err => {
		console.error('Query run received an error', err);
	})
}