import fs from 'fs/promises';
import path from 'path';

const repoRoot = process.cwd();
const frontendEnvPath = path.join(repoRoot, 'frontend', '.env');
const apparelRoot = path.join(repoRoot, 'frontend', 'public', 'apparel');
const manifestPath = path.join(repoRoot, 'cloudinary-apparel-manifest.json');

function parseEnvFile(content) {
  return Object.fromEntries(
    content
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#'))
      .map((line) => {
        const separatorIndex = line.indexOf('=');
        return [line.slice(0, separatorIndex), line.slice(separatorIndex + 1)];
      }),
  );
}

async function walkFiles(rootDir) {
  const entries = await fs.readdir(rootDir, { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => {
    const fullPath = path.join(rootDir, entry.name);
    if (entry.isDirectory()) {
      return walkFiles(fullPath);
    }
    return [fullPath];
  }));

  return files.flat();
}

async function uploadFile(filePath, cloudName, uploadPreset) {
  const fileBuffer = await fs.readFile(filePath);
  const formData = new FormData();
  const extension = path.extname(filePath) || '.png';
  const relativePath = path.relative(apparelRoot, filePath).replace(/\\/g, '/');
  const publicId = `custome/${relativePath.replace(extension, '')}`;

  formData.append('file', new Blob([fileBuffer]), path.basename(filePath));
  formData.append('upload_preset', uploadPreset);
  formData.append('public_id', publicId);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: formData,
  });

  const data = await response.json().catch(() => null);
  if (!response.ok || !data?.secure_url) {
    throw new Error(`${relativePath}: ${data?.error?.message || 'Upload failed'}`);
  }

  return {
    localPath: relativePath,
    cloudinaryUrl: data.secure_url,
    publicId: data.public_id,
  };
}

async function main() {
  const envContent = await fs.readFile(frontendEnvPath, 'utf8');
  const env = parseEnvFile(envContent);
  const cloudName = env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = env.VITE_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error('Missing Cloudinary values in frontend/.env');
  }

  const files = await walkFiles(apparelRoot);
  const imageFiles = files.filter((file) => /\.(png|jpe?g|webp)$/i.test(file));
  const manifest = [];

  for (const filePath of imageFiles) {
    const uploaded = await uploadFile(filePath, cloudName, uploadPreset);
    manifest.push(uploaded);
    console.log(`UPLOADED ${uploaded.localPath}`);
  }

  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`DONE ${manifest.length} files`);
  console.log(`MANIFEST ${manifestPath}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
