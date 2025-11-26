import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    // Get basic stats
    const totalUsers = await prisma.user.count();
    const totalSessions = await prisma.userSession.count();
    const totalPageViews = await prisma.pageView.count();
    const totalConversions = await prisma.conversion.count();
    
    // Get new users (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const newUsers = await prisma.user.count({
      where: { createdAt: { gte: sevenDaysAgo } }
    });
    
    // Get active users (had session in last 7 days)
    const activeUsersResult = await prisma.userSession.findMany({
      where: { startTime: { gte: sevenDaysAgo } },
      select: { userId: true },
      distinct: ['userId']
    });
    const activeUsers = activeUsersResult.length;
    
    // Get average session duration
    const avgSessionResult = await prisma.userSession.aggregate({
      where: { duration: { not: null } },
      _avg: { duration: true }
    });
    const avgSessionDuration = Math.round(avgSessionResult._avg.duration || 0);
    
    // Get top pages
    const topPagesResult = await prisma.pageView.groupBy({
      by: ['page'],
      _count: { page: true },
      orderBy: { _count: { page: 'desc' } },
      take: 10
    });
    const topPages = topPagesResult.map(page => ({
      page: page.page,
      views: page._count.page
    }));
    
    // Get conversions
    const conversionsResult = await prisma.conversion.groupBy({
      by: ['type'],
      _count: { type: true }
    });
    const conversions = conversionsResult.map(conv => ({
      type: conv.type,
      count: conv._count.type
    }));
    
    // Calculate conversion rates
    const signupCount = conversions.find(c => c.type === 'signup')?.count || 0;
    const loginCount = conversions.find(c => c.type === 'login')?.count || 0;
    const signupRate = totalSessions > 0 ? (signupCount / totalSessions) * 100 : 0;
    const loginRate = totalSessions > 0 ? (loginCount / totalSessions) * 100 : 0;

    return NextResponse.json({
      overview: {
        totalUsers,
        totalSessions,
        totalPageViews,
        totalConversions,
        newUsers,
        activeUsers,
        avgSessionDuration,
        signupRate: Math.round(signupRate * 100) / 100,
        loginRate: Math.round(loginRate * 100) / 100,
      },
      topPages,
      conversions,
      userGrowth: [], // Simplified for now
      deviceStats: [], // Simplified for now
      browserStats: [] // Simplified for now
    });
  } catch (error) {
    console.error('Analytics dashboard error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}