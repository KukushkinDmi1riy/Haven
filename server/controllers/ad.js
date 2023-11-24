// controllers/ad.js
import nanoid from 'nanoid';
import * as config from '../../config.js';

export const uploadImage = async (req, res) => {
  try {
    console.log(req.body);
    const { image } = req.body;
    if (!image) return res.status(400).send('No image');

    // prepare the image
    const base64Image = new Buffer.from(image.replace(/^data:image\/\w+;base64,/, ''), 'base64');
    const type = image.split(';')[0].split('/')[1];

    // image params
    const params = {
      Bucket: 'itmo-haven',
      Key: `${nanoid()}.${type}`,
      Body: base64Image,
      ACL: 'public-read',
      ContentEncoding: 'base64',
      ContentType: `image/${type}`,
    };

    // upload to s3
    config.AWSS3.upload(params, (err, data) => {
      if (err) {
        console.log(err);
        res.sendStatus(400);
      } else {
        console.log(data);
        res.send(data);
      }
    });
  } catch (err) {
    console.log(err);
    res.json({ error: 'Upload failed. Try again.' });
  }
};

export const removeImage = async (req, res) => {
  try {
    const { Key, Bucket } = req.body;

    config.AWSS3.deleteObject({ Bucket, Key }, (err, data) => {
      if (err) {
        console.log(err);
        res.sendStatus(400);
      } else {
        res.send({ ok: true });
      }
    });
  } catch (err) {
    console.log(err);
    res.json({ error: 'Remove file failed. Try again.' });
  }
};
