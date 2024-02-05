// controllers/ad.js
import nanoid from 'nanoid';
import * as config from '../../config.js';
import Ad from '../models/ad.js';
import User from '../models/user.js';
import slugify from 'slugify';
import { emailTemplate } from '../helpers/email.js';

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
    const adsForSell = await Ad.find({ action: 'Sell' })
      .select('-googleMap -location -photo.Key -photo.key -photo.ETag')
      .sort({ createdAt: -1 })
      .limit(12);

    const adsForRent = await Ad.find({ action: 'Rent' })
      .select('-googleMap -location -photo.Key -photo.key -photo.ETag')
      .sort({ createdAt: -1 })
      .limit(12);

    res.json({ adsForSell, adsForRent });
  } catch (error) {
    console.log(error);
  }
};

export const read = async (req, res) => {
  try {
    const { slug } = req.params;

    const ad = await Ad.findOne({ slug })
      // .select("-photos.Key -photos.key -photos.ETag -photos.Bucket")
      .populate('postedBy', 'name username email phone company photo.Location');

    const geo = await config.GOOGLE_GEOCODER.geocode(ad.address);
    // related
    const related = await Ad.find({
      _id: { $ne: ad._id },
      action: ad?.action,
      type: ad?.type,
      address: {
        $regex: ad?.googleMap[0]?.city,
        $options: 'i',
      },
    })
      .limit(3)
      .select('-photos.Key -photos.key -photos.ETag -photos.Bucket -googleMap')
      .populate('postedBy', 'name username email phone company photo.Location');

    console.log('AD => ', ad);
    console.log('related => ', related);

    res.json({ ad, related });
  } catch (err) {
    console.log(err);
  }
};

// controllers/ad.js
export const addToWishlist = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        $addToSet: { wishlist: req.body.adId },
      },
      { new: true },
    );
    const { password, resetCode, ...rest } = user._doc;
    res.json(rest);
  } catch (err) {
    console.log(err);
  }
};

export const removeFromWishlist = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        $pull: { wishlist: req.params.adId },
      },
      { new: true },
    );
    const { password, resetCode, ...rest } = user._doc;
    res.json(rest);
  } catch (err) {
    console.log(err);
  }
};

export const contactSeller = async (req, res) => {
  try {
    const { name, email, message, phone, adId } = req.body;
    const ad = await Ad.findById(adId).populate('postedBy', 'email');

    const user = await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { enquiredProperties: adId },
    });

    if (!user) {
      return res.json({ error: 'Could not find user with that email' });
    } else {
      // send email
      config.AWSSES.sendEmail(
        emailTemplate(
          ad.postedBy.email,
          `
        <p>You have received a new customer enquiry</p>

          <h4>Customer details</h4>
          <p>Name: ${name}</p>
          <p>Email: ${email}</p>
          <p>Phone: ${phone}</p>
          <p>Message: ${message}</p>

        <a href="${config.CLIENT_URL}/ad/${ad.slug}">${ad.type} in ${ad.address} for ${ad.action} ${ad.price}</a>
        `,
          email,
          'New enquiry received',
        ),
        (err, data) => {
          if (err) {
            console.log(err);
            return res.json({ ok: false });
          } else {
            console.log(data);
            return res.json({ ok: true });
          }
        },
      );
    }
  } catch (err) {
    console.log(err);
  }
};

export const userAds = async (req, res) => {
  try {
    const perPage = 2;
    const page = req.params.page ? req.params.page : 1;

    const total = await Ad.find({ postedBy: req.user._id });

    const ads = await Ad.find({ postedBy: req.user._id })
      .populate('postedBy', 'name email username phone company')
      .skip((page - 1) * perPage)
      .limit(perPage)
      .sort({ createdAt: -1 });

    res.json({ ads, total: total.length });
  } catch (err) {
    console.log(err);
  }
};

export const updateAd = async (req, res) => {
  try {
    const { photos, price, type, address, description } = req.body;

    const ad = await Ad.findById(req.params._id);

    console.log(ad, 'ad');

    const owner = req.user._id == ad?.postedBy;

    if (!owner) {
      return res.json({ error: 'Permission denied' });
    } else {
      // validation
      if (!photos.length) {
        return res.json({ error: 'Photos are required' });
      }
      if (!price) {
        return res.json({ error: 'Price is required' });
      }
      if (!type) {
        return res.json({ error: 'Is property hour or land?' });
      }
      if (!address) {
        return res.json({ error: 'Address is required' });
      }
      if (!description) {
        return res.json({ error: 'Description are required' });
      }

      const geo = await config.GOOGLE_GEOCODER.geocode(address);

      await ad.update({
        ...req.body,
        slug: ad.slug,
        location: {
          type: 'Point',
          coordinates: [geo?.[0]?.longitude, geo?.[0]?.latitude],
        },
      });

      res.json({ ok: true });
    }
  } catch (err) {
    console.log(err);
  }
};
export const update = async (req, res) => {
  try {
    const { photos, price, type, address, description } = req.body;
    const geo = await config.GOOGLE_GEOCODER.geocode(address);
    const ad = await Ad.findByIdAndUpdate(req.params._id, {
      ...req.body,
    //   slug: ad.slug,
      location: {
        type: 'Point',
        coordinates: [geo?.[0]?.longitude, geo?.[0]?.latitude],
      },
    });

    res.json({ ok: true, ad });
  } catch (err) {
    console.log(err);
  }
};
