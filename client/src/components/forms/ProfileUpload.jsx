import Resizer from 'react-image-file-resizer';
import axios from 'axios';
import { Avatar, Badge } from 'antd';
import { CloseCircleOutlined } from '@ant-design/icons';
import { useAuth } from '../../context/auth';

export default function ProfileUpload({ photo, setPhoto, uploading, setUploading }) {
  const [auth, setAuth] = useAuth();

  const handleUpload = async (e) => {
    try {
      let file = e.target.files[0];
      if (file) {
        setUploading(true);
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
                setPhoto(data);
                setUploading(false);
              } catch (err) {
                console.log('photo upload err => ', err);
                setUploading(false);
              }
            },
            'base64',
          );
        });
      }
    } catch (error) {
      setUploading(false);
    }
  };

  const handleDelete = async (photo) => {
    const answer = window.confirm('Would you delete this photo?');
    if (!answer) return;
    setUploading(true);
    try {
      const { data } = await axios.post('/remove-image', photo);
      if (data?.ok) {
        setPhoto(null);
        setUploading(false);
      }
    } catch (err) {
      console.log(err);
      setUploading(false);
    }
  };

  return (
    <>
      <div className="mt-4 mb-2 ">
        <label className="btn btn-secondary mr-2">
          {uploading ? 'Uploading...' : 'Upload photos'}
          <input onChange={handleUpload} type="file" accept="image/*" hidden />
        </label>

        {photo?.Location ? (
          <Avatar
            src={photo.Location}
            className="ml-2 mb-4 mt-3 pointer"
            key={photo.Key}
            shape="square"
            size={46}
          />
        ) : (
          ''
        )}
      </div>
    </>
  );
}
