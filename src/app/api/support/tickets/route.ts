import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createTicketSchema = z.object({
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  category: z.enum(['ORDER_ISSUE', 'PRODUCT_QUESTION', 'DELIVERY_PROBLEM', 'PAYMENT_ISSUE', 'ACCOUNT_PROBLEM', 'TECHNICAL_ISSUE', 'OTHER']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional().default('MEDIUM'),
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const tickets = await prisma.supportTicket.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        messages: {
          orderBy: {
            createdAt: 'asc',
          },
          take: 1, // Get latest message for preview
        },
        _count: {
          select: {
            messages: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return NextResponse.json(tickets);
  } catch (error) {
    console.error('Error fetching support tickets:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = createTicketSchema.parse(body);

    // Create the ticket and initial message in a transaction
    const result = await prisma.$transaction(async (prisma) => {
      const ticket = await prisma.supportTicket.create({
        data: {
          userId: session.user.id,
          subject: validatedData.subject,
          category: validatedData.category,
          priority: validatedData.priority,
        },
      });

      const message = await prisma.supportMessage.create({
        data: {
          ticketId: ticket.id,
          userId: session.user.id,
          message: validatedData.message,
          isFromAdmin: false,
        },
      });

      return { ticket, message };
    });

    return NextResponse.json(result.ticket, { status: 201 });
  } catch (error) {
    console.error('Error creating support ticket:', error);

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
