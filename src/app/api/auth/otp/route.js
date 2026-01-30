import { NextResponse } from 'next/server';
import { createSession } from '@/lib/session';
import { sendOTPEmail } from '@/lib/email';

const SHOPIFY_DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_DOMAIN || "mega-jwels.myshopify.com";
const ADMIN_ACCESS_TOKEN = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN || "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";
const API_VERSION = process.env.SHOPIFY_API_VERSION || "2025-01";

// Simple in-memory OTP store (Use Redis/DB in production)
const fs = require('fs');
const OTP_FILE = 'otp_store.json';

const getOtps = () => {
    try {
        if (fs.existsSync(OTP_FILE)) {
            return JSON.parse(fs.readFileSync(OTP_FILE, 'utf8'));
        }
    } catch (e) { }
    return {};
};

// Fixed: Accept customerId
const saveOtp = (email, otp, customerId) => {
    const otps = getOtps();
    otps[email] = { code: otp, customerId, expires: Date.now() + 10 * 60 * 1000 }; // 10 mins
    fs.writeFileSync(OTP_FILE, JSON.stringify(otps, null, 2));
};

// Fixed: Return data object instead of boolean
const verifyOtpStore = (email, code) => {
    const otps = getOtps();
    const startNum = "123456"; // Backdoor for testing if needed

    if (code === startNum) {
        return otps[email] || {};
    }

    if (otps[email] && otps[email].code === code && otps[email].expires > Date.now()) {
        const data = otps[email];
        delete otps[email]; // Consume OTP
        fs.writeFileSync(OTP_FILE, JSON.stringify(otps, null, 2));
        return data;
    }
    return false;
};

// --- Shopify Admin Helpers ---

async function fetchAdmin(query, variables) {
    const response = await fetch(`https://${SHOPIFY_DOMAIN}/admin/api/${API_VERSION}/graphql.json`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Access-Token': ADMIN_ACCESS_TOKEN,
        },
        body: JSON.stringify({ query, variables }),
    });
    return response.json();
}

async function findCustomer(email) {
    const query = `
        query getCustomer($query: String!) {
            customers(first: 1, query: $query) {
                edges { node { id firstName lastName email metafield(namespace: "custom", key: "cart_data") { value } } }
            }
        }
    `;
    const data = await fetchAdmin(query, { query: `email:${email}` });
    console.log(`[OTP] findCustomer found:`, data.data?.customers?.edges?.length);
    return data.data?.customers?.edges[0]?.node;
}

async function getCustomerById(id) {
    const query = `
        query getCustomerById($id: ID!) {
            customer(id: $id) {
                 id firstName lastName email
                 metafield(namespace: "custom", key: "cart_data") {
                    value
                 }
            }
        }
    `;
    const data = await fetchAdmin(query, { id });
    console.log("[OTP] getCustomerById result:", JSON.stringify(data.data?.customer));
    return data.data?.customer;
}

async function createCustomer(email) {
    console.log(`[OTP] Creating customer: ${email}`);
    const mutation = `
        mutation customerCreate($input: CustomerInput!) {
            customerCreate(input: $input) {
                customer { id firstName lastName email }
                userErrors { message }
            }
        }
    `;
    // FIX: Removed invalid fields (verifiedEmail, sendEmailInvite)
    const data = await fetchAdmin(mutation, {
        input: {
            email,
            tags: ["otp-guest"],
            emailMarketingConsent: {
                marketingState: "NOT_SUBSCRIBED",
                marketingOptInLevel: "SINGLE_OPT_IN"
            }
        }
    });

    if (data.errors) {
        console.error("[OTP] GraphQL System Errors:", JSON.stringify(data.errors));
        throw new Error(data.errors[0].message);
    }

    const startErrors = data.data?.customerCreate?.userErrors;
    if (startErrors && startErrors.length > 0) {
        console.error("[OTP] Customer Create UserErrors:", JSON.stringify(startErrors));
        if (startErrors[0].message.includes("taken")) {
            throw new Error("EMAIL_TAKEN");
        }
        throw new Error(startErrors[0].message);
    }

    const customer = data.data?.customerCreate?.customer;
    if (!customer) {
        console.error("[OTP] Create returned no customer and no errors:", JSON.stringify(data));
    }
    return customer;
}

// --- Main Handler ---

export async function POST(request) {
    const { action, email, code } = await request.json();

    if (action === 'send') {
        if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 });

        try {
            // 1. Ensure customer exists & Get ID
            let customer = await findCustomer(email);

            if (!customer) {
                try {
                    customer = await createCustomer(email);
                } catch (e) {
                    if (e.message === 'EMAIL_TAKEN') {
                        console.log("[OTP] Email taken, retrying find...");
                        customer = await findCustomer(email);
                    } else {
                        throw e;
                    }
                }
            }

            if (!customer || !customer.id) {
                console.error("[OTP] Failed to resolve customer ID. Customer object:", customer);
                throw new Error("Failed to resolve customer ID");
            }

            // 2. Generate OTP
            const otp = Math.floor(100000 + Math.random() * 900000).toString();

            // 3. Save OTP + CustomerID
            saveOtp(email, otp, customer.id);

            // 4. Send Email via Nodemailer
            try {
                await sendOTPEmail(email, otp);
                console.log(`[OTP] Email sent successfully to ${email}`);
                return NextResponse.json({ success: true, message: `OTP sent to ${email}` });
            } catch (emailError) {
                console.error(`[OTP] Email send failed:`, emailError);
                // Still log OTP for backup/testing
                console.log(`[OTP] BACKUP - OTP for ${email}: ${otp}`);
                return NextResponse.json({
                    success: true,
                    message: `OTP generated but email failed. Check server console.`,
                    warning: 'Email service unavailable'
                });
            }

        } catch (error) {
            console.error("OTP Send Error:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    }

    if (action === 'verify') {
        if (!email || !code) return NextResponse.json({ error: 'Email and Code required' }, { status: 400 });

        const otpData = verifyOtpStore(email, code);

        if (otpData) {
            let customer;
            if (otpData.customerId) {
                customer = await getCustomerById(otpData.customerId);
            } else {
                customer = await findCustomer(email);
            }

            // Fallback: If still not found (e.g. Backdoor usage for new user, or deletion race cond), create them.
            if (!customer) {
                console.log("[OTP] Verify: Customer not found. Auto-creating...");
                try {
                    customer = await createCustomer(email);
                } catch (e) {
                    if (e.message === 'EMAIL_TAKEN') {
                        console.log("[OTP] Verify: Email taken during fallback creation, retrying find...");
                        customer = await findCustomer(email);
                    } else {
                        throw e;
                    }
                }
            }

            if (!customer) return NextResponse.json({ error: 'Customer not found' }, { status: 400 });

            const sessionToken = await createSession({
                id: customer.id,
                email: customer.email,
                firstName: customer.firstName,
                lastName: customer.lastName
            });

            return NextResponse.json({ success: true, token: sessionToken, customer });
        } else {
            return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 401 });
        }
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
