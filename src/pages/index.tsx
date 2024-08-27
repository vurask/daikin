import { useState } from 'react';
import {
  Box,
  Button,
  Container,
  Heading,
  Input,
  Link,
  Text,
} from '@chakra-ui/react';
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
      <Container mt={10}>
      <Box p={8} borderWidth="1px" borderRadius="lg">
        <Heading as="h1" size="lg" mb={6}>
          Upload and Process CSV File
        </Heading>
        <Box as="form" onSubmit={handleSubmit}>
          <Input
            type="file"
            accept=".csv,text/csv"
            onChange={handleFileChange}
            mb={4}
          />
          <Button type="submit" colorScheme="teal" isLoading={uploading} disabled={uploading} width="full">
            {uploading ? 'Uploading...' : 'Upload'}
          </Button>
        </Box>

        {error && (
          <Text color="red.500" mt={4}>
            {error}
          </Text>
        )}

        {outputLink && (
          <Box mt={4}>
            <Link href={outputLink} download color="teal.500">
              Download Processed File
            </Link>
          </Box>
        )}
      </Box>
    </Container>
  );
    // <div style={{ padding: '2rem' }}>
    //   <h1>Upload and Process CSV File</h1>
    //   <form onSubmit={handleSubmit}>
    //     <input type="file" accept=".csv,text/csv" onChange={handleFileChange} />
    //     <button type="submit" disabled={uploading}>
    //       {uploading ? 'Uploading...' : 'Upload'}
    //     </button>
    //   </form>

    //   {error && <p style={{ color: 'red' }}>{error}</p>}

    //   {outputLink && (
    //     <div style={{ marginTop: '1rem' }}>
    //       <a href={outputLink} download>
    //         Download Processed File
    //       </a>
    //     </div>
    //   )}
    // </div>
}
