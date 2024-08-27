import { useState } from "react";
import {
  Box,
  Button,
  Container,
  Heading,
  Input,
  Link,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
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
      setError("Please select a file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setOutputLink(result.fileUrl);
      } else {
        setError(result.error || "An error occurred during file upload.");
      }
    } catch (err) {
      console.error("Upload error:", err);
      setError("An unexpected error occurred.");
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
          <Box mb={4}>
            <Input
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileChange}
              id="file-upload"
              display="none"
            />
            <label htmlFor="file-upload">
              <Button
                as="span"
                colorScheme="teal"
                variant="outline"
                size="lg"
                width="full"
                cursor="pointer"
                _hover={{ bg: useColorModeValue("teal.100", "teal.700") }}
              >
                {file ? file.name : "Choose File"}
              </Button>
            </label>
          </Box>

          <Box display="flex" justifyContent="flex-end">
            <Button
              type="submit"
              colorScheme="teal"
              isLoading={uploading}
              disabled={uploading || !file}
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </Button>
          </Box>
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
}
