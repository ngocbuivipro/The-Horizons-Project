import { CLIENT_URL } from "../../config/env.js";

// Format Currency
const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", { style: 'currency', currency: 'VND' }).format(amount || 0);
};

// Format Date
const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
};

// Get Product Details based on Booking Type
const getProductDetails = (booking) => {
    const type = booking.bookingType;

    if (type === 'HOTEL') {
        return {
            productLabel: "Hotel & Room",
            productName: `${booking.roomType?.hotel?.name || 'Hotel'} - ${booking.roomType?.RoomType || 'Room'}`,
            dateLabelStart: "Check-in",
            dateLabelEnd: "Check-out",
            quantityLabel: "Guests"
        };
    } else if (type === 'TOUR') {
        return {
            productLabel: "Tour Name",
            productName: booking.tour?.title || booking.tour?.name || booking.productName || 'Tour Service',
            dateLabelStart: "Start Date",
            dateLabelEnd: "End Date",
            quantityLabel: "Participants"
        };
    } else if (type === 'BUS') {
        return {
            productLabel: "Bus Route",
            productName: booking.bus ? `${booking.bus.operator} (${booking.bus.cityFrom} ➝ ${booking.bus.cityTo})` : (booking.productName || 'Bus Ticket'),
            dateLabelStart: "Departure",
            dateLabelEnd: null,
            quantityLabel: "Seats"
        };
    } else if (type === 'CRUISE') {
        return {
            productLabel: "Cruise Trip",
            productName: booking.cruise?.title || booking.productName || 'Cruise Service',
            dateLabelStart: "Departure",
            dateLabelEnd: "Return",
            quantityLabel: "Guests"
        };
    } else if (type === 'CAR') {
        // --- NEW CAR LOGIC ADDED HERE ---
        let carName = "";
        if (booking.carRoute) {
            carName = `${booking.carRoute.origin} ➝ ${booking.carRoute.destination}`;
            if (booking.carVehicle) {
                carName += ` (${booking.carVehicle.name || booking.carVehicle.type})`;
            }
        }

        return {
            productLabel: "Private Transfer",
            productName: carName || booking.productName || 'Car Transfer Service',
            dateLabelStart: "Pick-up Date",
            dateLabelEnd: null,
            quantityLabel: "Passengers"
        };
    }

    // Default fallback
    return {
        productLabel: "Service",
        productName: booking.productName || "Service",
        dateLabelStart: "Date",
        dateLabelEnd: null,
        quantityLabel: "Quantity"
    };
};

// Generate Link to Order Detail Page
const getOrderDetailLink = (booking) => {
    const type = booking.bookingType;
    const base = `${CLIENT_URL}`;

    if (type === 'BUS') return `${base}/order-bus/${booking._id}`;
    if (type === 'CRUISE') return `${base}/order-cruise/${booking._id}`;
    if (type === 'TOUR') return `${base}/order-tour/${booking._id}`;
    if (type === 'CAR') return `${base}/order-car/${booking._id}`; // --- Added Link for Car ---

    return `${base}/order/${booking._id}`;
};


