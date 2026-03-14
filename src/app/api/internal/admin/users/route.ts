import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error("Missing Supabase admin environment variables");
  }
  return createClient(url, serviceKey);
}

async function verifyAdmin(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_session")?.value;
    if (!token) return false;
    const decoded = JSON.parse(Buffer.from(token, "base64").toString("utf-8"));
    if (decoded.role !== "admin") return false;
    if (Date.now() > decoded.exp) return false;
    return true;
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
  const search = searchParams.get("search")?.trim() || "";
  const offset = (page - 1) * limit;

  const supabase = getSupabaseAdmin();

  // Get total count of auth users
  const { data: authData, error: authError } =
    await supabase.auth.admin.listUsers({ page, perPage: limit });

  if (authError) {
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }

  const authUsers = authData.users || [];
  const totalUsers = authData.total || 0;

  // Get matching profiles and wallets
  const userIds = authUsers.map((u) => u.id);

  const [profilesResult, walletsResult] = await Promise.all([
    supabase
      .from("user_profiles")
      .select("user_id, full_name, phone_number, status")
      .in("user_id", userIds),
    supabase
      .from("token_wallets")
      .select("user_id, balance_tokens, is_frozen")
      .in("user_id", userIds),
  ]);

  const profileMap = new Map(
    (profilesResult.data || []).map((p) => [p.user_id, p])
  );
  const walletMap = new Map(
    (walletsResult.data || []).map((w) => [w.user_id, w])
  );

  let users = authUsers.map((u) => {
    const profile = profileMap.get(u.id);
    const wallet = walletMap.get(u.id);
    return {
      id: u.id,
      email: u.email || "",
      full_name: profile?.full_name || "",
      phone_number: profile?.phone_number || "",
      status: profile?.status || "active",
      balance_tokens: wallet?.balance_tokens ?? 0,
      is_frozen: wallet?.is_frozen ?? false,
      created_at: u.created_at,
      last_sign_in_at: u.last_sign_in_at || null,
    };
  });

  // Client-side search filter (auth.admin.listUsers doesn't support search)
  if (search) {
    const lower = search.toLowerCase();
    users = users.filter(
      (u) =>
        u.email.toLowerCase().includes(lower) ||
        u.full_name.toLowerCase().includes(lower)
    );
  }

  return NextResponse.json({
    users,
    total: totalUsers,
    page,
    limit,
    totalPages: Math.ceil(totalUsers / limit),
  });
}

export async function PUT(request: NextRequest) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { action, userId } = body;

  if (!userId || !action) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  switch (action) {
    case "suspend": {
      const { error } = await supabase
        .from("user_profiles")
        .update({ status: "suspended" })
        .eq("user_id", userId);
      if (error) {
        return NextResponse.json({ error: "Failed to suspend user" }, { status: 500 });
      }
      return NextResponse.json({ success: true, message: "User suspended" });
    }

    case "activate": {
      const { error } = await supabase
        .from("user_profiles")
        .update({ status: "active" })
        .eq("user_id", userId);
      if (error) {
        return NextResponse.json({ error: "Failed to activate user" }, { status: 500 });
      }
      return NextResponse.json({ success: true, message: "User activated" });
    }

    case "freeze_tokens": {
      const { error } = await supabase
        .from("token_wallets")
        .update({ is_frozen: true })
        .eq("user_id", userId);
      if (error) {
        return NextResponse.json({ error: "Failed to freeze tokens" }, { status: 500 });
      }
      return NextResponse.json({ success: true, message: "Tokens frozen" });
    }

    case "unfreeze_tokens": {
      const { error } = await supabase
        .from("token_wallets")
        .update({ is_frozen: false })
        .eq("user_id", userId);
      if (error) {
        return NextResponse.json({ error: "Failed to unfreeze tokens" }, { status: 500 });
      }
      return NextResponse.json({ success: true, message: "Tokens unfrozen" });
    }

    case "adjust_tokens": {
      const { amount, reason } = body;
      const parsedAmount = parseInt(amount, 10);
      if (isNaN(parsedAmount) || parsedAmount === 0) {
        return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
      }

      // Get current balance
      const { data: wallet, error: walletError } = await supabase
        .from("token_wallets")
        .select("balance_tokens")
        .eq("user_id", userId)
        .single();

      if (walletError || !wallet) {
        return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
      }

      const newBalance = wallet.balance_tokens + parsedAmount;
      if (newBalance < 0) {
        return NextResponse.json(
          { error: "Insufficient tokens for debit" },
          { status: 400 }
        );
      }

      const { error: updateError } = await supabase
        .from("token_wallets")
        .update({ balance_tokens: newBalance })
        .eq("user_id", userId);

      if (updateError) {
        return NextResponse.json({ error: "Failed to adjust tokens" }, { status: 500 });
      }

      // Log the transaction
      await supabase.from("token_transactions").insert({
        user_id: userId,
        tokens_used: Math.abs(parsedAmount),
        operation_type: parsedAmount > 0 ? "admin_credit" : "admin_debit",
        description: reason || `Admin ${parsedAmount > 0 ? "credit" : "debit"} of ${Math.abs(parsedAmount)} tokens`,
      });

      return NextResponse.json({
        success: true,
        message: `Tokens adjusted by ${parsedAmount > 0 ? "+" : ""}${parsedAmount}`,
        new_balance: newBalance,
      });
    }

    default:
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }
}
