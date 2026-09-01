import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { createQuoteAttributionSubmission } from "@/lib/marketing/submissions";
import { syncSubmissionToHubSpot } from "@/lib/hubspot/syncSubmission";
import { buildCustomBuildEmailHtml } from "@/lib/customBuilds/quoteDetails";

/**
 * Generate HTML for a single cart item with its configuration
 */
function generateCartItemHtml(item, index) {
  const config = item.configuration;

  let configDetails = "";

  if (config) {
    const details = [];

    if (config.size) {
      details.push(
        `<tr><td style="padding: 4px 8px; color: #666;">Size:</td><td style="padding: 4px 8px;">${config.size.label || config.size.key}</td></tr>`
      );
    }

    if (config.woodType) {
      details.push(
        `<tr><td style="padding: 4px 8px; color: #666;">Wood Type:</td><td style="padding: 4px 8px;">${config.woodType.name}</td></tr>`
      );
    }

    if (config.stove) {
      details.push(
        `<tr><td style="padding: 4px 8px; color: #666;">Heater:</td><td style="padding: 4px 8px;">${config.stove.name}${config.stove.wifi ? " (WiFi)" : ""}</td></tr>`
      );
    }

    if (config.installation) {
      details.push(
        `<tr><td style="padding: 4px 8px; color: #666;">Installation:</td><td style="padding: 4px 8px;">${config.installation.name}</td></tr>`
      );
    }

    if (config.delivery) {
      const deliveryText = config.delivery.included
        ? "Included"
        : `$${config.delivery.cost.toLocaleString()}`;
      details.push(
        `<tr><td style="padding: 4px 8px; color: #666;">Delivery:</td><td style="padding: 4px 8px;">${deliveryText}</td></tr>`
      );
    }

    if (config.upgrades && config.upgrades.length > 0) {
      const upgradesList = config.upgrades
        .map((u) => `${u.name} (+$${u.price.toLocaleString()})`)
        .join(", ");
      details.push(
        `<tr><td style="padding: 4px 8px; color: #666;">Add-ons:</td><td style="padding: 4px 8px;">${upgradesList}</td></tr>`
      );
    }

    if (details.length > 0) {
      configDetails = `<table style="width: 100%; margin-top: 10px;">${details.join("")}</table>`;
    }
  } else if (item.selectedOptions) {
    // Legacy format fallback
    const details = [];
    Object.entries(item.selectedOptions).forEach(([key, option]) => {
      if (option) {
        details.push(
          `<tr><td style="padding: 4px 8px; color: #666; text-transform: capitalize;">${key}:</td><td style="padding: 4px 8px;">${option.type}${option.price > 0 ? ` (+$${option.price.toLocaleString()})` : ""}</td></tr>`
        );
      }
    });
    if (details.length > 0) {
      configDetails = `<table style="width: 100%; margin-top: 10px;">${details.join("")}</table>`;
    }
  }

  return `
    <div style="background-color: #fff; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; margin-bottom: 15px;">
      <div style="display: flex; align-items: flex-start; gap: 15px;">
        ${item.image ? `<img src="${item.image}" alt="${item.name}" style="width: 100px; height: 100px; object-fit: cover; border-radius: 8px;">` : ""}
        <div style="flex: 1;">
          <h3 style="margin: 0 0 5px 0; color: #333; font-size: 18px;">${item.name}</h3>
          <p style="margin: 0; color: #666;">Quantity: ${item.qty}</p>
          <p style="margin: 5px 0 0 0; color: #4E7302; font-weight: bold; font-size: 18px;">$${(item.price * item.qty).toLocaleString()}</p>
        </div>
      </div>
      ${configDetails}
    </div>
  `;
}

/**
 * Generate cart quote email HTML
 */
