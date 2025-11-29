/**
 * Composable for handling file upload operations
 * Includes CSV parsing, ZIP extraction, and file format detection
 */

/**
 * Parse a CSV line handling quoted values and escaped quotes
 * @param line - CSV line to parse
 * @returns Array of parsed values
 */
export const parseCSVLine = (line: string): string[] => {
  const result: string[] = [];
  let current = '';
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        // Handle escaped quotes
        current += '"';
        i++;
      } else {
        // Toggle quote state
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      // End of field
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  // Add the last field
  result.push(current.trim());

  return result;
};

/**
 * Get file format from filename extension
 * @param fileName - Name of the file
 * @returns File format (CSV, JSON, WORD, or raw extension)
 */
export const getFileFormat = (fileName: string): string => {
  const extension = fileName.split('.').pop()?.toUpperCase() || '';
  if (extension === 'CSV') return 'CSV';
  if (extension === 'JSON') return 'JSON';
  if (extension === 'DOC' || extension === 'DOCX') return 'WORD';
  return extension;
};

/**
 * Read and parse CSV file
 * @param file - CSV File object
 * @returns Promise resolving to parsed CSV data
 */
export const readCSVFile = (file: File): Promise<Array<Record<string, string>>> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const lines = content
          .split('\n')
          .map(line => line.trim())
          .filter(line => line.length > 0);

        if (lines.length < 2) {
          reject(new Error('CSV file must have headers and at least one data row'));
          return;
        }

        // Parse CSV headers (first row)
        const headers = parseCSVLine(lines[0] || '');

        // Parse CSV data rows
        const data: Array<Record<string, string>> = [];
        for (let i = 1; i < lines.length; i++) {
          const values = parseCSVLine(lines[i] || '');
          const row: Record<string, string> = {};

          headers.forEach((header, index) => {
            row[header] = values[index] || '';
          });

          data.push(row);
        }

        console.log(`CSV file parsed: ${data.length} rows, ${headers.length} columns`);
        console.log('CSV Headers:', headers);
        console.log('CSV Data:', data);

        resolve(data);
      } catch (error) {
        console.error('Error parsing CSV file:', error);
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read CSV file'));
    };

    reader.readAsText(file);
  });
};

/**
 * Extract images from ZIP file
 * @param zipFile - ZIP File object
 * @returns Promise resolving to array of extracted images with base64 data
 */
export const extractImagesFromZip = async (
  zipFile: File
): Promise<Array<{ name: string; data: string; type: string }>> => {
  try {
    // Import JSZip dynamically
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();
    const content = await zip.loadAsync(zipFile);

    const images: Array<{ name: string; data: string; type: string }> = [];
    const allowedExtensions = ['jpg', 'jpeg', 'png'];
    const fileReaderPromises: Promise<void>[] = [];

    // Iterate through all files in the ZIP
    for (const [fileName, file] of Object.entries(content.files)) {
      if (!file.dir) {
        const ext = fileName.split('.').pop()?.toLowerCase() || '';

        // Check if it's an allowed image file
        if (allowedExtensions.includes(ext)) {
          try {
            const fileReaderPromise = new Promise<void>(async (resolve, reject) => {
              try {
                const fileData = await file.async('arraybuffer');
                const blob = new Blob([fileData], {
                  type: `image/${ext === 'jpg' ? 'jpeg' : ext}`
                });
                const reader = new FileReader();

                reader.onload = (e) => {
                  const dataUrl = e.target?.result as string;
                  images.push({
                    name: fileName,
                    data: dataUrl,
                    type: `image/${ext === 'jpg' ? 'jpeg' : ext}`
                  });
                  resolve();
                };

                reader.onerror = () => {
                  console.error(`Error reading image ${fileName}`);
                  reject(new Error(`Failed to read ${fileName}`));
                };

                reader.readAsDataURL(blob);
              } catch (error) {
                console.error(`Error extracting image ${fileName}:`, error);
                reject(error);
              }
            });

            fileReaderPromises.push(fileReaderPromise);
          } catch (error) {
            console.error(`Error extracting image ${fileName}:`, error);
          }
        }
      }
    }

    // Wait for all FileReader operations to complete
    await Promise.all(fileReaderPromises);

    console.log(`Extracted ${images.length} images from ZIP file`);
    return images;
  } catch (error) {
    console.error('Error extracting ZIP file:', error);
    throw error;
  }
};
