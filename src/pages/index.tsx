import { useState } from 'react';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [outputLink, setOutputLink] = useState<string | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
    } else {
      setFile(null);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setOutputLink(null);

    if (!file) {
      setError('Please select a file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setOutputLink(result.fileUrl);
      } else {
        setError(result.error || 'An error occurred during file upload.');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError('An unexpected error occurred.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Upload and Process CSV File</h1>
      <form onSubmit={handleSubmit}>
        <input type="file" accept=".csv,text/csv" onChange={handleFileChange} />
        <button type="submit" disabled={uploading}>
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {outputLink && (
        <div style={{ marginTop: '1rem' }}>
          <a href={outputLink} download>
            Download Processed File
          </a>
        </div>
      )}
    </div>
  );
}
