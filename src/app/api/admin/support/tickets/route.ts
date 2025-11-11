import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    const where: any = {};

    if (status && status !== "all") {
      where.status = status;
    }

    if (priority && priority !== "all") {
      where.priority = priority;
    }

    if (category && category !== "all") {
      where.category = category;
    }

    // Handle search separately to avoid complex nested queries
    let tickets;
    if (search && search.trim()) {
      const searchTerm = search.trim();
      // First get tickets that match other filters
      const baseWhere = { ...where };

      tickets = await prisma.supportTicket.findMany({
        where: {
          ...baseWhere,
          OR: [
            { subject: { contains: searchTerm } },
            {
              user: {
                name: { contains: searchTerm }
              }
            },
            {
              user: {
                email: { contains: searchTerm }
              }
            },
          ],
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          messages: {
            orderBy: {
              createdAt: 'desc',
            },
            take: 1, // Get latest message
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
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
    } else {
      // No search, use the regular query
      tickets = await prisma.supportTicket.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          messages: {
            orderBy: {
              createdAt: 'desc',
            },
            take: 1, // Get latest message
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
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
    }

    return NextResponse.json(tickets);
  } catch (error) {
    console.error('Error fetching admin support tickets:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
