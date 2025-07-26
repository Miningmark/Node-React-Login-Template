import { ENV } from "@/config/env";
import { CreateBucketCommand, DeleteObjectCommand, HeadBucketCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { Readable } from "stream";

export class S3Service {
    private static instance: S3Service;
    private s3Client: S3Client;

    private constructor() {
        this.s3Client = new S3Client({
            endpoint: ENV.S3_BASE_URL,
            forcePathStyle: true,
            credentials: {
                accessKeyId: ENV.S3_USERNAME,
                secretAccessKey: ENV.S3_PASSWORD
            }
        });
    }

    public static getInstance(): S3Service {
        if (!S3Service.instance) {
            S3Service.instance = new S3Service();
        }
        return S3Service.instance;
    }

    async ensureBucketExists(bucket: string): Promise<void> {
        try {
            const headCommand = new HeadBucketCommand({ Bucket: bucket });
            await this.s3Client.send(headCommand);
            console.log(`Bucket "${bucket}" already exists.`);
        } catch (err: any) {
            if (err.$metadata?.httpStatusCode === 404) {
                console.log(`Bucket "${bucket}" not found. Creating...`);
                const createCommand = new CreateBucketCommand({ Bucket: bucket });
                await this.s3Client.send(createCommand);
                console.log(`Bucket "${bucket}" created.`);
            } else {
                console.error(`Error checking bucket: ${err.message}`);
                throw err;
            }
        }
    }

    async uploadFile(bucket: string, key: string, body: Buffer | Readable, contentType: string): Promise<string> {
        const command = new PutObjectCommand({
            Bucket: bucket,
            Key: key,
            Body: body,
            ContentType: contentType
        });

        await this.s3Client.send(command);
        return `${ENV.S3_BASE_URL}/${bucket}/${key}`;
    }

    async deleteFile(bucket: string, key: string): Promise<void> {
        const command = new DeleteObjectCommand({
            Bucket: bucket,
            Key: key
        });

        await this.s3Client.send(command);
    }
}
