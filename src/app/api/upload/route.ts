import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const runtime = "nodejs";

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file") as File;

  if (!file) {
    console.log("No se envió ningún archivo");
    return NextResponse.json({ error: "No se envió ningún archivo" }, { status: 400 });
  }

  console.log("Archivo recibido:", file.name, file.type);
  const buffer = Buffer.from(await file.arrayBuffer());
  const base64 = buffer.toString("base64");
  const dataUri = `data:${file.type};base64,${base64}`;

  try {
    const result = await cloudinary.uploader.upload(dataUri, {
      folder: "estilo-urbano",
    });
    console.log("Resultado Cloudinary:", result);
    return NextResponse.json({ url: result.secure_url, public_id: result.public_id });
  } catch (error) {
    console.error("Error Cloudinary:", error);
    return NextResponse.json({ error: "Error al subir la imagen" }, { status: 500 });
  }
} 