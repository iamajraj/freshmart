import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function DELETE(
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

    // Check if wishlist item exists and belongs to user
    const wishlistItem = await prisma.wishlist.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!wishlistItem) {
      return NextResponse.json(
        { message: 'Wishlist item not found' },
        { status: 404 }
      );
    }

    // Remove from wishlist
    await prisma.wishlist.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Removed from wishlist' });
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
