
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { parse as csvParse } from "https://deno.land/std@0.168.0/encoding/csv.ts";
import { read, utils } from "https://esm.sh/xlsx@0.18.5";

// CORS headers for API requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Create supabase client with environment variables
function createSupabaseClient() {
  const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing environment variables");
  }

  return createClient(supabaseUrl, supabaseServiceKey);
}

// Create a response with appropriate headers
function createResponse(body: any, status: number) {
  return new Response(
    JSON.stringify(body),
    {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
}

// Validate file type (CSV or Excel)
function validateFileType(fileName: string): boolean {
  const lowercaseName = fileName.toLowerCase();
  return lowercaseName.endsWith('.csv') || 
         lowercaseName.endsWith('.xlsx') || 
         lowercaseName.endsWith('.xls');
}

// Parse CSV file
async function parseCSVFile(file: File): Promise<Record<string, any>[]> {
  const text = await file.text();
  // Parse CSV with encoding/csv API
  const parsed = await csvParse(text, {
    skipFirstRow: false,
    columns: true
  });
  return parsed;
}

// Parse Excel file
async function parseExcelFile(file: File): Promise<Record<string, any>[]> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = read(arrayBuffer, { type: 'array' });
  
  // Get the first sheet
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  
  // Convert to JSON with header row
  return utils.sheet_to_json(worksheet);
}

// Map records from file to our database schema
function mapRecords(records: Record<string, any>[], assignedTo: string): Record<string, any>[] {
  return records.map(record => {
    // Create a standardized object that maps to our schema
    return {
      name: record.name || record.fullname || record.full_name || record.nom || record['nom complet'] || '',
      email: record.email || record.mail || record.courriel || record['e-mail'] || '',
      phone: record.phone || record.telephone || record.tel || record.mobile || record.portable || '',
      property_reference: record.property_reference || record.reference || record.ref || '',
      source: record.source || record.canal || record.provenance || 'Import CSV',
      message: record.message || record.notes || record.commentaire || '',
      location: record.location || record.ville || record.city || '',
      desired_location: record.desired_location || record.location_search || record.localisation || '',
      budget: record.budget || '',
      property_type: record.property_type || record.type || '',
      living_area: record.living_area || record.surface || record.area || '',
      bedrooms: record.bedrooms || record.chambres || '',
      country: record.country || record.pays || '',
      assigned_to: record.assigned_to || record.agent || assignedTo || '',
      status: record.status || 'New',
      external_id: record.external_id || record.id || '',
      integration_source: 'CSV Import ' + new Date().toISOString().split('T')[0],
    };
  });
}

// Process a single lead using the import-lead function
async function processLead(supabase: any, lead: Record<string, any>, results: any): Promise<void> {
  try {
    // Skip records without name or email
    if (!lead.name && !lead.email) {
      results.errorCount++;
      results.errors.push(`Record missing both name and email: ${JSON.stringify(lead)}`);
      return;
    }

    // Add required flags for the import-lead function
    const leadData = {
      ...lead,
      integration_source: 'CSV Import'
    };

    // Call the import-lead function for each record
    const { data, error } = await supabase.functions.invoke('import-lead', {
      body: leadData
    });

    if (error) {
      results.errorCount++;
      results.errors.push(`Error importing ${lead.name || lead.email}: ${error.message}`);
    } else {
      if (data.isNew) {
        results.importedCount++;
      } else {
        results.updatedCount++;
      }
      results.imports.push(data.data);
    }
  } catch (err) {
    results.errorCount++;
    results.errors.push(`Error processing ${lead.name || lead.email}: ${err.message}`);
  }
}

// Parse data from the uploaded file
async function parseFileData(file: File): Promise<Record<string, any>[]> {
  const fileName = file.name.toLowerCase();
  
  if (fileName.endsWith('.csv')) {
    return await parseCSVFile(file);
  } else {
    return await parseExcelFile(file);
  }
}

// Main server function
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Create supabase client
    const supabase = createSupabaseClient();

    // Only process POST requests for file uploads
    if (req.method !== "POST") {
      return createResponse({
        success: false,
        error: "Method not allowed",
      }, 405);
    }

    // Parse form data
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const assignedTo = formData.get("assigned_to") as string;

    if (!file) {
      return createResponse({
        success: false,
        error: "No file provided",
      }, 400);
    }

    // Validate file type
    if (!validateFileType(file.name)) {
      return createResponse({
        success: false,
        error: "Unsupported file format. Please upload a CSV or Excel file.",
      }, 400);
    }

    // Process the file
    const records = await parseFileData(file);
    
    if (!records.length) {
      return createResponse({
        success: false,
        error: "The file contains no data",
      }, 400);
    }

    // Map fields from the file to our database schema
    const mappedRecords = mapRecords(records, assignedTo);

    // Initialize results object
    const results = {
      totalCount: mappedRecords.length,
      importedCount: 0,
      updatedCount: 0,
      errorCount: 0,
      errors: [] as string[],
      imports: [] as any[]
    };

    // Process each lead
    for (const lead of mappedRecords) {
      await processLead(supabase, lead, results);
    }

    // Return results
    return createResponse({
      success: true,
      ...results,
      message: `Processed ${results.totalCount} leads: ${results.importedCount} imported, ${results.updatedCount} updated, ${results.errorCount} errors`
    }, 200);
    
  } catch (error) {
    console.error("Error processing request:", error);
    
    return createResponse({
      success: false,
      error: `Server error: ${error.message}`,
    }, 500);
  }
});
