import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const addMessageSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty'),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const validatedData = addMessageSchema.parse(body);

    // Check if ticket exists and belongs to user
    const ticket = await prisma.supportTicket.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!ticket) {
      return NextResponse.json(
        { message: 'Ticket not found' },
        { status: 404 }
      );
    }

    // Don't allow messages on closed tickets
    if (ticket.status === 'CLOSED') {
      return NextResponse.json(
        { message: 'Cannot add messages to closed tickets' },
        { status: 400 }
      );
    }

    // Create the message
    const message = await prisma.supportMessage.create({
      data: {
        ticketId: id,
        userId: session.user.id,
        message: validatedData.message,
        isFromAdmin: false,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    // Update ticket's updatedAt timestamp
    await prisma.supportTicket.update({
      where: { id },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error('Error adding support message:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Validation error', errors: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
