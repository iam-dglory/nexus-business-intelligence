// nexus/backend/src/controllers/bookmarksController.ts
import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { AppError } from '../utils/AppError';

export async function listBookmarks(req: Request, res: Response, next: NextFunction) {
  try {
    const bookmarks = await prisma.bookmark.findMany({
      where: { userId: req.userId! },
      include: {
        company: {
          select: {
            id: true, name: true, slug: true, industry: true,
            businessType: true, valuationLabel: true, growthRate: true,
            city: true, country: true, lat: true, lng: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(bookmarks.map(b => b.company));
  } catch (err) {
    next(err);
  }
}

export async function addBookmark(req: Request, res: Response, next: NextFunction) {
  try {
    const { companyId } = req.params;
    const userId = req.userId!;

    const company = await prisma.company.findUnique({ where: { id: companyId } });
    if (!company) throw new AppError('Company not found', 404);

    await prisma.bookmark.upsert({
      where: { userId_companyId: { userId, companyId } },
      create: { userId, companyId },
      update: {},
    });

    res.status(201).json({ message: 'Bookmarked' });
  } catch (err) {
    next(err);
  }
}

export async function removeBookmark(req: Request, res: Response, next: NextFunction) {
  try {
    const { companyId } = req.params;
    await prisma.bookmark.deleteMany({
      where: { userId: req.userId!, companyId },
    });
    res.json({ message: 'Removed' });
  } catch (err) {
    next(err);
  }
}
