/* ============================================================
 * Submit API Route
 * Server-side endpoint that validates data and submits to GitHub.
 * POST /api/submit
 * ============================================================ */

import { NextRequest, NextResponse } from 'next/server';
import { validateSubscription } from '@/lib/schema/validator';
import { generateSubscriptionJson, generateFilePath } from '@/lib/json/generator';
import { submitToGitHub } from '@/lib/github/operations';
import { SchemaResourceType } from '@/utils/types';
import type { SubmitPayload } from '@/utils/types';

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as SubmitPayload;

    // Validate payload structure
    if (!body.resourceType || !body.name || !body.data) {
      return NextResponse.json(
        { error: 'Missing required fields: resourceType, name, data' },
        { status: 400 }
      );
    }

    // Only subscriptions supported for now
    if (body.resourceType !== SchemaResourceType.Subscription) {
      return NextResponse.json(
        { error: `Unsupported resource type: ${body.resourceType}` },
        { status: 400 }
      );
    }

    // Server-side validation (defense in depth)
    const validation = validateSubscription(body.data);
    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.errors },
        { status: 400 }
      );
    }

    // Generate JSON
    const jsonContent = generateSubscriptionJson(body.data);
    const filePath = generateFilePath(body.name);

    // Submit to GitHub
    const result = await submitToGitHub(body.name, filePath, jsonContent);

    if (result.success) {
      return NextResponse.json({
        success: true,
        prUrl: result.prUrl,
        prNumber: result.prNumber,
        branchName: result.branchName,
      });
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('Submit API error:', error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
