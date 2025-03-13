
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { parse as csvParse } from "https://deno.land/std@0.179.0/csv/parse.ts";
import { read, utils } from "https://esm.sh/xlsx@0.18.5";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get environment variables
    const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing environment variables");
    }

    // Create supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Only process POST requests for file uploads
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Method not allowed",
        }),
        {
          status: 405,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Parse form data
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const assignedTo = formData.get("assigned_to") as string;

    if (!file) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "No file provided",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Validate file type
    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith('.csv') && !fileName.endsWith('.xlsx') && !fileName.endsWith('.xls')) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Unsupported file format. Please upload a CSV or Excel file.",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Process the file
    let records: Record<string, any>[] = [];
    
    if (fileName.endsWith('.csv')) {
      // Parse CSV file
      const text = await file.text();
      const parsed = csvParse(text, { skipFirstRow: true, columns: true });
      records = parsed;
    } else {
      // Parse Excel file
      const arrayBuffer = await file.arrayBuffer();
      const workbook = read(arrayBuffer, { type: 'array' });
      
      // Get the first sheet
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      
      // Convert to JSON with header row
      records = utils.sheet_to_json(worksheet);
    }
    
    if (!records.length) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "The file contains no data",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Map fields from the file to our database schema
    const mappedRecords = records.map(record => {
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

    // Import leads using existing import function
    const results = {
      totalCount: mappedRecords.length,
      importedCount: 0,
      updatedCount: 0,
      errorCount: 0,
      errors: [] as string[],
      imports: [] as any[]
    };

    for (const lead of mappedRecords) {
      try {
        // Skip records without name or email
        if (!lead.name && !lead.email) {
          results.errorCount++;
          results.errors.push(`Record missing both name and email: ${JSON.stringify(lead)}`);
          continue;
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

    return new Response(
      JSON.stringify({
        success: true,
        ...results,
        message: `Processed ${results.totalCount} leads: ${results.importedCount} imported, ${results.updatedCount} updated, ${results.errorCount} errors`
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
    
  } catch (error) {
    console.error("Error processing request:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: `Server error: ${error.message}`,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
