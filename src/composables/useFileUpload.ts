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
        // console.log('CSV Data:', results.data);
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

      // console.log("Extracted HTML Data:", results);
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
        // console.log('Normalized JSON Data:', normalized);

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

    // console.log(`Extracted ${images.length} images from ZIP file`);
    return images;
  } catch (error) {
    console.error('Error extracting ZIP file:', error);
    throw error;
  }
};

/**
 * Extract images and data files from a ZIP for validation purposes.
 * Returns images plus any data-file entries (csv, json, html, htm, docx)
 */
export const extractZipForValidation = async (
  zipFile: File
): Promise<{
  images: Array<{ name: string; data: string; type: string }>;
  dataFiles: Array<{ name: string; blob: Blob }>
}> => {
  const JSZip = (await import('jszip')).default;
  const zip = new JSZip();
  const content = await zip.loadAsync(zipFile);

  const images: Array<{ name: string; data: string; type: string }> = [];
  const dataFiles: Array<{ name: string; blob: Blob }> = [];
  const allowedImageExt = ['jpg', 'jpeg', 'png'];
  const allowedDataExt = ['csv', 'json', 'html', 'htm', 'docx'];

  const filePromises: Promise<void>[] = [];

  for (const [fileName, file] of Object.entries(content.files)) {
    if (file.dir) continue;
    const ext = fileName.split('.').pop()?.toLowerCase() || '';

    if (allowedImageExt.includes(ext)) {
      const p = (async () => {
        const fileData = await file.async('arraybuffer');
        const blob = new Blob([fileData], { type: `image/${ext === 'jpg' ? 'jpeg' : ext}` });
        const reader = new FileReader();
        await new Promise<void>((resolve, reject) => {
          reader.onload = () => {
            images.push({ name: fileName, data: reader.result as string, type: blob.type });
            resolve();
          };
          reader.onerror = () => reject(new Error('Failed to read image from zip'));
          reader.readAsDataURL(blob);
        });
      })();
      filePromises.push(p as Promise<void>);
    }

    if (allowedDataExt.includes(ext)) {
      const p = (async () => {
        const fileData = await file.async('blob');
        dataFiles.push({ name: fileName, blob: fileData });
      })();
      filePromises.push(p as Promise<void>);
    }
  }

  await Promise.all(filePromises);

  return { images, dataFiles };
};


export const readDocxFile = async (
  file: File
): Promise<{
  data: Array<Record<string, string>>;
  images: { filename: string; data: string; type: string }[];
}> => {
  const arrayBuffer = await file.arrayBuffer();
  const zip = await (await import("jszip")).default.loadAsync(arrayBuffer);
  const images: { filename: string; data: string; type: string }[] = [];

  // Extract all image binaries as Base64 data URLs
  const imageFiles = Object.keys(zip.files).filter(path => path.startsWith("word/media/"));
  for (const path of imageFiles) {
    const fileName = path.replace("word/media/", "");
    const blob = await zip.file(path)!.async("blob");
    const dataUrl = await blobToDataURL(blob);
    const ext = fileName.split(".").pop()?.toLowerCase() || "png";
    images.push({
      filename: fileName,
      data: dataUrl,
      type: `image/${ext === "jpg" ? "jpeg" : ext}`,
    });
  }

  // Parse document.xml
  const documentXml = await zip.file("word/document.xml")!.async("text");
  const parser = new DOMParser();
  const xml = parser.parseFromString(documentXml, "application/xml");

  // Load relationships
  const relsXml = await zip.file("word/_rels/document.xml.rels")!.async("text");
  const relsDoc = parser.parseFromString(relsXml, "application/xml");

  const tables = Array.from(xml.getElementsByTagName("w:tbl"));
  const data: Array<Record<string, string>> = [];

  for (const tbl of tables) {
    const obj: Record<string, string> = {};
    const rows = Array.from(tbl.getElementsByTagName("w:tr"));

    for (const row of rows) {
      const cells = Array.from(row.getElementsByTagName("w:tc"));
      if (cells.length !== 2) continue;

      const keyCell = cells[0];
      const valueCell = cells[1];
      if (!keyCell || !valueCell) continue;

      const key = extractTextOrFormula(keyCell);
      let value = extractTextOrFormula(valueCell);

      // Check if value cell contains an image
      const drawing = valueCell.querySelector("w\\:drawing a\\:blip");
      if (drawing) {
        const embed = drawing.getAttribute("r:embed");
        if (embed) {
          const rel = relsDoc.querySelector(`Relationship[Id="${embed}"]`);
          const target = rel?.getAttribute("Target");
          if (target) {
            const imageName = target.split("/").pop() || "";
            value = imageName; // store image filename
          }
        }
      }

      if (key) obj[key] = value;
    }

    if (Object.keys(obj).length > 0) data.push(obj);
  }

  return { data, images };

  function extractTextOrFormula(cell: Element): string {
    const omml = cell.getElementsByTagName("m:oMath")[0];
    if (omml) {
      try {
        //const mathML = convert(omml.outerHTML); // OMML → MathML
        //const latex = toLatex.convert(mathML);           // MathML → LaTeX
        return omml.outerHTML.trim();
      } catch {
        // Fallback to plain text if conversion fails
        const texts = Array.from(omml.getElementsByTagName("m:t"));
        return texts.map(t => t.textContent?.trim() || "").join(" ");
      }
    }
    // Regular text
    const texts = Array.from(cell.getElementsByTagName("w:t"));
    return texts.map(t => t.textContent?.trim() || "").join(" ");
  }

  function blobToDataURL(blob: Blob): Promise<string> {
    return new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  }
};
