import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as any;
    const { order, customerEmail, customerName } = body || {};

    if (!order) {
      return NextResponse.json({ success: false, error: 'Order details missing' }, { status: 400 });
    }

    const recipient = customerEmail || 'customer@example.com';
    const name = customerName || order.address?.name || 'Customer';

    const itemsHtml = (order.items || [])
      .map(
        (item: any) => `
        <tr style="border-bottom: 1px solid #edf1eb;">
          <td style="padding: 14px 8px 14px 0; vertical-align: middle;">
            <div style="font-weight: 600; color: #173c32; font-size: 15px; line-height: 1.3;">${item.name || 'Product'}</div>
            <div style="color: #627969; font-size: 13px; margin-top: 3px;">
              ${item.brand ? `<span style="text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px; color: #537362;">${item.brand}</span> · ` : ''}
              ${item.variant || 'Original'} · Qty: <strong>${item.qty}</strong>
            </div>
          </td>
          <td style="padding: 14px 0 14px 8px; text-align: right; vertical-align: middle; font-weight: 600; color: #173c32; font-size: 15px;">
            ₹${(item.price || 0) * (item.qty || 1)}
          </td>
        </tr>
      `
      )
      .join('');

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Order Confirmation #${order.id}</title>
</head>
<body style="margin: 0; padding: 24px 12px; background-color: #f7f6f0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0">
    <tr>
      <td align="center">
        <div style="max-width: 580px; width: 100%; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #dce4dc; box-shadow: 0 4px 20px rgba(23,60,50,0.06); text-align: left;">
          
          <!-- Brand Header -->
          <div style="background-color: #173c32; padding: 28px 24px; text-align: center;">
            <h1 style="margin: 0; color: #fffdf7; font-size: 24px; letter-spacing: 1.5px; font-weight: 700;">GHAR SANSAR</h1>
            <p style="margin: 4px 0 0; color: #a3c2b1; font-size: 12px; letter-spacing: 1px; text-transform: uppercase;">Bhuj · Household & Plastics</p>
          </div>

          <!-- Hero Greeting -->
          <div style="padding: 28px 26px 20px; background-color: #faf9f5; border-bottom: 1px solid #edf1eb;">
            <div style="display: inline-block; background-color: #e2ede5; color: #173c32; font-size: 12px; font-weight: 600; padding: 4px 10px; border-radius: 999px; margin-bottom: 10px;">
              ✓ ORDER CONFIRMED
            </div>
            <h2 style="margin: 0 0 8px; color: #173c32; font-size: 20px; font-weight: 600;">Namaste ${name}, thank you!</h2>
            <p style="margin: 0; color: #5a7062; font-size: 14.5px; line-height: 1.5;">
              We have received your order. Our store team in Bhuj is getting your essentials packed and ready for delivery.
            </p>
          </div>

          <!-- Key Details Card -->
          <div style="padding: 20px 26px;">
            <table width="100%" style="background-color: #f4f8f4; border: 1px solid #d9e7da; border-radius: 8px; padding: 14px 16px;">
              <tr>
                <td style="padding: 4px 0;">
                  <div style="font-size: 12px; color: #627969; text-transform: uppercase; letter-spacing: 0.5px;">Order Number</div>
                  <div style="font-size: 16px; font-weight: 700; color: #173c32; margin-top: 2px;">${order.id}</div>
                </td>
                <td style="padding: 4px 0; text-align: right;">
                  <div style="font-size: 12px; color: #627969; text-transform: uppercase; letter-spacing: 0.5px;">Delivery Estimate</div>
                  <div style="font-size: 15px; font-weight: 600; color: #2d5a49; margin-top: 2px;">Tomorrow (Bhuj Delivery)</div>
                </td>
              </tr>
            </table>

            <!-- Order Items -->
            <h3 style="margin: 24px 0 12px; color: #173c32; font-size: 16px; font-weight: 600; border-bottom: 2px solid #173c32; padding-bottom: 6px;">
              Ordered Items
            </h3>
            <table width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse;">
              ${itemsHtml}
            </table>

            <!-- Bill Totals -->
            <div style="margin-top: 18px; padding-top: 14px; border-top: 1px solid #dce4dc; text-align: right;">
              <div style="font-size: 14px; color: #627969; margin-bottom: 4px;">
                Delivery Fee: <strong style="color: #173c32;">${order.delivery === 0 ? 'FREE' : '₹' + (order.delivery || 0)}</strong>
              </div>
              <div style="font-size: 14px; color: #627969; margin-bottom: 6px;">
                Payment Method: <strong style="color: #173c32;">${order.method || 'Cash on Delivery'}</strong>
              </div>
              <div style="font-size: 20px; font-weight: 700; color: #173c32; margin-top: 8px;">
                Grand Total: ₹${order.total}
              </div>
            </div>

            <!-- Delivery Address -->
            <div style="margin-top: 24px; padding: 16px; background-color: #faf9f5; border-radius: 8px; border: 1px solid #edf1eb;">
              <div style="font-size: 12px; font-weight: 700; color: #537362; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">
                📍 Delivering to
              </div>
              <div style="color: #173c32; font-size: 14px; line-height: 1.45;">
                <strong>${order.address?.name || name}</strong><br/>
                ${order.address?.house || ''}, ${order.address?.street || ''}<br/>
                ${order.address?.city || 'Bhuj'}, ${order.address?.state || 'Gujarat'} - ${order.address?.pin || '370001'}<br/>
                Phone: <strong>${order.address?.phone || ''}</strong>
              </div>
            </div>

            <!-- Track Order Button -->
            <div style="margin: 30px 0 10px; text-align: center;">
              <a href="https://gharsansar.in/tracking/${order.id}" style="background-color: #173c32; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 15px; font-weight: 600; display: inline-block; letter-spacing: 0.3px; box-shadow: 0 4px 12px rgba(23,60,50,0.2);">
                Track Live Order Status →
              </a>
            </div>
          </div>

          <!-- Store Footer -->
          <div style="background-color: #faf9f5; padding: 20px 24px; border-top: 1px solid #dce4dc; text-align: center; color: #738a7c; font-size: 12.5px; line-height: 1.5;">
            <p style="margin: 0; font-weight: 600; color: #173c32;">Ghar Sansar · Bhuj Household & Plastics</p>
            <p style="margin: 4px 0 0;">Need help with your order? Reply directly to this email or reach us on WhatsApp.</p>
          </div>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    // If RESEND_API_KEY is configured, send the real email via Resend
    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const fromEmail = process.env.STORE_EMAIL || 'Ghar Sansar <onboarding@resend.dev>';

      const data = await resend.emails.send({
        from: fromEmail,
        to: [recipient],
        subject: `Order Confirmed #${order.id} — Ghar Sansar Bhuj`,
        html: htmlContent,
      });

      return NextResponse.json({ success: true, mode: 'live', data });
    } else {
      // Free development / demo simulation mode
      console.log(`[Ghar Sansar Email Simulated] To: ${recipient} | Order: ${order.id} | Total: ₹${order.total}`);
      return NextResponse.json({
        success: true,
        mode: 'simulated',
        message: 'Order email generated successfully (add RESEND_API_KEY to send live email).',
        recipient,
        orderId: order.id
      });
    }
  } catch (error: any) {
    console.error('Failed to send order email:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
