import Resizer from 'react-image-file-resizer';
import axios from 'axios';
import { Avatar, Badge } from 'antd';
import { CloseCircleOutlined } from '@ant-design/icons';

export default function ImageUpload({ ad, setAd }) {
  const handleUpload = (e) => {
    let files = e.target.files;
    files = [...files];
    if (files?.length) {
      setAd({ ...ad, uploading: true });
      files.map((file) => {
        // upload
        new Promise((resolve) => {
          Resizer.imageFileResizer(
            file,
            1080,
            720,
            'JPEG',
            100,
            0,
            async (uri) => {
              console.log(uri, 'uri');
              try {
                const { data } = await axios.post('/upload-image', {
                  image: uri,
                });
                setAd((prev) => ({
                  ...prev,
                  photos: [data, ...prev.photos],
                  uploading: false,
                }));
              } catch (err) {
                console.log('photo upload err => ', err);
                setAd({ ...ad, uploading: false });
              }
            },
            'base64',
          );
        });
      });
    } else {
      setAd({ ...ad, uploading: false });
    }
  };

  const handleDelete = async (photo) => {
    const answer = window.confirm('Would you delete this photo?');
    if (!answer) return;
    setAd({ ...ad, removing: true });
    try {
      const { data } = await axios.post('/remove-image', photo);
      if (data?.ok) {
        setAd((prev) => ({
          ...prev,
          photos: prev.photos.filter((p) => p.Key !== photo.Key),
          removing: false,
        }));
      } else {
        setAd({ ...ad, removing: true });
      }
    } catch (err) {
      console.log(err);
      setAd({ ...ad, removing: false });
    }
  };

  return (
    <>
      <div className="d-flex mt-4 mb-2 ">
        <label className="btn btn-secondary mr-2">
          {ad.uploading ? 'Uploading...' : ad.removing ? 'Removing...' : 'Upload photos'}
          <input onChange={handleUpload} type="file" accept="image/*" multiple hidden />
        </label>

        {ad.photos?.map((file) => {
          return (
            <Badge
              key={file.Key}
              className="mx-1 pointer"
              count={<CloseCircleOutlined />}
              onClick={() => handleDelete(file)}>
              <Avatar src={file.Location} shape="square" size={46} />
            </Badge>
          );
        })}
      </div>
    </>
  );
}
