import { getAdminClient } from "../lib/supabase.js";
import { authenticate, checkRole, getUserRoles } from "../lib/auth.js";
import { ok, created, badRequest } from "../lib/response.js";

export function registerPaymentRoutes(router) {
  /**
   * GET /api/payments
   */
  router.get("/api/payments", async (req, env) => {
    const auth = await authenticate(req.raw, env);
    if (auth.error) return auth.error;

    const roles = await getUserRoles(auth.user.id, env);
    const isFinance = roles.some((r) =>
      ["finance", "branch_admin", "super_admin"].includes(r),
    );

    const admin = getAdminClient(env);
    let query = admin
      .from("payments")
      .select("*")
      .order("created_at", { ascending: false });

    if (!isFinance) {
      const { data: student } = await admin
        .from("students")
        .select("id")
        .eq("user_id", auth.user.id)
        .single();

      if (!student) return ok({ payments: [] });
      query = query.eq("student_id", student.id);
    }

    const { data, error } = await query;
    if (error) return badRequest(error.message);
    return ok({ payments: data ?? [] });
  });

  /**
   * POST /api/payments/mpesa/initiate
   * Initiates an M-Pesa STK push.
   * TODO: wire up Safaricom Daraja API here.
   */
  router.post("/api/payments/mpesa/initiate", async (req, env) => {
    const auth = await authenticate(req.raw, env);
    if (auth.error) return auth.error;

    const { phone, amount } = req.body ?? {};
    if (!phone || !amount) return badRequest("phone and amount are required");

    const admin = getAdminClient(env);
    const { data: student } = await admin
      .from("students")
      .select("id")
      .eq("user_id", auth.user.id)
      .single();

    if (!student) return badRequest("Student record not found");

    const { data, error } = await admin
      .from("payments")
      .insert({
        student_id: student.id,
        amount: Number(amount),
        method: "mpesa",
        status: "pending",
        ref: `MPESA-${Date.now()}`,
      })
      .select()
      .single();

    if (error) return badRequest(error.message);

    return created({
      message: "STK push initiated. Check your phone.",
      paymentId: data.id,
      checkoutRequestId: `mock-${data.id}`,
    });
  });

  /**
   * POST /api/payments/mpesa/callback
   * Webhook called by Safaricom Daraja after payment.
   */
  router.post("/api/payments/mpesa/callback", async (req, env) => {
    const body = req.body ?? {};
    const callback = body?.Body?.stkCallback;
    if (!callback) return badRequest("Invalid callback payload");

    const { ResultCode, CheckoutRequestID } = callback;
    const success = ResultCode === 0;

    console.log(`[M-Pesa] ${CheckoutRequestID} → ${success ? "SUCCESS" : "FAILED"}`);

    // TODO: look up payment by CheckoutRequestID and update status
    return ok({ ResultCode: 0, ResultDesc: "Accepted" });
  });

  /**
   * POST /api/payments/cash
   * Finance officer records a manual cash payment.
   */
  router.post("/api/payments/cash", async (req, env) => {
    const auth = await authenticate(req.raw, env);
    if (auth.error) return auth.error;

    const denied = await checkRole(auth.user.id, env, "finance", "branch_admin", "super_admin");
    if (denied) return denied;

    const { student_id, amount } = req.body ?? {};
    if (!student_id || !amount) return badRequest("student_id and amount are required");

    const admin = getAdminClient(env);
    const { data, error } = await admin
      .from("payments")
      .insert({
        student_id,
        amount: Number(amount),
        method: "cash",
        status: "paid",
        ref: `CASH-${Date.now()}`,
      })
      .select()
      .single();

    if (error) return badRequest(error.message);
    return created({ payment: data });
  });
}
