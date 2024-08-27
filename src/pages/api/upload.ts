import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";
import formidable, { File, IncomingForm } from "formidable";
import { parse } from "csv-parse/sync";
import { stringify } from "csv-stringify/sync";

// Disable Next.js built-in body parser for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const form = new IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Formidable error:", err);
      res.status(500).json({ error: "Error processing the file" });
      return;
    }

    const uploadedFile = getSingleFile(files.file);

    if (!uploadedFile) {
      res.status(400).json({ error: "No file uploaded" });
      return;
    }

    try {
      const data = fs.readFileSync(uploadedFile.filepath, "utf-8");

      const processedData = processData(data);

      const outputFileName = `output_${Date.now()}.csv`;
      const outputFilePath = path.join(process.cwd(), "public", outputFileName);

      fs.writeFileSync(outputFilePath, processedData);

      res.status(200).json({ fileUrl: `/${outputFileName}` });
    } catch (processingError) {
      console.error("Processing error:", processingError);
      res.status(500).json({ error: "Error processing the file" });
    }
  });
}

function getSingleFile(
  fileOrFiles: File | File[] | undefined
): File | undefined {
  if (Array.isArray(fileOrFiles)) {
    return fileOrFiles[0];
  } else {
    return fileOrFiles;
  }
}

function processData(data: string): string {
  const records: string[][] = parse(data, {
    columns: false,
    skip_empty_lines: true,
    relax_column_count: true, // This helps with inconsistent column counts
  });

  const rowStartIndex = 10;
  const columnStartIndex = 1;

  if (records.length < 7) {
    throw new Error("CSV does not have at least 7 rows.");
  }

  // Find the maximum number of columns across all rows
  const numColumns = Math.max(...records.map((row) => row.length));

  const sums: number[] = new Array(numColumns).fill(0);

  for (let i = rowStartIndex; i < records.length; i++) {
    const row = records[i];
    for (let j = columnStartIndex; j < numColumns; j++) {
      const value = parseFloat(row[j] || "0"); // Use '0' if cell is empty
      if (!isNaN(value)) {
        sums[j] += value;
      }
    }
  }
  const deviceNames = records[6].slice(columnStartIndex);

  const outputRecords: string[][] = [];
  outputRecords.push(['A/C Unit No.', 'Device Name', 'Sum']);

  // Append device names, sums, and their index
  for (let j = 0; j < deviceNames.length; j++) {
    outputRecords.push([(j + 1).toString(), deviceNames[j], sums[j + columnStartIndex].toString()]);
  }

  // Add start and end dates at the end
  outputRecords.push([]);
  outputRecords.push(['Start Date', records[8][0]]);
  outputRecords.push(['End Date', records[293][0]]);

  // Convert to CSV
  return stringify(outputRecords);
}
