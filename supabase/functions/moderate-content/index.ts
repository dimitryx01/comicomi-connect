
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ModerationRequest {
  admin_user_id: string;
  content_type: string; // 'post' | 'recipe' | 'comment' | 'shared_post' | 'restaurant' | 'recipe_comment' | 'shared_post_comment'
  content_id: string;
  report_ids: string[];
  action_type: string; // 'delete' | 'keep' | 'edit' | 'suspend_user_temp' | 'suspend_user_perm' | 'resolve' | 'restore'
  action_notes?: string;
  reason_code?: string | null;
}

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

async function isValidModerator(adminUserId: string): Promise<boolean> {
  const { data: user, error: userErr } = await supabase
    .from("admin_users")
    .select("id, is_active")
    .eq("id", adminUserId)
    .maybeSingle();

  if (userErr || !user || !user.is_active) return false;

  const { data: roles, error: rolesErr } = await supabase
    .from("admin_user_roles")
    .select("role")
    .eq("admin_user_id", adminUserId);

  if (rolesErr || !roles) return false;

  return roles.some((r) => ["admin_master", "moderador_contenido"].includes((r as any).role));
}

async function getContentSnapshot(content_type: string, content_id: string) {
  const { data, error } = await supabase.rpc("get_reported_content_details", {
    p_content_type: content_type,
    p_content_id: content_id,
  });
  if (error) {
    console.warn("get_reported_content_details failed", error.message);
  }
  return data ?? null;
}

async function getCurrentState(content_type: string, content_id: string) {
  switch (content_type) {
    case "post":
      return supabase.from("posts").select("id, is_public, is_reported, updated_at").eq("id", content_id).maybeSingle();
    case "recipe":
      return supabase.from("recipes").select("id, is_public, is_reported, updated_at").eq("id", content_id).maybeSingle();
    case "comment":
      return supabase.from("comments").select("id, content, updated_at").eq("id", content_id).maybeSingle();
    case "shared_post":
      return supabase.from("shared_posts").select("id, comment, updated_at").eq("id", content_id).maybeSingle();
    case "recipe_comment":
      return supabase.from("recipe_comments").select("id, content, updated_at").eq("id", content_id).maybeSingle();
    case "shared_post_comment":
      return supabase.from("shared_post_comments").select("id, content, updated_at").eq("id", content_id).maybeSingle();
    case "restaurant":
      return supabase.from("restaurants").select("id, name, updated_at").eq("id", content_id).maybeSingle();
    default:
      return { data: null, error: { message: `Unsupported content_type: ${content_type}` } } as any;
  }
}

async function softDeleteOrHardDelete(content_type: string, content_id: string) {
  // For posts/recipes, use is_reported = true (triggers will set is_public=false)
  switch (content_type) {
    case "post": {
      const { error } = await supabase
        .from("posts")
        .update({ is_reported: true, updated_at: new Date().toISOString() })
        .eq("id", content_id);
      if (error) throw error;
      return { changed: true, strategy: "soft" as const };
    }
    case "recipe": {
      const { error } = await supabase
        .from("recipes")
        .update({ is_reported: true, updated_at: new Date().toISOString() })
        .eq("id", content_id);
      if (error) throw error;
      return { changed: true, strategy: "soft" as const };
    }
    case "comment": {
      const { error } = await supabase.from("comments").delete().eq("id", content_id);
      if (error) throw error;
      return { changed: true, strategy: "hard" as const };
    }
    case "shared_post": {
      const { error } = await supabase.from("shared_posts").delete().eq("id", content_id);
      if (error) throw error;
      return { changed: true, strategy: "hard" as const };
    }
    case "recipe_comment": {
      const { error } = await supabase.from("recipe_comments").delete().eq("id", content_id);
      if (error) throw error;
      return { changed: true, strategy: "hard" as const };
    }
    case "shared_post_comment": {
      const { error } = await supabase.from("shared_post_comments").delete().eq("id", content_id);
      if (error) throw error;
      return { changed: true, strategy: "hard" as const };
    }
    default:
      throw new Error(`Unsupported content_type: ${content_type}`);
  }
}

async function restoreContent(content_type: string, content_id: string) {
  switch (content_type) {
    case "post": {
      const { error } = await supabase
        .from("posts")
        .update({ is_reported: false, updated_at: new Date().toISOString() })
        .eq("id", content_id);
      if (error) throw error;
      return { changed: true, strategy: "restore" as const };
    }
    case "recipe": {
      const { error } = await supabase
        .from("recipes")
        .update({ is_reported: false, updated_at: new Date().toISOString() })
        .eq("id", content_id);
      if (error) throw error;
      return { changed: true, strategy: "restore" as const };
    }
    // For hard-deleted types, we cannot restore
    default:
      throw new Error(`Restore not supported for content_type: ${content_type}`);
  }
}

