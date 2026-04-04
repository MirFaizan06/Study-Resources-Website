# Amazon S3 Setup — NotesHub Kashmir

S3 is used for two purposes:
1. **PDF resources** — uploaded by admin or contributors
2. **Board post images + user avatars** — uploaded directly by students via presigned URLs

---

## Step 1: Create an AWS Account

Go to [aws.amazon.com](https://aws.amazon.com) and sign up if you don't have an account.

---

## Step 2: Create an S3 Bucket

1. Open the **S3** service in the AWS Console
2. Click **Create bucket**
3. Settings:
   - **Bucket name:** `noteshub-kashmir-resources` (or your preferred name)
   - **Region:** `ap-south-1` (Mumbai — closest to Kashmir) or your preferred region
   - **Block Public Access:** Uncheck **"Block all public access"** and confirm the warning
     _(Required so uploaded PDFs and images are publicly readable by students)_
4. Click **Create bucket**

---

## Step 3: Add Bucket Policy (Public Read)

1. Open your bucket → **Permissions** tab → **Bucket policy**
2. Paste this policy (replace `YOUR_BUCKET_NAME`):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::YOUR_BUCKET_NAME/*"
    }
  ]
}
```

3. Click **Save**

---

## Step 4: Enable CORS

1. Still in **Permissions** → scroll to **Cross-origin resource sharing (CORS)**
2. Click **Edit** and paste:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["PUT", "GET"],
    "AllowedOrigins": [
      "http://localhost:5173",
      "https://your-netlify-domain.netlify.app",
      "https://www.noteshubkashmir.in"
    ],
    "ExposeHeaders": ["ETag"]
  }
]
```

3. Replace the `AllowedOrigins` entries with your actual domains
4. Click **Save**

---

## Step 5: Create an IAM User

1. Open **IAM** → **Users** → **Create user**
2. Username: `noteshub-s3-user`
3. **Attach policies directly** → search for `AmazonS3FullAccess` and select it
   _(Or create a scoped policy — see below)_
4. Click through to **Create user**

### Scoped Policy (Recommended for Production)

Instead of `AmazonS3FullAccess`, create a custom policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::YOUR_BUCKET_NAME/*"
    }
  ]
}
```

---

## Step 6: Generate Access Keys

1. Click your new IAM user → **Security credentials** tab
2. Scroll to **Access keys** → **Create access key**
3. Use case: **Application running outside AWS**
4. Copy both the **Access key ID** and **Secret access key** — you won't see the secret again

---

## Step 7: Add to Backend `.env`

```env
AWS_REGION="ap-south-1"
AWS_ACCESS_KEY_ID="AKIA..."
AWS_SECRET_ACCESS_KEY="your-secret-access-key"
S3_BUCKET_NAME="noteshub-kashmir-resources"
```

---

## How Uploads Work (Presigned URL Pattern)

The backend never receives file bytes — it only generates short-lived upload URLs:

```
Client → POST /api/board/posts/image-url  →  Backend generates presigned PUT URL
Client → PUT [presigned URL] with file bytes  →  File goes directly to S3
Client → POST /api/board/posts with { imageUrl: fileUrl }  →  Post saved in DB
```

This keeps Railway's bandwidth and memory usage minimal.

---

## Folder Structure in S3

| Prefix | Contents |
|---|---|
| `resources/` | PDF files uploaded by admin/contributors |
| `board/` | Board post images |
| `avatars/` | User profile pictures |

---

## Cost Estimate (Free Tier)

AWS Free Tier (first 12 months) includes:
- **5 GB** S3 storage
- **20,000 GET** requests/month
- **2,000 PUT** requests/month

For a small student platform this is more than sufficient to start.

After free tier: approximately **$0.023/GB/month** for storage + minimal request costs.
