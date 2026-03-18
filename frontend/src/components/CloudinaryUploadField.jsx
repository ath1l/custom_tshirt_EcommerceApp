import { useState } from 'react';
import { uploadFileToCloudinary, uploadFilesToCloudinary } from '../utils/cloudinary';

function CloudinaryUploadField({ label, multiple = false, onUploaded }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) {
      return;
    }

    setUploading(true);
    setError('');

    try {
      if (multiple) {
        const urls = await uploadFilesToCloudinary(files);
        onUploaded(urls);
      } else {
        const url = await uploadFileToCloudinary(files[0]);
        onUploaded(url);
      }
    } catch (err) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  return (
    <div className="admin-form__field">
      <label>{label}</label>
      <input type="file" accept="image/*" multiple={multiple} onChange={handleChange} />
      {uploading && <small className="admin-form__hint">Uploading to Cloudinary...</small>}
      {error && <small className="admin-message admin-message--error">{error}</small>}
    </div>
  );
}

export default CloudinaryUploadField;
