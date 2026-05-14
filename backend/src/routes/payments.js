import { PaymentService, StudentService, NotificationService } from "../lib/database.js";
import { authenticate, checkRole, getUserRoles } from "../lib/auth.js";
import { ok, created, badRequest } from "../lib/response.js";

export function registerPaymentRoutes(router) {
  /**
   * GET /api/payments
   */
  router.get("/api/payments", async (req, env) => {
    const auth = await authenticate(req.raw, env);
    if (auth.error) return auth.error;

    try {
      const roles = await getUserRoles(auth.user.id, env);
      const isFinance = roles.some((r) =>
        ["finance", "branch_admin", "super_admin"].includes(r),
      );

      let payments;
      if (isFinance) {
        // Finance staff can see all payments
        payments = await PaymentService.list(env.DB);
      } else {
        // Students can only see their own payments
        const student = await StudentService.findByUserId(env.DB, auth.user.id);
        if (!student) {
          return ok({ payments: [] });
        }
        payments = await PaymentService.list(env.DB, { student_id: student.id });
      }

      return ok({ payments });
    } catch (error) {
      console.error('Get payments error:', error);
      return badRequest(error.message);
    }
  });

  /**
   * POST /api/payments/mpesa/initiate
   * Initiates an M-Pesa STK push.
   */
  router.post("/api/payments/mpesa/initiate", async (req, env) => {
    const auth = await authenticate(req.raw, env);
    if (auth.error) return auth.error;

    const { phone, amount } = req.body ?? {};
    if (!phone || !amount) {
      return badRequest("phone and amount are required");
    }

    try {
      // Get student record
      const student = await StudentService.findByUserId(env.DB, auth.user.id);
      if (!student) {
        return badRequest("Student record not found");
      }

      // Create pending payment record
      const paymentData = {
        student_id: student.id,
        amount: parseFloat(amount),
        payment_method: 'mpesa',
        status: 'pending',
        description: `M-Pesa payment for ${student.course_name}`,
        payment_reference: `MPESA_${Date.now()}_${student.id.slice(-6)}`
      };

      const payment = await PaymentService.create(env.DB, paymentData);

      // TODO: Integrate with Safaricom Daraja API
      // For now, simulate the STK push
      const mockResponse = {
        MerchantRequestID: `MOCK_${Date.now()}`,
        CheckoutRequestID: `ws_CO_${Date.now()}`,
        ResponseCode: "0",
        ResponseDescription: "Success. Request accepted for processing",
        CustomerMessage: "Success. Request accepted for processing"
      };

      // Create notification
      await NotificationService.create(env.DB, {
        user_id: auth.user.id,
        title: "Payment Initiated",
        message: `M-Pesa payment of KES ${amount} has been initiated. Please complete the payment on your phone.`,
        type: "info",
        action_url: `/payments`
      });

      return ok({
        message: "STK push sent successfully",
        payment_id: payment.id,
        checkout_request_id: mockResponse.CheckoutRequestID,
        ...mockResponse
      });
    } catch (error) {
      console.error('M-Pesa initiate error:', error);
      return badRequest(error.message);
    }
  });

  /**
   * POST /api/payments/mpesa/callback
   * M-Pesa callback webhook
   */
  router.post("/api/payments/mpesa/callback", async (req, env) => {
    try {
      const callbackData = req.body;
      console.log('M-Pesa callback received:', callbackData);

      // TODO: Implement proper M-Pesa callback handling
      // Parse the callback data and update payment status
      
      const { Body } = callbackData || {};
      const { stkCallback } = Body || {};
      
      if (stkCallback) {
        const { CheckoutRequestID, ResultCode, ResultDesc } = stkCallback;
        
        // Find payment by checkout request ID
        // For now, we'll simulate this since we don't have the actual integration
        
        if (ResultCode === 0) {
          // Payment successful
          // Update payment status and student balance
          console.log('Payment successful:', CheckoutRequestID);
        } else {
          // Payment failed
          console.log('Payment failed:', ResultDesc);
        }
      }

      return ok({ message: "Callback processed" });
    } catch (error) {
      console.error('M-Pesa callback error:', error);
      return ok({ message: "Callback received" });
    }
  });

  /**
   * POST /api/payments/cash
   * Record cash payment (finance staff only)
   */
  router.post("/api/payments/cash", async (req, env) => {
    const auth = await authenticate(req.raw, env);
    if (auth.error) return auth.error;

    const roleCheck = await checkRole(auth.user.id, env, "finance", "branch_admin", "super_admin");
    if (roleCheck) return roleCheck;

    const { student_id, amount, description, receipt_number } = req.body ?? {};
    if (!student_id || !amount) {
      return badRequest("student_id and amount are required");
    }

    try {
      // Verify student exists
      const student = await StudentService.findById(env.DB, student_id);
      if (!student) {
        return badRequest("Student not found");
      }

      // Create payment record
      const paymentData = {
        student_id,
        amount: parseFloat(amount),
        payment_method: 'cash',
        status: 'completed',
        description: description || `Cash payment for ${student.course_name}`,
        payment_reference: receipt_number || `CASH_${Date.now()}`,
        processed_by: auth.user.id,
        payment_date: new Date().toISOString()
      };

      const payment = await PaymentService.create(env.DB, paymentData);

      // Update student balance (this will also update student balance)
      await PaymentService.updateStatus(env.DB, payment.id, 'completed');

      // Get updated student data to show correct balance
      const updatedStudent = await StudentService.findById(env.DB, payment.student_id);
      
      // Create notification for student
      await NotificationService.create(env.DB, {
        user_id: updatedStudent.user_id,
        title: "Payment Received",
        message: `Cash payment of KES ${amount} has been recorded. Your remaining balance is KES ${updatedStudent.balance}.`,
        type: "success",
        action_url: `/payments`
      });

      return created({
        message: "Cash payment recorded successfully",
        payment
      });
    } catch (error) {
      console.error('Cash payment error:', error);
      return badRequest(error.message);
    }
  });

  /**
   * GET /api/payments/:id
   * Get payment details
   */
  router.get("/api/payments/:id", async (req, env) => {
    const auth = await authenticate(req.raw, env);
    if (auth.error) return auth.error;

    const { id } = req.params;

    try {
      const payment = await PaymentService.findById(env.DB, id);
      if (!payment) {
        return badRequest("Payment not found");
      }

      // Check if user can access this payment
      const roles = await getUserRoles(auth.user.id, env);
      const isFinance = roles.some((r) =>
        ["finance", "branch_admin", "super_admin"].includes(r),
      );

      if (!isFinance) {
        // Students can only see their own payments
        const student = await StudentService.findByUserId(env.DB, auth.user.id);
        if (!student || payment.student_id !== student.id) {
          return badRequest("Access denied");
        }
      }

      return ok({ payment });
    } catch (error) {
      console.error('Get payment error:', error);
      return badRequest(error.message);
    }
  });

  /**
   * PUT /api/payments/:id/status
   * Update payment status (finance staff only)
   */
  router.put("/api/payments/:id/status", async (req, env) => {
    const auth = await authenticate(req.raw, env);
    if (auth.error) return auth.error;

    const roleCheck = await checkRole(auth.user.id, env, "finance", "branch_admin", "super_admin");
    if (roleCheck) return roleCheck;

    const { id } = req.params;
    const { status, notes } = req.body ?? {};

    if (!status) {
      return badRequest("status is required");
    }

    try {
      const updates = { processed_by: auth.user.id };
      if (notes) updates.description = notes;

      await PaymentService.updateStatus(env.DB, id, status, updates);

      const payment = await PaymentService.findById(env.DB, id);
      if (payment) {
        // Create notification for student
        const statusMessage = status === 'completed' ? 'confirmed' : 
                            status === 'failed' ? 'failed' : 'updated';
        
        await NotificationService.create(env.DB, {
          user_id: payment.student_id,
          title: "Payment Status Updated",
          message: `Your payment of KES ${payment.amount} has been ${statusMessage}.`,
          type: status === 'completed' ? 'success' : status === 'failed' ? 'error' : 'info',
          action_url: `/payments`
        });
      }

      return ok({
        message: "Payment status updated successfully",
        payment
      });
    } catch (error) {
      console.error('Update payment status error:', error);
      return badRequest(error.message);
    }
  });

  /**
   * PUT /api/payments/:id
   * Update payment details (admin/finance only)
   */
  router.put("/api/payments/:id", async (req, env) => {
    const auth = await authenticate(req.raw, env);
    if (auth.error) return auth.error;

    const roleCheck = await checkRole(auth.user.id, env, "super_admin", "branch_admin", "finance");
    if (roleCheck) return roleCheck;

    try {
      const updates = req.body || {};
      delete updates.id;
      delete updates.created_at;

      await PaymentService.update(env.DB, req.params.id, updates);
      const payment = await PaymentService.findById(env.DB, req.params.id);

      return ok({
        message: "Payment updated successfully",
        payment
      });
    } catch (error) {
      return badRequest(error.message);
    }
  });

  /**
   * DELETE /api/payments/:id
   * Delete payment (admin only)
   */
  router.delete("/api/payments/:id", async (req, env) => {
    const auth = await authenticate(req.raw, env);
    if (auth.error) return auth.error;

    const roleCheck = await checkRole(auth.user.id, env, "super_admin", "branch_admin");
    if (roleCheck) return roleCheck;

    try {
      await PaymentService.delete(env.DB, req.params.id);
      return ok({ message: "Payment deleted successfully" });
    } catch (error) {
      return badRequest(error.message);
    }
  });
}

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
