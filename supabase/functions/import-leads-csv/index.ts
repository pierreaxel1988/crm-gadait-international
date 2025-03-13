
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { parse as parseCSV } from "https://deno.land/std@0.168.0/encoding/csv.ts";
import * as XLSX from "https://esm.sh/xlsx@0.18.5";

// CORS headers for the function
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Response helper
const createResponse = (body: any, status = 200) => {
  return new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status,
  });
};

// Create a Supabase client
const createSupabaseClient = () => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  return createClient(supabaseUrl, supabaseServiceKey);
};

// Validate file type
const validateFileType = (fileName: string): "csv" | "excel" | null => {
  const extension = fileName.split(".").pop()?.toLowerCase();
  if (extension === "csv") return "csv";
  if (["xlsx", "xls"].includes(extension ?? "")) return "excel";
  return null;
};

// Parse CSV file
const parseCSVFile = async (file: File): Promise<Record<string, string>[]> => {
  const text = await file.text();
  const { rows } = parseCSV(text, { 
    skipFirstRow: true,
    columns: true
  });
  return rows as Record<string, string>[];
};

// Parse Excel file
const parseExcelFile = async (file: File): Promise<Record<string, string>[]> => {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer);
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  return XLSX.utils.sheet_to_json(worksheet);
};

// Map records to standard format
const mapRecords = (records: Record<string, string>[]): Record<string, any>[] => {
  return records.map(record => {
    // Convert property keys to lowercase for case-insensitive matching
    const normalizedRecord: Record<string, string> = {};
    Object.keys(record).forEach(key => {
      normalizedRecord[key.toLowerCase().trim()] = record[key];
    });

    // Map to standard field names
    return {
      name: normalizedRecord.name || normalizedRecord.nom || normalizedRecord.client || "",
      email: normalizedRecord.email || normalizedRecord.courriel || normalizedRecord["e-mail"] || "",
      phone: normalizedRecord.phone || normalizedRecord.telephone || normalizedRecord.tel || normalizedRecord.mobile || "",
      source: normalizedRecord.source || "",
      property_reference: normalizedRecord.property_reference || normalizedRecord.reference || normalizedRecord.ref || "",
      property_type: normalizedRecord.property_type || normalizedRecord.type || "",
      budget: normalizedRecord.budget || "",
      desired_location: normalizedRecord.desired_location || normalizedRecord.location || normalizedRecord.lieu || "",
      message: normalizedRecord.message || normalizedRecord.comments || normalizedRecord.commentaires || "",
      // Additional fields might be mapped here
    };
  }).filter(record => record.name && record.email); // Filter out records without name or email
};

// Process a single lead
const processLead = async (
  lead: Record<string, any>, 
  assignedTo: string, 
  sourceType: string,
  supabase: any
): Promise<{ status: string; id?: string; email?: string; message?: string }> => {
  try {
    // First check if lead already exists
    const { data: existingLeads, error: searchError } = await supabase
      .from("leads")
      .select("id, email, phone")
      .or(`email.eq.${lead.email}${lead.phone ? `,phone.eq.${lead.phone}` : ''}`);

    if (searchError) {
      console.error("Error searching for existing lead:", searchError);
      return { status: "error", message: searchError.message };
    }

    // If lead exists, it's a duplicate
    if (existingLeads && existingLeads.length > 0) {
      return { 
        status: "duplicate", 
        id: existingLeads[0].id,
        email: lead.email,
        message: `Lead with email ${lead.email} already exists`
      };
    }

    // Insert the new lead
    const { data, error: insertError } = await supabase
      .from("leads")
      .insert({
        ...lead,
        assigned_to: assignedTo || null,
        status: "new",
        integration_source: sourceType,
        imported_at: new Date().toISOString(),
      })
      .select();

    if (insertError) {
      console.error("Error inserting lead:", insertError);
      return { status: "error", message: insertError.message };
    }

    return { status: "created", id: data[0].id, email: lead.email };
  } catch (error) {
    console.error("Error processing lead:", error);
    return { status: "error", message: error.message };
  }
};

// Parse file data
const parseFileData = async (file: File): Promise<Record<string, any>[]> => {
  const fileType = validateFileType(file.name);
  
  if (fileType === "csv") {
    return mapRecords(await parseCSVFile(file));
  } else if (fileType === "excel") {
    return mapRecords(await parseExcelFile(file));
  }
  
  throw new Error("Unsupported file type");
};

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse the FormData from the request
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const assignedTo = formData.get("assigned_to") as string;
    const sourceType = formData.get("source_type") as string || "File Import";

    if (!file) {
      return createResponse({ error: "No file provided" }, 400);
    }

    const fileType = validateFileType(file.name);
    if (!fileType) {
      return createResponse({ error: "Unsupported file type" }, 400);
    }

    // Create Supabase client
    const supabase = createSupabaseClient();

    // Parse the file data
    const records = await parseFileData(file);

    if (records.length === 0) {
      return createResponse({ error: "No valid records found in the file" }, 400);
    }

    // Process each lead
    const results = {
      total: records.length,
      created: [] as any[],
      updated: [] as any[],
      duplicates: [] as any[],
      errors: [] as any[],
    };

    for (const lead of records) {
      const result = await processLead(lead, assignedTo, sourceType, supabase);

      if (result.status === "created") {
        results.created.push(result);
      } else if (result.status === "updated") {
        results.updated.push(result);
      } else if (result.status === "duplicate") {
        results.duplicates.push(result);
      } else {
        results.errors.push(result);
      }
    }

    // Save import statistics
    await supabase
      .from("import_statistics")
      .insert({
        source_type: sourceType,
        total_count: results.total,
        imported_count: results.created.length,
        updated_count: results.updated.length,
        error_count: results.errors.length,
        duplicates_count: results.duplicates.length,
        import_date: new Date().toISOString(),
      });

    // Return results
    return createResponse({
      success: true,
      totalCount: results.total,
      importedCount: results.created.length,
      updatedCount: results.updated.length,
      duplicatesCount: results.duplicates.length,
      errorCount: results.errors.length,
      duplicates: results.duplicates,
      errors: results.errors,
    });
  } catch (error) {
    console.error("Error processing import:", error);
    return createResponse({ error: error.message }, 500);
  }
});
