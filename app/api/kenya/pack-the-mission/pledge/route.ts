import { createAdminClient } from '@/lib/supabase/admin'
import { sendEmail } from '@/lib/email/resend'
import { NextRequest, NextResponse } from 'next/server'

// GET - Return pledge stats (public aggregate, no PII)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    if (searchParams.get('stats') !== 'true') {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('kenya_supply_pledge_stats')
      .select('*')

    if (error) {
      console.error('Error fetching pledge stats:', error)
      return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
    }

    return NextResponse.json({ stats: data || [] })
  } catch (error) {
    console.error('Error in pledge stats GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminClient()
    const body = await request.json()

    const { pledgerName, pledgerEmail, pledgerPhone, categoryId, itemName, quantity, estimatedValue, notes } = body

    // Validate required fields
    if (!pledgerName) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    if (!pledgerEmail && !pledgerPhone) {
      return NextResponse.json({ error: 'Email or phone is required' }, { status: 400 })
    }

    if (!categoryId || !itemName) {
      return NextResponse.json({ error: 'Category and item are required' }, { status: 400 })
    }

    if (pledgerEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(pledgerEmail)) {
        return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 })
      }
    }

    // Get active trip
    const { data: trip } = await supabase
      .from('kenya_trips')
      .select('id')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    // Insert pledge
    const { data: pledge, error: insertError } = await supabase
      .from('kenya_supply_pledges')
      .insert({
        trip_id: trip?.id || null,
        pledger_name: pledgerName,
        pledger_email: pledgerEmail || null,
        pledger_phone: pledgerPhone || null,
        category_id: categoryId,
        item_name: itemName,
        quantity: quantity || 1,
        estimated_value: estimatedValue || null,
        notes: notes || null,
        status: 'pledged',
      })
      .select('id')
      .single()

    if (insertError) {
      console.error('Error saving pledge:', insertError)
      return NextResponse.json({ error: 'Failed to save pledge. Please try again.' }, { status: 500 })
    }

    // Send admin notification email
    const adminEmailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #b45309 0%, #f59e0b 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            td { padding: 12px; border: 1px solid #e5e7eb; }
            td:first-child { background: #f9fafb; font-weight: bold; width: 40%; }
            .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px; padding: 20px; background: #f9fafb; border-radius: 0 0 10px 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">New Supply Pledge</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Pack the Mission — Kenya 2026</p>
            </div>
            <div class="content">
              <p>Someone just pledged a supply item for the Kenya trip!</p>
              <table>
                <tr><td>Name</td><td><strong>${pledgerName}</strong></td></tr>
                <tr><td>Contact</td><td>${pledgerEmail || ''} ${pledgerPhone || ''}</td></tr>
                <tr><td>Category</td><td>${categoryId}</td></tr>
                <tr><td>Item</td><td><strong>${itemName}</strong></td></tr>
                <tr><td>Quantity</td><td>${quantity || 1}</td></tr>
                ${estimatedValue ? `<tr><td>Est. Value</td><td>${estimatedValue}</td></tr>` : ''}
                ${notes ? `<tr><td>Notes</td><td>${notes}</td></tr>` : ''}
              </table>
            </div>
            <div class="footer">
              <p>Pack the Mission &bull; <a href="https://tpcmin.org/kenya/pack-the-mission">tpcmin.org/kenya/pack-the-mission</a></p>
            </div>
          </div>
        </body>
      </html>
    `

    try {
      await sendEmail({
        to: 'info@tpcmin.org',
        subject: `New Supply Pledge: ${itemName} — ${pledgerName}`,
        html: adminEmailHtml,
      })
    } catch (emailError) {
      console.error('Failed to send admin notification:', emailError)
    }

    // Send confirmation email to pledger
    if (pledgerEmail) {
      const confirmationHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #b45309 0%, #f59e0b 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
              .highlight { background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b; }
              .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px; padding: 20px; background: #f9fafb; border-radius: 0 0 10px 10px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0;">You're Part of the Team!</h1>
                <p style="margin: 10px 0 0 0; opacity: 0.9;">Pack the Mission — Kenya 2026</p>
              </div>
              <div class="content">
                <p>Dear ${pledgerName},</p>
                <p>Thank you for pledging <strong>${itemName}</strong> for the Kenya 2026 mission trip! Every item makes a difference.</p>
                <div class="highlight">
                  <strong>What happens next?</strong>
                  <ul style="margin: 10px 0 0 0; padding-left: 20px;">
                    <li>Our team will reach out within 48 hours to coordinate</li>
                    <li>We'll arrange pickup or provide a drop-off location</li>
                    <li>No pressure, no rush — we're just grateful you stepped up</li>
                  </ul>
                </div>
                <p>If you have any questions, reach out to us at <a href="mailto:info@tpcmin.org">info@tpcmin.org</a>.</p>
                <p>Blessings,<br><strong>TPC Ministries Kenya Team</strong></p>
              </div>
              <div class="footer">
                <p>&copy; ${new Date().getFullYear()} TPC Ministries</p>
                <p><a href="https://tpcmin.org/kenya/pack-the-mission">tpcmin.org/kenya/pack-the-mission</a></p>
              </div>
            </div>
          </body>
        </html>
      `

      try {
        await sendEmail({
          to: pledgerEmail,
          subject: 'Your Kenya Supply Pledge — TPC Ministries',
          html: confirmationHtml,
        })
      } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError)
      }
    }

    return NextResponse.json(
      { success: true, pledgeId: pledge?.id },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error in pack-the-mission pledge POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