function generateCartQuoteHtml(data) {
  const {
    name,
    email,
    phone,
    postalcode,
    city,
    province,
    address,
    message,
    cartItems,
    cartSummary,
  } = data;

  const itemsHtml = cartItems
    .map((item, index) => generateCartItemHtml(item, index))
    .join("");

  return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 700px; margin: 0 auto; background-color: #f5f5f5; padding: 20px;">
      <!-- Header -->
      <div style="background-color: #4E7302; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0; font-size: 28px; font-weight: 600;">New Quote Request</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">High-Value Lead from Toronto Sauna Co.</p>
      </div>
      
      <!-- Customer Info -->
      <div style="background-color: #fff; padding: 25px; border-left: 1px solid #e0e0e0; border-right: 1px solid #e0e0e0;">
        <h2 style="color: #4E7302; margin: 0 0 15px 0; font-size: 20px; border-bottom: 2px solid #4E7302; padding-bottom: 10px;">Customer Information</h2>
        <table style="width: 100%;">
          <tr><td style="padding: 8px 0; color: #666; width: 120px;"><strong>Name:</strong></td><td style="padding: 8px 0;">${name}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;"><strong>Email:</strong></td><td style="padding: 8px 0;"><a href="mailto:${email}" style="color: #4E7302;">${email}</a></td></tr>
          <tr><td style="padding: 8px 0; color: #666;"><strong>Phone:</strong></td><td style="padding: 8px 0;"><a href="tel:${phone}" style="color: #4E7302;">${phone}</a></td></tr>
          <tr><td style="padding: 8px 0; color: #666;"><strong>Province:</strong></td><td style="padding: 8px 0;">${province}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;"><strong>Address:</strong></td><td style="padding: 8px 0;">${address}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;"><strong>City:</strong></td><td style="padding: 8px 0;">${city}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;"><strong>Postal Code:</strong></td><td style="padding: 8px 0;">${postalcode}</td></tr>
        </table>
        ${
          message
            ? `
          <div style="margin-top: 15px; padding: 15px; background-color: #f9f9f9; border-radius: 5px;">
            <strong style="color: #666;">Additional Notes:</strong>
            <p style="margin: 10px 0 0 0; white-space: pre-wrap;">${message}</p>
          </div>
        `
            : ""
        }
      </div>
      
      <!-- Cart Items -->
      <div style="background-color: #f9f9f9; padding: 25px; border-left: 1px solid #e0e0e0; border-right: 1px solid #e0e0e0;">
        <h2 style="color: #4E7302; margin: 0 0 15px 0; font-size: 20px; border-bottom: 2px solid #4E7302; padding-bottom: 10px;">Requested Items (${cartItems.length})</h2>
        ${itemsHtml}
      </div>
      
      <!-- Summary -->
      <div style="background-color: #fff; padding: 25px; border-left: 1px solid #e0e0e0; border-right: 1px solid #e0e0e0; border-radius: 0 0 8px 8px;">
        <h2 style="color: #4E7302; margin: 0 0 15px 0; font-size: 20px; border-bottom: 2px solid #4E7302; padding-bottom: 10px;">Quote Summary</h2>
        <table style="width: 100%; max-width: 300px; margin-left: auto;">
          <tr><td style="padding: 8px 0; color: #666;">Subtotal:</td><td style="padding: 8px 0; text-align: right;">$${cartSummary.subtotal.toLocaleString()}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Est. Shipping:</td><td style="padding: 8px 0; text-align: right;">$${cartSummary.shipping.toLocaleString()}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Tax (13% HST):</td><td style="padding: 8px 0; text-align: right;">$${cartSummary.tax.toLocaleString()}</td></tr>
          <tr style="border-top: 2px solid #4E7302;"><td style="padding: 12px 0; font-weight: bold; font-size: 18px;">Total:</td><td style="padding: 12px 0; text-align: right; font-weight: bold; font-size: 18px; color: #4E7302;">$${cartSummary.total.toLocaleString()}</td></tr>
        </table>
      </div>
      
      <!-- Footer -->
      <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
        <p style="margin: 0;">This quote request was submitted via thetorontosaunaco.com</p>
        <p style="margin: 5px 0 0 0;">Please respond promptly to this high-value lead.</p>
      </div>
    </div>
  `;
}

export async function POST(req) {
  try {
    const data = await req.json();
    const {
      name,
      email,
      phone,
      postalcode,
      subject,
      message,
      submissionId,
      attribution,
      sourcePath,
      formId,
      formType,
      isConsultation,
      isCartQuote,
      cartItems,
      cartSummary,
      preferredDate,
      preferredTime,
      saunaType,
      budgetRange,
      contactMethod,
      province,
      address,
      city,
      isCustomBuild,
      projectType,
      interiorFinish,
      lengthFt,
      widthFt,
      heightFt,
      notes,
    } = data;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PWD,
      },
    });

    let emailContent;
    let emailSubject = subject;

    // Handle cart quote requests
    if (isCartQuote && cartItems && cartItems.length > 0) {
      emailContent = generateCartQuoteHtml(data);
      emailSubject = `🔥 HIGH-VALUE LEAD: Quote Request - $${cartSummary.total.toLocaleString()} - ${name}`;
    } else if (isCustomBuild || formType === "custom_build") {
      emailContent = buildCustomBuildEmailHtml({
        name,
        email,
        phone,
        address,
        projectType,
        interiorFinish,
        lengthFt,
        widthFt,
        heightFt,
        notes,
      });
    } else if (isConsultation) {
      emailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; border-bottom: 2px solid #f0f0f0; padding-bottom: 10px;">New Consultation Request</h2>
          
          <div style="background-color: #f9f9f9; padding: 15px; margin: 15px 0; border-radius: 5px;">
            <h3 style="color: #444; margin-top: 0;">Contact Information</h3>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone || "Not provided"}</p>
            
            <p><strong>Preferred Contact Method:</strong> ${contactMethod}</p>
          </div>

          <div style="background-color: #f9f9f9; padding: 15px; margin: 15px 0; border-radius: 5px;">
            <h3 style="color: #444; margin-top: 0;">Consultation Details</h3>
            <p><strong>Preferred Date:</strong> ${new Date(preferredDate).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
            <p><strong>Preferred Time:</strong> ${preferredTime}</p>
            <p><strong>Sauna Type Interest:</strong> ${saunaType}</p>
            <p><strong>Budget Range:</strong> ${budgetRange}</p>
          </div>

          <div style="background-color: #f9f9f9; padding: 15px; margin: 15px 0; border-radius: 5px;">
            <h3 style="color: #444; margin-top: 0;">Additional Information</h3>
            <p style="white-space: pre-wrap;">${message}</p>
          </div>
        </div>
      `;
    } else {
      emailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; border-bottom: 2px solid #f0f0f0; padding-bottom: 10px;">New General Inquiry</h2>
          
          <div style="background-color: #f9f9f9; padding: 15px; margin: 15px 0; border-radius: 5px;">
            <h3 style="color: #444; margin-top: 0;">Contact Information</h3>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ""}
            ${postalcode ? `<p><strong>Postal Code:</strong> ${postalcode}</p>` : ""}
            ${province ? `<p><strong>Province:</strong> ${province}</p>` : ""}
            ${address ? `<p><strong>Address:</strong> ${address}</p>` : ""}
            ${city ? `<p><strong>City:</strong> ${city}</p>` : ""}
          </div>

          <div style="background-color: #f9f9f9; padding: 15px; margin: 15px 0; border-radius: 5px;">
            <h3 style="color: #444; margin-top: 0;">Message</h3>
            <p style="white-space: pre-wrap;">${message}</p>
          </div>
        </div>
      `;
    }

    const mailOptions = {
      from: process.env.MAIL_USER,
      to: "tjallen@thetorontosaunaco.com",
      // to: "damion.wilson@gmail.com",
      subject: emailSubject,
      html: emailContent,
    };

    await transporter.sendMail(mailOptions);

    try {
      await syncSubmissionToHubSpot(data);
    } catch (hubspotError) {
      console.error("HubSpot sync failed after email sent:", hubspotError);
    }

    if (submissionId) {
      try {
        await createQuoteAttributionSubmission({
          submissionId,
          formId: formId || "",
          formType: formType || (isCartQuote ? "cart_quote" : isConsultation ? "consultation" : isCustomBuild ? "custom_build" : "quote"),
          subject: subject || "",
          contact: { name, email, phone, postalcode, message },
          attribution: attribution || {},
          sourcePath: sourcePath || "",
          emailSent: true,
        });
      } catch (persistError) {
        console.error("Failed to persist quote attribution submission:", persistError);
      }
    }

    return NextResponse.json(
      { message: "Email sent successfully!" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      { message: "Error sending email" },
      { status: 500 }
    );
  }
}
