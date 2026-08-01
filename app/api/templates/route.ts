import { NextResponse } from 'next/server';
import { auth } from '../../../auth';
import { getUserTemplates, saveUserTemplates } from '../../../lib/db';

export async function GET(req: Request) {
  try {
    const session = await auth();
    const userEmail = session?.user?.email;

    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const templates = await getUserTemplates(userEmail);
    return NextResponse.json({ success: true, templates });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch templates' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    const userEmail = session?.user?.email;

    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { templates } = await req.json();

    if (!Array.isArray(templates)) {
      return NextResponse.json({ error: 'Invalid templates array' }, { status: 400 });
    }

    await saveUserTemplates(userEmail, templates);
    return NextResponse.json({ success: true, message: 'Templates saved successfully' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to save templates' }, { status: 500 });
  }
}
