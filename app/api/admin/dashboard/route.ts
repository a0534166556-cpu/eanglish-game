import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    // בדוק אם המשתמש הוא מנהל
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    
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

    // נתונים כלליים
    const totalUsers = await prisma.user.count();
    const totalGames = await prisma.gameStat.count();
    const totalAchievements = await prisma.achievement.count();
    const totalBugReports = await prisma.bugReport.count();

    // משתמשים חדשים השבוע
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const newUsersThisWeek = await prisma.user.count({
      where: {
        createdAt: {
          gte: oneWeekAgo
        }
      }
    });

    // משחקים השבוע
    const gamesThisWeek = await prisma.gameStat.count({
      where: {
        createdAt: {
          gte: oneWeekAgo
        }
      }
    });

    // דיווחי באגים פתוחים
    const openBugReports = await prisma.bugReport.count({
      where: {
        status: {
          in: ['pending', 'in_progress']
        }
      }
    });

    // דיווחי באגים לפי עדיפות
    const bugReportsByPriority = await prisma.bugReport.groupBy({
      by: ['priority'],
      _count: {
        priority: true
      }
    });

    // משתמשים לפי רמה
    const usersByLevel = await prisma.user.groupBy({
      by: ['level'],
      _count: {
        level: true
      },
      orderBy: {
        level: 'asc'
      }
    });

    // משחקים פופולריים
    const popularGames = await prisma.gameStat.groupBy({
      by: ['gameName'],
      _count: {
        gameName: true
      },
      _sum: {
        gamesPlayed: true
      },
      orderBy: {
        _count: {
          gameName: 'desc'
        }
      },
      take: 10
    });

    // הישגים מושלמים
    const completedAchievements = await prisma.userAchievement.count({
      where: {
        isCompleted: true
      }
    });

    // משתמשים פעילים (שיחקו בשבוע האחרון)
    const activeUsers = await prisma.user.count({
      where: {
        gameStat: {
          some: {
            createdAt: {
              gte: oneWeekAgo
            }
          }
        }
      }
    });

    // סטטיסטיקות משחקים
    const gameStats = await prisma.gameStat.aggregate({
      _sum: {
        gamesPlayed: true,
        gamesWon: true,
        totalScore: true
      },
      _avg: {
        averageScore: true
      }
    });

    // משתמשים עם הכי הרבה נקודות
    const topUsers = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        points: true,
        level: true,
        gamesPlayed: true,
        gamesWon: true
      },
      orderBy: {
        points: 'desc'
      },
      take: 10
    });

    // דיווחי באגים אחרונים
    const recentBugReports = await prisma.bugReport.findMany({
      select: {
        id: true,
        email: true,
        description: true,
        status: true,
        priority: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    });

    // נתונים יומיים (7 ימים אחרונים)
    const dailyStats = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const [users, games, bugReports] = await Promise.all([
        prisma.user.count({
          where: {
            createdAt: {
              gte: date,
              lt: nextDate
            }
          }
        }),
        prisma.gameStat.count({
          where: {
            createdAt: {
              gte: date,
              lt: nextDate
            }
          }
        }),
        prisma.bugReport.count({
          where: {
            createdAt: {
              gte: date,
              lt: nextDate
            }
          }
        })
      ]);

      dailyStats.push({
        date: date.toISOString().split('T')[0],
        users,
        games,
        bugReports
      });
    }

    return NextResponse.json({
      overview: {
        totalUsers,
        totalGames,
        totalAchievements,
        totalBugReports,
        newUsersThisWeek,
        gamesThisWeek,
        openBugReports,
        activeUsers,
        completedAchievements
      },
      gameStats: {
        totalGamesPlayed: gameStats._sum.gamesPlayed || 0,
        totalGamesWon: gameStats._sum.gamesWon || 0,
        totalScore: gameStats._sum.totalScore || 0,
        averageScore: gameStats._avg.averageScore || 0
      },
      bugReports: {
        byPriority: bugReportsByPriority,
        recent: recentBugReports
      },
      users: {
        byLevel: usersByLevel,
        topUsers
      },
      games: {
        popular: popularGames
      },
      dailyStats
    });

  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}


