import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request, { params }) {
  try {
    const { id: rawId } = await params;
    const id = rawId.toLowerCase();
    const body = await request.json();
    const { option } = body;

    const uppercaseOpt = option?.toUpperCase();
    if (!['A', 'B', 'C'].includes(uppercaseOpt)) {
      return NextResponse.json({ error: 'Invalid option. Must be A, B, or C.' }, { status: 400 });
    }

    // Get current session to find active step
    const session = await prisma.session.findUnique({
      where: { id }
    });

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Insert vote record in database
    await prisma.voteLog.create({
      data: {
        sessionId: id,
        step: session.currentStep,
        option: uppercaseOpt
      }
    });

    // Count all votes for the current step to return live tallies
    const stepVotes = await prisma.voteLog.findMany({
      where: {
        sessionId: id,
        step: session.currentStep
      }
    });

    const tallies = { A: 0, B: 0, C: 0 };
    stepVotes.forEach(v => {
      if (tallies[v.option] !== undefined) {
        tallies[v.option]++;
      }
    });

    return NextResponse.json({
      success: true,
      step: session.currentStep,
      tallies
    }, { status: 200 });
  } catch (error) {
    console.error('Error logging board vote:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