const styles = {
    body: `background-color: #f3f4f6; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; margin: 0; padding: 0; width: 100%; -webkit-text-size-adjust: 100%; color: #374151;`,
    wrapper: `padding: 40px 0;`,
    container: `max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);`,

    // Header
    header: `background-color: #111827; padding: 30px 20px; text-align: center;`,
    headerSuccess: `background-color: #059669; padding: 30px 20px; text-align: center;`,
    brand: `color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; text-decoration: none;`,

    // Content
    content: `padding: 40px 30px;`,
    heading: `color: #111827; font-size: 24px; font-weight: 800; margin: 0 0 15px 0; letter-spacing: -0.5px;`,
    text: `color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;`,

    // Card / Ticket
    card: `background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 25px; margin-bottom: 25px;`,
    productTitle: `color: #111827; font-size: 18px; font-weight: 700; margin-bottom: 5px; display: block; line-height: 1.4;`,
    productType: `background-color: #dbeafe; color: #1e40af; font-size: 11px; font-weight: 700; padding: 4px 8px; border-radius: 9999px; text-transform: uppercase; display: inline-block; margin-bottom: 12px; letter-spacing: 0.5px;`,

    // Table
    table: `width: 100%; border-collapse: collapse; margin-top: 15px;`,
    tdLabel: `padding: 8px 0; color: #6b7280; font-size: 14px; width: 40%; vertical-align: top;`,
    tdValue: `padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right; width: 60%;`,

    // Elements
    divider: `border-top: 1px dashed #d1d5db; margin: 20px 0;`,
    priceTotal: `color: #ea580c; font-size: 24px; font-weight: 800;`,

    // Buttons
    btnPrimary: `display: inline-block; background-color: #ea580c; color: #ffffff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; text-align: center; min-width: 200px; box-shadow: 0 4px 6px -1px rgba(234, 88, 12, 0.3);`,
    btnDark: `display: inline-block; background-color: #111827; color: #ffffff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; text-align: center; min-width: 200px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2);`,

    // Footer
    footer: `background-color: #f3f4f6; padding: 30px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb;`,
    link: `color: #ea580c; text-decoration: none; font-weight: 600;`
};

// ==========================================
// EXPORT TEMPLATES
// ==========================================

