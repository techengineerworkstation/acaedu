import { Redis } from '@upstash/redis';
import { sendEmail, EmailData } from './send';

const redis = process.env.UPSTASH_REDIS_REST_URL
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!
    })
  : null;

const QUEUE_KEY = 'acadion:email:queue';
const PROCESSING_KEY = 'acadion:email:processing';
const FAILED_KEY = 'acadion:email:failed';

export interface QueuedEmail extends EmailData {
  id: string;
  attempts: number;
  createdAt: string;
  scheduledFor?: string;
}

export async function enqueueEmail(email: EmailData, scheduledFor?: Date): Promise<string> {
  const id = `email_${Date.now()}_${Math.random().toString(36).substring(7)}`;

  const queuedEmail: QueuedEmail = {
    ...email,
    id,
    attempts: 0,
    createdAt: new Date().toISOString(),
    scheduledFor: scheduledFor?.toISOString()
  };

  if (redis) {
    await redis.lpush(QUEUE_KEY, JSON.stringify(queuedEmail));
  } else {
    // Fallback: send immediately if no Redis
    await sendEmail(email);
  }

  return id;
}

export async function processEmailQueue(batchSize: number = 10): Promise<number> {
  if (!redis) return 0;

  let processed = 0;

  for (let i = 0; i < batchSize; i++) {
    const raw = await (redis as any).rpoplpush(QUEUE_KEY, PROCESSING_KEY);
    if (!raw) break;

    const email: QueuedEmail = typeof raw === 'string' ? JSON.parse(raw) : raw;

    // Check if scheduled for later
    if (email.scheduledFor && new Date(email.scheduledFor) > new Date()) {
      await redis.lpush(QUEUE_KEY, JSON.stringify(email));
      await redis.lrem(PROCESSING_KEY, 1, JSON.stringify(email));
      continue;
    }

    try {
      const result = await sendEmail(email);

      if (result.success) {
        await redis.lrem(PROCESSING_KEY, 1, JSON.stringify(email));
        processed++;
      } else {
        email.attempts++;
        if (email.attempts >= 3) {
          await redis.lpush(FAILED_KEY, JSON.stringify(email));
        } else {
          await redis.lpush(QUEUE_KEY, JSON.stringify(email));
        }
        await redis.lrem(PROCESSING_KEY, 1, JSON.stringify(email));
      }
    } catch (error) {
      email.attempts++;
      if (email.attempts >= 3) {
        await redis.lpush(FAILED_KEY, JSON.stringify(email));
      } else {
        await redis.lpush(QUEUE_KEY, JSON.stringify(email));
      }
      await redis.lrem(PROCESSING_KEY, 1, JSON.stringify(email));
    }
  }

  return processed;
}

export async function getQueueStats() {
  if (!redis) return { pending: 0, processing: 0, failed: 0 };

  const [pending, processing, failed] = await Promise.all([
    redis.llen(QUEUE_KEY),
    redis.llen(PROCESSING_KEY),
    redis.llen(FAILED_KEY)
  ]);

  return { pending, processing, failed };
}
