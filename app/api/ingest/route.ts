import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { openaiServer } from "@/lib/openai-server";
import { chunkText, extractText } from "@/lib/ingest";

export const runtime = "nodejs"; 

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }

    // 1) Extract text
    const text = await extractText(file);
    if (!text) {
      return NextResponse.json(
        { error: "No extractable text found in file" },
        { status: 400 }
      );
    }

    // 2) Chunk
    const chunks = chunkText(text);
    if (chunks.length === 0) {
      return NextResponse.json({ error: "No chunks created" }, { status: 400 });
    }

    // 3) Insert document
    const sb = supabaseServer();
    const { data: doc, error: docErr } = await sb
      .from("documents")
      .insert({
        filename: file.name,
        mime_type: file.type || "unknown",
      })
      .select()
      .single();

    if (docErr || !doc) {
      return NextResponse.json(
        { error: "Failed to create document", details: docErr?.message },
        { status: 500 }
      );
    }

    // 4) Embed + insert chunks (batch)
    const oa = openaiServer();

    // embeddings API supports batching inputs
    const emb = await oa.embeddings.create({
      model: "text-embedding-3-small",
      input: chunks,
    });

    // text-embedding-3-small is 1536 dims
    const rows = chunks.map((content, i) => ({
      document_id: doc.id,
      chunk_index: i,
      content,
      embedding: emb.data[i].embedding,
    }));

    const { error: chunkErr } = await sb.from("chunks").insert(rows);

    if (chunkErr) {
      return NextResponse.json(
        { error: "Failed to insert chunks", details: chunkErr.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      document: { id: doc.id, filename: doc.filename },
      chunksInserted: rows.length,
    });
  } catch (err: unknown) {
     const message =
        err instanceof Error ? err.message : String(err);

     return NextResponse.json(
        { error: "Ingest failed", details: message },
        { status: 500 }
    );
  }

}
