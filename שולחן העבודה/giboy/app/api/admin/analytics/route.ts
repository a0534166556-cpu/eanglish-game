import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '30d';

    // חישוב תאריכים לפי טווח הזמן
    const now = new Date();
    let startDate: Date;
    
    switch (timeRange) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // נתוני צפיות דף
    const pageViews = await prisma.pageView.findMany({
      where: {
        createdAt: {
          gte: startDate
        }
      }
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const pageViewsToday = await prisma.pageView.count({
      where: {
        createdAt: {
          gte: today
        }
      }
    });

    // נתוני משתמשים
    const totalUsers = await prisma.user.count();
    const newUsersToday = await prisma.user.count({
      where: {
        createdAt: {
          gte: today
        }
      }
    });

    // משתמשים פעילים (התחברו ב-7 ימים האחרונים)
    const activeUsersStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const activeUsers = await prisma.userSession.count({
      where: {
        startTime: {
          gte: activeUsersStart
        }
      }
    });

    // נתוני משחקים
    const gameStats = await prisma.gameStat.findMany();
    const totalGamePlays = gameStats.reduce((sum, stat) => sum + stat.gamesPlayed, 0);
    const averageScore = gameStats.length > 0 
      ? gameStats.reduce((sum, stat) => sum + stat.averageScore, 0) / gameStats.length 
      : 0;

    // משחקים פופולריים
    const popularGames = gameStats
      .sort((a, b) => b.gamesPlayed - a.gamesPlayed)
      .slice(0, 5)
      .map(stat => ({
        name: stat.gameName,
        plays: stat.gamesPlayed,
        averageScore: stat.averageScore
      }));

    // נתוני הכנסות
    const payments = await prisma.payment.findMany({
      where: {
        status: 'completed',
        createdAt: {
          gte: startDate
        }
      }
    });

    const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const subscriptions = await prisma.subscription.count({
      where: {
        status: 'active'
      }
    });

    // הכנסות החודש הנוכחי
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthRevenue = payments
      .filter(payment => payment.createdAt >= currentMonthStart)
      .reduce((sum, payment) => sum + payment.amount, 0);

    // חישוב שיעור המרה
    const conversionRate = totalUsers > 0 ? (subscriptions / totalUsers) * 100 : 0;

    // נתוני ביצועים (סימולציה - בדרך כלל מגיעים מכלי ניטור)
    const performance = {
      pageLoadTime: 1200, // ms
      bounceRate: 35.2, // %
      sessionDuration: 8.5, // minutes
      errorRate: 1.2 // %
    };

    const analytics = {
      pageViews: {
        total: pageViews.length,
        today: pageViewsToday,
        thisWeek: pageViews.filter(pv => pv.createdAt >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)).length,
        thisMonth: pageViews.filter(pv => pv.createdAt >= new Date(now.getFullYear(), now.getMonth(), 1)).length
      },
      users: {
        total: totalUsers,
        active: activeUsers,
        newToday: newUsersToday,
        returning: activeUsers - newUsersToday
      },
      games: {
        totalPlays: totalGamePlays,
        averageScore: Math.round(averageScore),
        popularGames: popularGames
      },
      revenue: {
        total: totalRevenue,
        thisMonth: thisMonthRevenue,
        subscriptions: subscriptions,
        conversions: Math.round(conversionRate * 10) / 10
      },
      performance: performance
    };

    return NextResponse.json({
      success: true,
      analytics: analytics
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch analytics'
    }, { status: 500 });
  }
}
