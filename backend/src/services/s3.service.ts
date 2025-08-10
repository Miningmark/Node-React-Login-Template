import { ENV } from "@/config/env.js";
import { BadRequestError } from "@/errors/badRequestError.js";
import { CreateBucketCommand, DeleteObjectCommand, HeadBucketCommand, PutObjectCommand, GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { Readable } from "stream";

export class S3Service {
    private static instance: S3Service;
    private s3Client: S3Client;

    private constructor() {
        this.s3Client = new S3Client({
            region: "us-east-1",
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
            console.log("BUCKET2");
            await this.s3Client.send(headCommand);
            console.log("BUCKET3");
        } catch (error: any) {
            console.log("BUCKET4");
            if (error.$metadata?.httpStatusCode === 404) {
                console.log("BUCKET5");
                const createCommand = new CreateBucketCommand({ Bucket: bucket });
                console.log("BUCKET6");
                await this.s3Client.send(createCommand);
                console.log("BUCKET7");
            } else {
                console.log("BUCKET8");
                throw error;
            }
        }
    }

    async uploadFile(bucket: string, key: string, body: Buffer, contentType: string): Promise<void> {
        const command = new PutObjectCommand({
            Bucket: bucket,
            Key: key,
            Body: body,
            ContentType: contentType
        });

        console.log("BUCKET1");
        //await this.ensureBucketExists(bucket);
        await this.s3Client.send(command);
    }

    async getFile(bucket: string, key: string): Promise<{ stream: Readable; contentType: string }> {
        const command = new GetObjectCommand({
            Bucket: bucket,
            Key: key
        });

        const response = await this.s3Client.send(command);
        if (response.Body === undefined || response.ContentType === undefined || !(response.Body instanceof Readable)) {
            throw new BadRequestError("Fehler beim Laden der Datei vom S3 Speicher");
        }

        return {
            stream: response.Body,
            contentType: response.ContentType
        };
    }

    async deleteFile(bucket: string, key: string): Promise<void> {
        const command = new DeleteObjectCommand({
            Bucket: bucket,
            Key: key
        });

        await this.s3Client.send(command);
    }
}
