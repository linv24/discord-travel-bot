import { readFile } from "fs/promises";
import Tesseract from "tesseract.js"; 
import path from "path";
import { parseItineraryOCR } from "../src/discord/lib/parse-itinerary";

async function runOCR() {
    try {
        const imagePath = process.argv[2];
        if (!imagePath) throw new Error("Please pass a path to an image file.");
        
        const buffer = await readFile(imagePath)
        console.log(`Running OCR on: ${imagePath}`);

        const result = await Tesseract.recognize(buffer, "eng");
        const parsed = parseItineraryOCR(result.data.text);
        console.log("Parsed flight ifno:");
        console.dir(parsed, {depth: null });
    } catch (err) {
        console.error("Failed to run OCR:", err);
    }
}

runOCR();