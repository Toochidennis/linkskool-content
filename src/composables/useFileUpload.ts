import Papa from 'papaparse';

/**
 * Get file format from filename extension
 * @param fileName - Name of the file
 * @returns File format (CSV, JSON, WORD, HTML, or raw extension)
 */
export const getFileFormat = (fileName: string): string => {
  const extension = fileName.split('.').pop()?.toUpperCase() || '';
  if (extension === 'CSV') return 'CSV';
  if (extension === 'JSON') return 'JSON';
  if (extension === 'DOC' || extension === 'DOCX') return 'WORD';
  if (extension === 'HTML' || extension === 'HTM') return 'HTML';
  return extension;
};

/**
 * Read and parse CSV file
 * @param file - CSV File object
 * @returns Promise resolving to parsed CSV data
 */
export const readCSVFile = (file: File): Promise<Array<Record<string, string>>> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
      encoding: 'utf-8',
      complete: (results) => {
        console.log('CSV Data:', results.data);
        resolve(results.data as Array<Record<string, string>>);
      },
      error: (error) => {
        reject(error);
      }
    });
  });
};

/**
 * Read HTML file
 * @param file - HTML File object
 * @returns Promise resolving to HTML content string
 */
export const readHTMLFile = (file: File): Promise<Array<Record<string, string>>> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const html = e.target?.result as string;

      if (!html) {
        reject(new Error("HTML file is empty"));
        return;
      }

      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");

      const tables = Array.from(doc.querySelectorAll("table"));
      const results: Array<Record<string, string>> = [];

      for (const table of tables) {
        const obj: Record<string, string> = {};
        const rows = Array.from(table.querySelectorAll("tr"));

        for (const tr of rows) {
          const cells = tr.querySelectorAll("td");
          if (cells.length !== 2) continue;

          const key = cells[0]?.textContent?.trim() || "";
          const valueCell = cells[1];
          const rawValue = valueCell?.textContent?.trim() || "";

          if (!key) continue;

          // Check for image explicitly
          const img = valueCell?.querySelector("img");
          if (img) {
            const src = img.getAttribute("src")?.split("/").pop() || "";
            obj[key] = src; // Strict mapping to the correct key
            continue;
          }

          obj[key] = rawValue;
        }

        if (Object.keys(obj).length > 0) {
          results.push(obj);
        }
      }

      console.log("Extracted HTML Data:", results);
      resolve(results);
    };

    reader.onerror = () => reject(new Error("Failed to read HTML file"));

    reader.readAsText(file, "utf-8");
  });
};

/**
 * Read and parse JSON file
 * @param file - JSON File object
 * @returns Promise resolving to parsed JSON data
 */
export const readJSONFile = (file: File): Promise<Array<Record<string, string>>> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        if (!Array.isArray(parsed)) {
          reject(new Error('JSON file must contain an array of records'));
          return;
        }

        const normalized = parsed.map((entry) => {
          if (typeof entry !== 'object' || entry === null) {
            throw new Error('JSON array contains invalid entries');
          }

          const record: Record<string, string> = {};
          Object.entries(entry).forEach(([key, value]) => {
            record[key] = value !== undefined && value !== null ? String(value) : '';
          });
          return record;
        });
        console.log('Normalized JSON Data:', normalized);

        resolve(normalized);
      } catch (error) {
        console.error('JSON parse error:', error);
        reject(error instanceof Error ? error : new Error('Invalid JSON file'));
      }
    };

    reader.onerror = () => reject(new Error('Failed to read JSON file'));

    reader.readAsText(file, 'utf-8');
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
