import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    // בדוק אם המשתמש הוא מנהל
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const sortBy = searchParams.get('sortBy') || 'points';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // בדוק אם המשתמש הוא מנהל
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isAdmin: true }
    });

    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: 'Access denied. Admin privileges required.' }, { status: 403 });
    }

    // בנה תנאי חיפוש
    const whereClause = search ? {
      OR: [
        { name: { contains: search, mode: 'insensitive' as const } },
        { email: { contains: search, mode: 'insensitive' as const } }
      ]
    } : {};

    // בנה סדר מיון
    const orderBy = {
      [sortBy]: sortOrder as 'asc' | 'desc'
    };

    // קבל משתמשים עם סטטיסטיקות
    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        points: true,
        level: true,
        gamesPlayed: true,
        gamesWon: true,
        diamonds: true,
        coins: true,
        isAdmin: true,
        createdAt: true,
        updatedAt: true,
        gameStat: {
          select: {
            gameName: true,
            gamesPlayed: true,
            gamesWon: true,
            averageScore: true
          }
        },
        achievements: {
          where: { isCompleted: true },
          select: { id: true }
        }
      },
      orderBy,
      skip: (page - 1) * limit,
      take: limit
    });

    // ספור סה"כ משתמשים
    const totalUsers = await prisma.user.count({ where: whereClause });

    // חשב סטטיסטיקות נוספות
    const usersWithStats = users.map(user => ({
      ...user,
      winRate: user.gamesPlayed > 0 ? Math.round((user.gamesWon / user.gamesPlayed) * 100) : 0,
      totalAchievements: user.achievements.length,
      lastActivity: user.updatedAt
    }));

    return NextResponse.json({
      users: usersWithStats,
      pagination: {
        page,
        limit,
        total: totalUsers,
        totalPages: Math.ceil(totalUsers / limit)
      },
      stats: {
        totalUsers,
        totalPages: Math.ceil(totalUsers / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { userId, targetUserId, action, data } = await req.json();

    if (!userId || !targetUserId || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // בדוק אם המשתמש הוא מנהל
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isAdmin: true }
    });

    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: 'Access denied. Admin privileges required.' }, { status: 403 });
    }

    let result;

    switch (action) {
      case 'update':
        result = await prisma.user.update({
          where: { id: targetUserId },
          data: {
            name: data.name,
            email: data.email,
            level: data.level,
            points: data.points,
            diamonds: data.diamonds,
            coins: data.coins,
            isAdmin: data.isAdmin
          }
        });
        break;

      case 'delete':
        // מחק את המשתמש וכל הנתונים הקשורים
        await prisma.userAchievement.deleteMany({
          where: { userId: targetUserId }
        });
        await prisma.gameStat.deleteMany({
          where: { userId: targetUserId }
        });
        await prisma.learnedWord.deleteMany({
          where: { userId: targetUserId }
        });
        await prisma.houseItem.deleteMany({
          where: { userId: targetUserId }
        });
        await prisma.bugReport.deleteMany({
          where: { email: (await prisma.user.findUnique({ where: { id: targetUserId }, select: { email: true } }))?.email }
        });
        
        result = await prisma.user.delete({
          where: { id: targetUserId }
        });
        break;

      case 'toggleAdmin':
        const currentUser = await prisma.user.findUnique({
          where: { id: targetUserId },
          select: { isAdmin: true }
        });
        
        result = await prisma.user.update({
          where: { id: targetUserId },
          data: { isAdmin: !currentUser?.isAdmin }
        });
        break;

      case 'resetStats':
        result = await prisma.user.update({
          where: { id: targetUserId },
          data: {
            points: 0,
            level: 1,
            gamesPlayed: 0,
            gamesWon: 0,
            diamonds: 100,
            coins: 500
          }
        });
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({ success: true, user: result });

  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}


