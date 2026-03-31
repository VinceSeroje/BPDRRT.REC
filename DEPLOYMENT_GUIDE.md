# MCGI DRRT Attendance System - Deployment Guide

## Custom Domain Deployment

This guide will help you deploy your MCGI DRRT Attendance System with a custom domain like `https://attendance.boholdrrt.net`.

---

## Option 1: Netlify (Recommended - Easiest)

### Step 1: Create a Netlify Account
1. Go to [https://www.netlify.com](https://www.netlify.com)
2. Sign up for a free account (you can use GitHub, GitLab, or email)

### Step 2: Deploy Your Site
1. Log in to Netlify
2. Click "Add new site" → "Deploy manually"
3. Drag and drop your project folder (containing index.html, app.js, etc.)
4. Wait for deployment to complete
5. You'll get a default URL like `https://random-name.netlify.app`

### Step 3: Add Your Custom Domain
1. Go to "Site settings" → "Domain management"
2. Click "Add custom domain"
3. Enter your domain: `attendance.boholdrrt.net`
4. Click "Verify" → "Add domain"

### Step 4: Configure DNS
1. Go to your domain registrar (where you bought the domain)
2. Find DNS settings for your domain
3. Add the following records:

   **For subdomain (attendance.boholdrrt.net):**
   | Type | Name | Value |
   |------|------|-------|
   | CNAME | attendance | `your-site-name.netlify.app` |

   **For apex domain (boholdrrt.net):**
   | Type | Name | Value |
   |------|------|-------|
   | A | @ | 75.2.60.5 |

### Step 5: Enable HTTPS
1. Back in Netlify, go to "Domain management"
2. Scroll to "HTTPS"
3. Click "Verify DNS configuration"
4. Once verified, enable "Force HTTPS"

---

## Option 2: Vercel

### Step 1: Create a Vercel Account
1. Go to [https://vercel.com](https://vercel.com)
2. Sign up using GitHub, GitLab, or email

### Step 2: Deploy Your Site
1. Click "Add New..." → "Project"
2. Import your Git repository OR use "Import Git Repository" with your project
3. Configure project settings (usually auto-detected)
4. Click "Deploy"
5. Wait for deployment to complete

### Step 3: Add Custom Domain
1. Go to your project → "Settings" → "Domains"
2. Enter your custom domain: `attendance.boholdrrt.net`
3. Click "Add"

### Step 4: Configure DNS
Add these DNS records at your domain registrar:
| Type | Name | Value |
|------|------|-------|
| CNAME | attendance | `cname.vercel-dns.com` |

---

## Option 3: GitHub Pages (Free with GitHub)

### Step 1: Create a GitHub Repository
1. Go to [https://github.com](https://github.com)
2. Create a new repository (e.g., `mcgi-drrt-attendance`)
3. Upload your project files

### Step 2: Enable GitHub Pages
1. Go to repository "Settings" → "Pages"
2. Under "Source", select "Deploy from a branch"
3. Select "main" branch and "/ (root)" folder
4. Click "Save"
5. Wait a few minutes for deployment

### Step 3: Add Custom Domain
1. In the same "Pages" settings
2. Enter your custom domain: `attendance.boholdrrt.net`
3. Click "Save"
4. Check "Enforce HTTPS"

### Step 4: Configure DNS
Add these DNS records at your domain registrar:
| Type | Name | Value |
|------|------|-------|
| CNAME | attendance | `yourusername.github.io` |

### Step 5: Create CNAME File
Create a file named `CNAME` (no extension) in your repository root with:
```
attendance.boholdrrt.net
```

---

## EmailJS Setup for Verification Emails

To enable real email verification (instead of demo mode), follow these steps:

### Step 1: Create an EmailJS Account
1. Go to [https://www.emailjs.com](https://www.emailjs.com)
2. Sign up for a free account (200 emails/month free)

### Step 2: Add an Email Service
1. Go to "Email Services" → "Add New Service"
2. Select your email provider (Gmail, Outlook, etc.)
3. Follow the connection steps
4. Note your **Service ID** (e.g., `service_xxxxxxx`)

### Step 3: Create an Email Template
1. Go to "Email Templates" → "Create New Template"
2. Design your template with these variables:
   - `{{to_email}}` - Recipient email
   - `{{to_name}}` - Recipient name
   - `{{verification_code}}` - The 6-digit code
   - `{{app_name}}` - App name

**Example Template:**
```
Subject: Your Verification Code - MCGI DRRT Attendance System

Dear {{to_name}},

Your verification code is: {{verification_code}}

This code will expire in 10 minutes.

If you did not request this code, please ignore this email.

Best regards,
{{app_name}}
```

3. Note your **Template ID** (e.g., `template_xxxxxxx`)

### Step 4: Get Your Public Key
1. Go to "Account" → "General"
2. Find your **Public Key** (e.g., `xxxxxxxxxxxxxxx`)

### Step 5: Configure in the App
1. Login as Admin
2. Go to "Settings"
3. Scroll to "Email Configuration (EmailJS)"
4. Enter:
   - Service ID
   - Template ID
   - Public Key
5. Click "Save EmailJS Config"
6. Click "Send Test Email" to verify it works

---

## Important Notes

1. **Local Storage**: This app uses browser localStorage. Data is stored in the user's browser. For multi-device sync, you would need a backend database.

2. **Backup**: Regularly use the "Export All Data" feature to backup your data.

3. **Security**: 
   - Change the default admin password immediately
   - Enable HTTPS on your custom domain
   - Keep your EmailJS credentials secure

4. **Free Tier Limits**:
   - Netlify: 100GB bandwidth/month
   - Vercel: 100GB bandwidth/month
   - GitHub Pages: 100GB bandwidth/month
   - EmailJS: 200 emails/month (free tier)

---

## Troubleshooting

### Domain not working?
1. Wait 24-48 hours for DNS propagation
2. Check DNS records are correct
3. Clear browser cache

### EmailJS not sending?
1. Verify all three credentials are correct
2. Check your email service is connected
3. Test with "Send Test Email" button
4. Check EmailJS dashboard for error logs

### HTTPS not working?
1. Verify DNS is properly configured
2. Wait for certificate provisioning (can take up to 24 hours)
3. Check your hosting provider's SSL settings

---

Need help? Contact your system administrator or refer to the official documentation:
- [Netlify Docs](https://docs.netlify.com/)
- [Vercel Docs](https://vercel.com/docs)
- [GitHub Pages Docs](https://docs.github.com/en/pages)
- [EmailJS Docs](https://www.emailjs.com/docs/)