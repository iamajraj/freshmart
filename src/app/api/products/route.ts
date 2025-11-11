import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createProductSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  price: z.number().positive('Price must be positive'),
  image: z.string().optional(),
  stock: z.number().int().min(0, 'Stock cannot be negative'),
  unit: z.string().default('piece'),
  categoryId: z.string().min(1, 'Category is required'),
  isActive: z.boolean().default(true),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const availability = searchParams.get('availability');
    const sortBy = searchParams.get('sortBy') || 'name';
    const sortOrder = searchParams.get('sortOrder') || 'asc';
    const skip = (page - 1) * limit;

    const where: any = {
      isActive: true,
    };

    if (category && category !== 'all') {
      // Support multiple categories (comma-separated)
      const categoryIds = category.split(',');
      if (categoryIds.length === 1) {
        where.categoryId = categoryIds[0];
      } else {
        where.categoryId = { in: categoryIds };
      }
    }

    if (minPrice) {
      where.price = { ...where.price, gte: parseFloat(minPrice) };
    }

    if (maxPrice) {
      where.price = { ...where.price, lte: parseFloat(maxPrice) };
    }

    if (availability === 'in-stock') {
      where.stock = { gt: 0 };
    } else if (availability === 'out-of-stock') {
      where.stock = { equals: 0 };
    }

    let orderBy: any = { createdAt: 'desc' };

    if (sortBy === 'price') {
      orderBy = { price: sortOrder };
    } else if (sortBy === 'name') {
      orderBy = { name: sortOrder };
    } else if (sortBy === 'popularity') {
      orderBy = { reviews: { _count: sortOrder === 'desc' ? 'desc' : 'asc' } };
    } else if (sortBy === 'newest') {
      orderBy = { createdAt: 'desc' };
    }

    // Handle search separately to avoid conflicts
    let productsQuery = {
      where,
      include: {
        category: true,
        _count: {
          select: { reviews: true },
        },
      },
      skip,
      take: limit,
      orderBy,
    };

    if (search) {
      // When searching, we need to modify the where clause
      productsQuery.where = {
        ...where,
        OR: [
          { name: { contains: search } },
          { description: { contains: search } },
        ],
      };
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany(productsQuery),
      prisma.product.count({ where: productsQuery.where }),
    ]);

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Products fetch error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createProductSchema.parse(body);

    const product = await prisma.product.create({
      data: validatedData,
      include: {
        category: true,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Validation error', errors: error.issues },
        { status: 400 }
      );
    }

    console.error('Product creation error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
