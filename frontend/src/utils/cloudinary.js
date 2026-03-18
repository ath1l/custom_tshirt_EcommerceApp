const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

function getUploadEndpoint() {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error('Cloudinary env vars are missing. Set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET.');
  }

  return `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
}

export async function uploadFileToCloudinary(file) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);

  const response = await fetch(getUploadEndpoint(), {
    method: 'POST',
    body: formData,
  });

  const data = await response.json().catch(() => null);
  if (!response.ok || !data?.secure_url) {
    throw new Error(data?.error?.message || 'Cloudinary upload failed');
  }

  return data.secure_url;
}

export async function uploadFilesToCloudinary(files) {
  const uploads = await Promise.all(Array.from(files).map((file) => uploadFileToCloudinary(file)));
  return uploads;
}