// --- TEMPLATE 1: BOOKING RECEIVED (UNPAID/PENDING) ---
export const getBookingSuccessHtml = (booking) => {
    const details = getProductDetails(booking);

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Booking Confirmation</title>
    </head>
    <body style="${styles.body}">
        <div style="${styles.wrapper}">
            <div style="${styles.container}">
                
                <div style="${styles.header}">
                    <div style="${styles.brand}">The Horizons</div>
                </div>

                <div style="${styles.content}">
                    <h1 style="${styles.heading}">Booking Received!</h1>
                    <p style="${styles.text}">Hi <strong>${booking.name}</strong>,</p>
                    <p style="${styles.text}">Thanks for choosing us. We have received your booking request. Your reservation is currently <strong>pending</strong> while we process the details.</p>

                    <div style="${styles.card}">
                        <span style="${styles.productType}">${details.productLabel}</span>
                        <div style="${styles.productTitle}">${details.productName}</div>
                        <div style="color: #6b7280; font-size: 13px; margin-top: 4px;">Booking ID: #${booking._id}</div>

                        <div style="${styles.divider}"></div>

                        <table style="${styles.table}">
                            <tr>
                                <td style="${styles.tdLabel}">${details.dateLabelStart}</td>
                                <td style="${styles.tdValue}">${formatDate(booking.checkIn)}</td>
                            </tr>
                            ${details.dateLabelEnd ? `
                            <tr>
                                <td style="${styles.tdLabel}">${details.dateLabelEnd}</td>
                                <td style="${styles.tdValue}">${formatDate(booking.checkOut)}</td>
                            </tr>` : ''}
                            <tr>
                                <td style="${styles.tdLabel}">${details.quantityLabel}</td>
                                <td style="${styles.tdValue}">${booking.guests}</td>
                            </tr>
                            <tr>
                                <td style="${styles.tdLabel}">Payment Method</td>
                                <td style="${styles.tdValue}; text-transform: capitalize;">${booking.paymentMethod === 'transfer' ? 'Bank Transfer' : booking.paymentMethod}</td>
                            </tr>
                        </table>

                        <div style="${styles.divider}"></div>

                        <table style="width: 100%;">
                            <tr>
                                <td style="color: #111827; font-weight: 700; font-size: 16px;">Total Amount</td>
                                <td style="text-align: right;"><span style="${styles.priceTotal}">${formatCurrency(booking.totalPriceVND)}</span></td>
                            </tr>
                        </table>
                        
                        ${booking.request ? `
                        <div style="margin-top: 15px; background: #fff; border: 1px solid #eee; padding: 12px; border-radius: 6px; font-size: 13px; color: #555; font-style: italic; line-height: 1.5;">
                            <strong style="color: #111827; font-style: normal; font-size: 11px; text-transform: uppercase;">Note:</strong><br/>
                            "${booking.request}"
                        </div>` : ''}
                    </div>

                    <div style="text-align: center; margin-top: 30px;">
                        <a href="${getOrderDetailLink(booking)}" style="${styles.btnPrimary}">View Booking Details</a>
                    </div>
                </div>

                <div style="${styles.footer}">
                    <p style="margin-bottom: 10px;">Need help? Contact us at <a href="mailto:ngocthuhai175@gmail.com" style="${styles.link}">hoian@betelhospitality.com</a></p>
                    <p>&copy; ${new Date().getFullYear()} The Horizons Team. All rights reserved.</p>
                </div>
            </div>
        </div>
    </body>
    </html>
    `;
};

// --- PAYMENT SUCCESS (CONFIRMED) ---
export const updateBookingSuccessHtml = (booking) => {
    const details = getProductDetails(booking);

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Payment Confirmed</title>
    </head>
    <body style="${styles.body}">
        <div style="${styles.wrapper}">
            <div style="${styles.container}">
                
                <div style="${styles.headerSuccess}">
                    <div style="font-size: 42px; line-height: 1; margin-bottom: 15px;">✓</div>
                    <div style="${styles.brand}">Booking Confirmed</div>
                </div>

                <div style="${styles.content}">
                    <p style="${styles.text}">Dear <strong>${booking.name}</strong>,</p>
                    <p style="${styles.text}">Great news! We have successfully received your payment via <strong>${booking.paymentMethod}</strong>. Your adventure is officially secured.</p>

                    <div style="${styles.card}; border-top: 4px solid #059669;">
                        <div style="text-align: center; margin-bottom: 20px;">
                            <span style="color: #9ca3af; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">Receipt for Booking</span>
                            <div style="color: #111827; font-weight: 700; font-size: 18px; margin-top: 5px;">#${booking._id}</div>
                        </div>

                        <div style="${styles.productTitle}; text-align: center;">${details.productName}</div>

                        <div style="${styles.divider}"></div>

                        <table style="${styles.table}">
                            <tr>
                                <td style="${styles.tdLabel}"><span style="font-size: 18px; vertical-align: middle; margin-right: 5px;"></span> ${details.dateLabelStart}</td>
                                <td style="${styles.tdValue}">
                                    ${formatDate(booking.checkIn)}
                                    ${details.dateLabelEnd ? `<br><span style="color: #6b7280; font-weight: normal; font-size: 12px;">to ${formatDate(booking.checkOut)}</span>` : ''}
                                </td>
                            </tr>
                            <tr>
                                <td style="${styles.tdLabel}"><span style="font-size: 18px; vertical-align: middle; margin-right: 5px;"></span> ${details.quantityLabel}</td>
                                <td style="${styles.tdValue}">${booking.guests}</td>
                            </tr>
                        </table>

                        <div style="background-color: #ecfdf5; border-radius: 6px; padding: 15px; margin-top: 20px; display: flex; justify-content: space-between; align-items: center; border: 1px solid #d1fae5;">
                            <span style="color: #065f46; font-weight: 600; font-size: 14px;">Amount Paid</span>
                            <span style="color: #059669; font-weight: 800; font-size: 18px;">${formatCurrency(booking.totalPriceVND)}</span>
                        </div>
                    </div>

                    <div style="text-align: center; margin-top: 30px;">
                        <a href="${getOrderDetailLink(booking)}" style="${styles.btnDark}">Manage My Booking</a>
                    </div>
                </div>

                <div style="${styles.footer}">
                    <p>&copy; ${new Date().getFullYear()} Betel Hospitality Team.</p>
                </div>
            </div>
        </div>
    </body>
    </html>
    `;
};

