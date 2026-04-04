# Razorpay Donation Setup — NotesHub Kashmir

NotesHub accepts donations to cover server costs and keep the platform free for students. Razorpay Payment Links are the simplest way to accept donations without building a custom checkout.

---

## Step 1: Create a Razorpay Account

1. Go to [razorpay.com](https://razorpay.com)
2. Click **Sign Up** → use your business/personal email
3. Complete KYC verification (required to receive payouts):
   - PAN card
   - Bank account details
   - Business proof (for students/individuals: personal bank account works)

**Note:** Razorpay is available for Indian residents. For international donations you may need Stripe instead.

---

## Step 2: Create a Payment Link

Once your account is active:

1. Go to **Razorpay Dashboard → Payment Links**
2. Click **Create Payment Link**
3. Settings:
   - **Title:** `Support NotesHub Kashmir`
   - **Description:** `Help keep NotesHub free for Kashmiri students. Your donation covers server costs.`
   - **Amount:** Leave blank (let the donor choose) — select **"Accept any amount"**
   - **Expiry:** None (ongoing)
4. Click **Create**
5. Copy the generated link — it looks like: `https://rzp.io/l/noteshub-kashmir`

---

## Step 3: Add to the Footer

Open `frontend/src/components/common/Footer/index.tsx` and replace the placeholder link:

```tsx
// Find:
href="https://rzp.io/l/noteshub-kasmir"

// Replace with your actual link:
href="https://rzp.io/l/noteshub-kashmir"
```

---

## Step 4: Add to the Board Tutorial (Optional)

The Board's first-time tutorial already mentions donations in its final step. The donate button points to the same footer link via the `DONATION_URL` constant. If you want to update it:

Open `frontend/src/pages/Board/BoardTutorial/index.tsx`:

```tsx
// Find and update:
const DONATION_URL = 'https://rzp.io/l/noteshub-kasmir'
```

---

## Step 5: Test the Payment Link

1. Open your Razorpay Payment Link in an incognito browser
2. Enter a test amount and complete payment using a test card (Razorpay test mode)
3. Verify the payment appears in your Razorpay dashboard

---

## Payment Link Customization

From the Razorpay dashboard you can:
- Add your organization logo
- Customize the thank-you message
- Set up email/SMS notifications for new donations
- View all transactions and download reports

---

## Alternative: Stripe (International)

If you need to accept international donations:

1. Create a [Stripe](https://stripe.com) account
2. Use **Stripe Payment Links** (similar workflow)
3. Replace the `rzp.io` link in Footer and BoardTutorial with your Stripe link

---

## Estimated Fees

| Gateway | Fee per Transaction |
|---|---|
| Razorpay (Indian) | 2% + GST |
| Stripe (International) | 2.9% + $0.30 |

For small donations (₹50–₹500), Razorpay fees are minimal and worth it.
