# R2 Upload Streaming Fix

## Problem
When uploading files to Cloudflare R2 using the AWS SDK v3, the application encountered the error:
```
Error: Unable to calculate hash for flowing readable stream
```

This occurred because the AWS SDK v3 cannot calculate checksums for flowing readable streams, which is required for the new checksum calculation features in recent SDK versions.

## Root Cause
The code was attempting to stream the file directly to R2:
```typescript
const fileStream = file.stream();
await uploadToR2(r2Key, fileStream, 'application/vnd.android.package-archive');
```

The AWS SDK v3 (versions 3.782.0+) attempts to calculate checksums for uploads to enable features like object lock. However, it cannot calculate hashes for flowing readable streams.

## Solution
Convert the file to a Buffer before uploading to R2. This allows the AWS SDK to calculate the required checksums.

### Changes Made

#### 1. Updated upload route (`app/api/admin/releases/route.ts`)
```typescript
// Before
const fileStream = file.stream();
await uploadToR2(r2Key, fileStream, 'application/vnd.android.package-archive');

// After
const fileBuffer = await file.arrayBuffer();
await uploadToR2(r2Key, Buffer.from(fileBuffer), 'application/vnd.android.package-archive');
```

#### 2. Updated R2 client function signature (`lib/r2/client.ts`)
```typescript
// Before
export async function uploadToR2(key: string, body: Buffer | ReadableStream | Uint8Array, contentType: string)

// After
export async function uploadToR2(key: string, body: Buffer | Uint8Array, contentType: string)
```

## Trade-offs
- **Memory**: Converting to Buffer loads the entire file into memory before upload. For very large files (100MB+), this could be memory-intensive.
- **Simplicity**: This approach is simpler and more reliable than implementing custom streaming with buffered transforms.
- **Reliability**: Eliminates streaming-related errors and checksum calculation issues.

## Alternative Approaches Considered
1. **Custom buffered transform stream**: Would require implementing a custom transform stream to buffer chunks >= 8KB (AWS SDK requirement). More complex and error-prone.
2. **Disable checksum calculation**: Would require configuring the S3 client to disable payload signing and MD5 stream, but this reduces upload integrity verification.
3. **Use multipart upload**: More complex implementation, better for very large files (>100MB).

## Recommendation
For APK files (typically 10-50MB), the Buffer approach is suitable. If the application needs to support files >100MB, consider implementing multipart upload with the AWS SDK.

## References
- AWS SDK v3 Issue: https://github.com/aws/aws-sdk-js-v3/issues/7048
- Cloudflare R2 Streaming: https://files-sdk.dev/adapters/r2
