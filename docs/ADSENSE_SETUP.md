# Google AdSense Setup — NotesHub Kashmir

NotesHub uses Google AdSense to generate revenue that covers server costs and keeps the platform free for students.

Ad slots are already placed in the code — you just need to activate them with your Publisher ID.

---

## Step 1: Apply for Google AdSense

1. Go to [adsense.google.com](https://adsense.google.com)
2. Sign in with a Google account (ideally a dedicated one for the project)
3. Click **Get started** and enter your website URL
4. Complete the application form

**Requirements for approval:**
- Site must have real, original content (you're good — notes platform)
- Site must be live and publicly accessible
- You must own the domain

Approval typically takes 1–14 days.

---

## Step 2: Get Your Publisher ID

Once approved, find your Publisher ID in:
**AdSense → Account → Account information**

It looks like: `ca-pub-1234567890123456`

---

## Step 3: Activate the AdSense Script

Open `frontend/index.html` and find this block (currently commented out):

```html
<!-- Google AdSense — uncomment after approval -->
<!--
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX"
     crossorigin="anonymous"></script>
-->
```

Uncomment it and replace `ca-pub-XXXXXXXXXXXXXXXX` with your real Publisher ID:

```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1234567890123456"
     crossorigin="anonymous"></script>
```

---

## Step 4: Update the AdBanner Component

Open `frontend/src/components/common/AdBanner/index.tsx` and replace the placeholder at the top:

```ts
// Before
const ADSENSE_CLIENT = 'ca-pub-XXXXXXXXXXXXXXXX'

// After
const ADSENSE_CLIENT = 'ca-pub-1234567890123456'
```

---

## Step 5: Create Ad Units and Replace Slot IDs

In AdSense: **Ads → By ad unit → Create new ad unit**

Create the following units and note their **slot IDs** (a string of digits like `0987654321`):

| Ad Unit Name | Format | Used In |
|---|---|---|
| `noteshub-home-between` | Display / Auto | Home page — between sections |
| `noteshub-home-bottom` | Display / Auto | Home page — above footer |
| `noteshub-resources-mid` | Display / Auto | Resources listing — mid-feed |
| `noteshub-board-sidebar` | Display / Vertical | Board page — sidebar |
| `noteshub-board-feed` | Display / Auto | Board page — in-feed (every 5th post) |

Then replace the placeholder slot numbers in these files:

### `frontend/src/pages/Home/index.tsx`
```tsx
// Find and replace slot values:
<AdBanner slot="1234567890" ... />   // noteshub-home-between slot ID
<AdBanner slot="0987654321" ... />   // noteshub-home-bottom slot ID
```

### `frontend/src/pages/Resources/index.tsx`
```tsx
<AdBanner slot="1122334455" ... />   // noteshub-resources-mid slot ID
```

### `frontend/src/pages/Board/index.tsx`
```tsx
<AdBanner slot="1122334455" ... />   // noteshub-board-sidebar slot ID
<AdBanner slot="5566778899" ... />   // noteshub-board-feed slot ID
```

---

## Step 6: Deploy and Verify

1. Deploy the updated frontend to Netlify
2. Wait 24–48 hours for AdSense to start serving ads
3. Check **AdSense → Ads → Overview** to confirm impressions are being recorded

---

## Notes

- In **development mode** (`import.meta.env.DEV === true`), the `AdBanner` component renders placeholder divs instead of real ads — no AdSense calls in dev
- AdSense requires your site to have a **Privacy Policy** page — add one to comply with their terms
- Do not click your own ads — AdSense will flag this as invalid traffic and can ban your account
- Place ads non-intrusively; excessive ads hurt the student experience and your AdSense standing