async function clearReportedFlagIfApplicable(content_type: string, content_id: string) {
  if (content_type === "post") {
    const { error } = await supabase
      .from("posts")
      .update({ is_reported: false, updated_at: new Date().toISOString() })
      .eq("id", content_id);
    if (error) throw error;
  }
  if (content_type === "recipe") {
    const { error } = await supabase
      .from("recipes")
      .update({ is_reported: false, updated_at: new Date().toISOString() })
      .eq("id", content_id);
    if (error) throw error;
  }
}

async function resolveReports(report_ids: string[], notes: string) {
  if (!report_ids?.length) return;
  const { error } = await supabase
    .from("reports")
    .update({
      status: "resolved",
      resolved_at: new Date().toISOString(),
      admin_notes: notes,
    })
    .in("id", report_ids);
  if (error) throw error;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload = (await req.json()) as ModerationRequest;

    if (!payload?.admin_user_id) {
      return new Response(JSON.stringify({ error: "admin_user_id requerido" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const isModerator = await isValidModerator(payload.admin_user_id);
    if (!isModerator) {
      return new Response(JSON.stringify({ error: "No autorizado" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 403,
      });
    }

    const actionType = payload.action_type;
    const actionNotes = payload.action_notes || "";
    const reasonCode = payload.reason_code || null;

    // Snapshot and previous state
    const snapshot = await getContentSnapshot(payload.content_type, payload.content_id);
    const { data: prevState, error: prevErr } = await getCurrentState(payload.content_type, payload.content_id);
    if (prevErr) {
      console.warn("Prev state fetch failed", prevErr);
    }

    let effect: any = { changed: false };

    if (actionType === "delete") {
      effect = await softDeleteOrHardDelete(payload.content_type, payload.content_id);
    }

    if (actionType === "restore") {
      effect = await restoreContent(payload.content_type, payload.content_id);
    }

    if (actionType === "keep") {
      // Clear the reported flag if it's a post/recipe
      await clearReportedFlagIfApplicable(payload.content_type, payload.content_id);
      effect = { changed: true, strategy: "keep" };
    }

    if (["resolve", "keep", "delete", "restore"].includes(actionType)) {
      await resolveReports(payload.report_ids || [], `Acción tomada: ${actionType}. ${actionNotes}`);
    }

    // Fetch new state after applying action
    const { data: newState, error: newErr } = await getCurrentState(payload.content_type, payload.content_id);
    if (newErr) {
      console.warn("New state fetch failed", newErr);
    }

    // Create moderation action record with detailed audit
    const { data: modAction, error: modErr } = await supabase
      .from("moderation_actions")
      .insert({
        report_ids: payload.report_ids || [],
        content_id: payload.content_id,
        content_type: payload.content_type,
        admin_user_id: payload.admin_user_id,
        action_type: actionType,
        action_notes: actionNotes || null,
        content_snapshot: snapshot || null,
        author_id: (snapshot && (snapshot as any).author?.id) || null,
        reason_code: reasonCode,
        previous_state: prevState ? prevState : null,
        new_state: newState ? newState : null,
      })
      .select()
      .single();

    if (modErr) throw modErr;

    // Log admin action (best-effort)
    const _ = await supabase.rpc("log_admin_action", {
      p_admin_user_id: payload.admin_user_id,
      p_action: `MODERATION_${actionType.toUpperCase()}`,
      p_target_type: payload.content_type,
      p_target_id: payload.content_id,
      p_details: { report_count: payload.report_ids?.length || 0, action_notes: actionNotes, reason_code: reasonCode },
    });

    // Notify author on delete (best-effort)
    try {
      const authorId = (snapshot as any)?.author?.id;
      if (authorId && actionType === "delete") {
        await supabase.rpc("create_notification", {
          p_user_id: authorId,
          p_actor_id: payload.admin_user_id,
          p_type: "CONTENT_MODERATION_DELETE",
          p_related_entity_type: payload.content_type,
          p_related_entity_id: payload.content_id,
          p_message:
            "Tu contenido fue ocultado por infringir nuestras políticas. Revisa las normas para evitar sanciones.",
        });
      }
    } catch (e) {
      console.warn("Notification creation failed", e);
    }

    return new Response(JSON.stringify({ success: true, action: modAction, effect }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Moderation error", err);
    return new Response(JSON.stringify({ error: (err as any)?.message || "Internal error" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