// --- ADMIN NOTIFICATION for contact us page
export const getAdminNotificationHtml = (data) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>New Enquiry</title>
    </head>
    <body style="${styles.body}">
        <div style="${styles.wrapper}">
            <div style="${styles.container}; border-top: 5px solid #ea580c;">
                <div style="padding: 25px; background-color: #fff7ed; border-bottom: 1px solid #ffedd5;">
                    <h2 style="margin: 0; color: #9a3412; font-size: 20px;">New Website Enquiry</h2>
                </div>

                <div style="${styles.content}">
                    <div style="margin-bottom: 25px;">
                        <label style="display: block; color: #6b7280; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700; margin-bottom: 5px;">From Customer</label>
                        <div style="font-size: 18px; color: #111827; font-weight: 700;">${data.name}</div>
                    </div>

                    <table style="width: 100%; margin-bottom: 25px;">
                        <tr>
                            <td style="padding-bottom: 15px;">
                                <label style="display: block; color: #6b7280; font-size: 11px; font-weight: 700; uppercase; margin-bottom: 4px;">Email</label>
                                <a href="mailto:${data.email}" style="color: #ea580c; text-decoration: none; font-weight: 500;">${data.email}</a>
                            </td>
                            <td style="padding-bottom: 15px;">
                                <label style="display: block; color: #6b7280; font-size: 11px; font-weight: 700; uppercase; margin-bottom: 4px;">WhatsApp / Phone</label>
                                <span style="color: #111827; font-weight: 500;">${data.whatsapp || 'N/A'}</span>
                            </td>
                        </tr>
                    </table>

                    <div style="background-color: #f3f4f6; border-left: 4px solid #9ca3af; padding: 20px; border-radius: 0 8px 8px 0;">
                        <label style="display: block; color: #6b7280; font-size: 11px; font-weight: 700; margin-bottom: 8px; text-transform: uppercase;">Message Content:</label>
                        <p style="margin: 0; color: #374151; font-style: italic; line-height: 1.6;">"${data.message}"</p>
                    </div>
                </div>
                
                <div style="${styles.footer}">
                    System Notification - Do not reply to this email directly.
                </div>
            </div>
        </div>
    </body>
    </html>
    `;
};

// ---  AUTO REPLY ---
export const getAutoReplyHtml = (data) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>We received your message</title>
    </head>
    <body style="${styles.body}">
        <div style="${styles.wrapper}">
            <div style="${styles.container}">
                
                <div style="background-image: linear-gradient(135deg, #1f2937 0%, #111827 100%); padding: 40px 20px; text-align: center; color: white;">
                    <div style="font-size: 24px; font-weight: 700; margin-bottom: 8px;">We received your message</div>
                    <div style="opacity: 0.8; font-size: 16px;">Thanks for reaching out, ${data.name}!</div>
                </div>

                <div style="${styles.content}">
                    <p style="${styles.text}">Hello <strong>${data.name}</strong>,</p>
                    <p style="${styles.text}">Thank you for contacting <strong>Betel Hospitality</strong>. We appreciate your interest in our services.</p>
                    
                    <p style="${styles.text}">Our team is currently reviewing your enquiry and will get back to you within <strong>24 hours</strong>. If your matter is urgent, please contact us directly via WhatsApp.</p>

                    <div style="margin-top: 35px; text-align: center;">
                        <a href="${CLIENT_URL || '#'}" style="display: inline-block; background-color: #ffffff; color: #111827; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; border: 2px solid #e5e7eb;">Back to Website</a>
                    </div>
                </div>

                <div style="background-color: #f9fafb; padding: 25px; border-top: 1px solid #e5e7eb; text-align: center;">
                    <p style="margin: 0; color: #4b5563; font-size: 14px; font-weight: 600;">Connect with us directly</p>
                    <a href="https://wa.me/84982826930" style="display: inline-block; margin-top: 10px; color: #10b981; text-decoration: none; font-weight: 700; font-size: 18px;">
                        <span style="vertical-align: middle; font-size: 20px;">💬</span> +84 982 826 930
                    </a>
                </div>

                <div style="${styles.footer}">
                    &copy; ${new Date().getFullYear()} Betel Hospitality.
                </div>
            </div>
        </div>
    </body>
    </html>
    `;
};