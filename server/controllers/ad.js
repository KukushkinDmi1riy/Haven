// controllers/ad.js
import nanoid from 'nanoid';
import * as config from '../../config.js';
import Ad from '../models/ad.js';
import User from '../models/user.js';
import slugify from 'slugify';

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

export const create = async (req, res) => {
  try {
    const { photos, description, address, price, type, landsize } = req.body;

    if (!photos?.length) {
      return res.json({ error: 'Photos are required' });
    }
    if (!price) {
      return res.json({ error: 'Price is required' });
    }
    if (!type) {
      return res.json({ error: 'Is property house or land?' });
    }
    if (!address) {
      return res.json({ error: 'Address is required' });
    }
    if (!description) {
      return res.json({ error: 'Description is required' });
    }

    const geo = await config.GOOGLE_GEOCODER.geocode(address);

    const ad = await new Ad({
      ...req.body,
      slug: slugify(`${type}-${address}-${price}-${nanoid(6)}`),
      postedBy: req.user._id,
      location: {
        type: 'Point',
        coordinates: [geo?.[0]?.longitude, geo?.[0]?.latitude],
      },
      googleMap: geo,
    }).save();

    //made user a Seller

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        $addToSet: { role: 'Seller' },
      },
      { new: true },
    );
    user.password = undefined;
    user.resetCode = undefined;
    res.json({
      ad,
      user,
    });
  } catch (err) {
    console.log(err);
    res.json({ error: 'Something went wrong. Try later.' });
  }
};

export const ads = async (req, res) => {
  try {
    const adsForSell = await Ad.find({ action: 'Sell' }).select(
      '-googleMap -location -photo.Key -photo.key -photo.ETag',
    ).sort({createdAt: -1}).limit(12);

	const adsForRent = await Ad.find({ action: 'Rent' })
    .select('-googleMap -location -photo.Key -photo.key -photo.ETag')
    .sort({ createdAt: -1 })
    .limit(12);

	res.json({adsForSell, adsForRent})
  } catch (error) {
    console.log(error);
  }
};
