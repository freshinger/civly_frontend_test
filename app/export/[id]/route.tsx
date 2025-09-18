'use server'
import { createClient } from "@/utils/supabase/server";
import { NextRequest } from "next/server";

async function generatePDF(url: string) {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getSession()
  if(error){
    throw error;
  }
  let browser;
  try {
    const isVercel = !!process.env.VERCEL_ENV;
    let puppeteer,launchOptions;
    launchOptions = {
        headless: true,
      };

    if (isVercel) {
      const chromium = (await import("@sparticuz/chromium")).default;
      puppeteer = await import("puppeteer-core");
      launchOptions = {
        headless: true,
        args: chromium.args,
        executablePath: await chromium.executablePath(),
      };
    } else {
      puppeteer = await import("puppeteer");
    }

    browser = await puppeteer.launch(launchOptions);
    const page = await browser.newPage();
    await page.setExtraHTTPHeaders({ 'Authorization': 'Bearer '+data.session?.access_token });
    await page.goto(url, { waitUntil: "networkidle0" });
    const pdfBuffer = await page.pdf({ format: "A4", printBackground: true});
    return pdfBuffer;
  } catch (error) {
    console.log(error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};

function typedArrayToBuffer(array: Uint8Array): ArrayBuffer {
    return array.buffer.slice(array.byteOffset, array.byteLength + array.byteOffset) as ArrayBuffer
}

export async function GET(_req: NextRequest, ctx: RouteContext<'/export/[id]'>
) {
  const { id } = await ctx.params;
  
  let host = _req.headers.get('host');
  if(host?.startsWith('localhost')){
    host = 'http://'+host;
  } else {
    host = 'https://'+host;
  }
  try {
    const pdfBuffer = await generatePDF(host+'/cv-preview/'+id);
    
    const newHeaders = new Headers()
    newHeaders.set('Content-Type', 'application/pdf');
    newHeaders.set('Content-Disposition', `attachment; filename=cv-${id}.pdf`);
    return new Response(typedArrayToBuffer(pdfBuffer), {headers: newHeaders});
  } catch (error) {
    return new Response(
      "An error occurred while generating the pdf.",
      { status: 500 }
    );
  }
}
