import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - קבלת כל הבתים של המשתמש
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    console.log('🔵 [houses/GET] Fetching houses for user:', userId);
    
    // בדוק אם prisma קיים
    if (!prisma) {
      console.error('❌ [houses/GET] Prisma client is undefined');
      return NextResponse.json(
        { error: 'Database connection error', details: 'Prisma client not initialized' },
        { status: 500 }
      );
    }
    
    // בדוק אם המודל house קיים - Prisma משתמש בשם קטן-גדול (camelCase)
    // אבל המודל נקרא House, אז Prisma Client צריך להיות prisma.house (lowercase)
    const houseModel = (prisma as any).house;
    if (!houseModel) {
      console.error('❌ [houses/GET] House model not found in Prisma client');
      console.error('❌ [houses/GET] Prisma object keys:', Object.keys(prisma).filter(key => !key.startsWith('_') && !key.startsWith('$')).slice(0, 20));
      return NextResponse.json(
        { error: 'Database model error', details: 'House model not found. The Prisma Client needs to be regenerated. Please restart the server after running: npx prisma generate' },
        { status: 500 }
      );
    }

    // נסה לטעון בתים - פשוט, בלי include מורכב
    let houses;
    try {
      houses = await houseModel.findMany({
        where: { userId },
        orderBy: [
          { isDefault: 'desc' },
          { createdAt: 'asc' }
        ]
      });
      console.log('✅ [houses/GET] Found', houses.length, 'houses');
    } catch (dbError) {
      console.error('❌ [houses/GET] Database error:', dbError);
      throw dbError;
    }

    // אם אין בתים, צור בית ברירת מחדל
    if (houses.length === 0) {
      console.log('📝 [houses/GET] No houses found, creating default house');
      try {
        const defaultHouse = await houseModel.create({
          data: {
            userId,
            name: 'בית שלי',
            isDefault: true
          }
        });
        console.log('✅ [houses/GET] Created default house:', defaultHouse.id);
        return NextResponse.json({ 
          houses: [{
            id: defaultHouse.id,
            userId: defaultHouse.userId,
            name: defaultHouse.name,
            isDefault: defaultHouse.isDefault,
            createdAt: defaultHouse.createdAt.toISOString(),
            updatedAt: defaultHouse.updatedAt.toISOString(),
            houseItems: []
          }]
        });
      } catch (createError) {
        console.error('❌ [houses/GET] Error creating default house:', createError);
        throw createError;
      }
    }

    // טען פריטים לכל בית בנפרד - בצורה בטוחה
    const housesWithItems = await Promise.all(
      houses.map(async (house) => {
        let houseItems: any[] = [];
        try {
          // טען פריטים בלי include תחילה
          const items = await prisma.houseItem.findMany({
            where: { houseId: house.id }
          });
          
          // טען shopItem לכל פריט בנפרד - בצורה בטוחה
          houseItems = await Promise.all(
            items.map(async (item) => {
              let shopItem = null;
              try {
                const shopItemData = await prisma.shopItem.findUnique({
                  where: { id: item.shopItemId },
                  select: {
                    id: true,
                    name: true,
                    description: true,
                    category: true,
                    price: true,
                    icon: true,
                    rarity: true,
                    isActive: true
                  }
                });
                shopItem = shopItemData;
              } catch (shopItemError) {
                console.error(`⚠️ [houses/GET] Error loading shopItem ${item.shopItemId} for house ${house.id}:`, shopItemError);
                shopItem = null;
              }

              return {
                id: item.id,
                userId: item.userId,
                houseId: item.houseId,
                shopItemId: item.shopItemId,
                positionX: item.positionX,
                positionY: item.positionY,
                rotation: item.rotation,
                scale: item.scale,
                isPlaced: item.isPlaced,
                createdAt: item.createdAt?.toISOString() || null,
                updatedAt: item.updatedAt?.toISOString() || null,
                shopItem
              };
            })
          );
        } catch (itemError) {
          console.error(`⚠️ [houses/GET] Error loading items for house ${house.id}:`, itemError);
          houseItems = [];
        }

        return {
          id: house.id,
          userId: house.userId,
          name: house.name,
          isDefault: house.isDefault,
          createdAt: house.createdAt.toISOString(),
          updatedAt: house.updatedAt.toISOString(),
          houseItems
        };
      })
    );
    
    console.log('✅ [houses/GET] Returning', housesWithItems.length, 'houses with items');
    return NextResponse.json({ houses: housesWithItems });
  } catch (error) {
    console.error('❌ [houses/GET] Error fetching houses:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error('❌ [houses/GET] Error details:', errorMessage);
    if (errorStack) {
      console.error('❌ [houses/GET] Error stack:', errorStack);
    }
    return NextResponse.json(
      { 
        error: 'Failed to fetch houses', 
        details: errorMessage,
        message: 'An error occurred while loading your houses. Please try again.'
      },
      { status: 500 }
    );
  }
}

// POST - יצירת בית חדש
export async function POST(request: NextRequest) {
  try {
    const { userId, name } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    console.log('🔵 [houses/POST] Creating house for user:', userId, 'name:', name);

    // בדוק אם המודל house קיים
    const houseModel = (prisma as any).house;
    if (!houseModel) {
      console.error('❌ [houses/POST] House model not found in Prisma client');
      return NextResponse.json(
        { error: 'Database model error', details: 'House model not found. Please restart the server after running: npx prisma generate' },
        { status: 500 }
      );
    }

    // בדוק אם יש בית ברירת מחדל, אם לא - זה יהיה הבית הראשון
    const existingHouses = await houseModel.findMany({
      where: { userId }
    });

    const isDefault = existingHouses.length === 0;

    // צור בית בלי include - נחזיר אותו בצורה פשוטה
    const house = await houseModel.create({
      data: {
        userId,
        name: name || `בית ${existingHouses.length + 1}`,
        isDefault
      }
    });

    console.log('✅ [houses/POST] Created house:', house.id);

    // החזר בית בצורה פשוטה, בלי include מורכב
    return NextResponse.json({ 
      house: {
        id: house.id,
        userId: house.userId,
        name: house.name,
        isDefault: house.isDefault,
        createdAt: house.createdAt.toISOString(),
        updatedAt: house.updatedAt.toISOString(),
        houseItems: []
      }
    });
  } catch (error) {
    console.error('❌ [houses/POST] Error creating house:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('❌ [houses/POST] Error details:', errorMessage);
    return NextResponse.json(
      { 
        error: 'Failed to create house',
        details: errorMessage
      },
      { status: 500 }
    );
  }
}

// PUT - עדכון בית
export async function PUT(request: NextRequest) {
  try {
    const { houseId, name } = await request.json();

    if (!houseId) {
      return NextResponse.json(
        { error: 'House ID is required' },
        { status: 400 }
      );
    }

    // בדוק אם המודל house קיים
    const houseModel = (prisma as any).house;
    if (!houseModel) {
      console.error('❌ [houses/PUT] House model not found in Prisma client');
      return NextResponse.json(
        { error: 'Database model error', details: 'House model not found. Please restart the server after running: npx prisma generate' },
        { status: 500 }
      );
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;

    const house = await houseModel.update({
      where: { id: houseId },
      data: updateData
    });

    // החזר בית בצורה פשוטה
    return NextResponse.json({ 
      house: {
        id: house.id,
        userId: house.userId,
        name: house.name,
        isDefault: house.isDefault,
        createdAt: house.createdAt.toISOString(),
        updatedAt: house.updatedAt.toISOString(),
        houseItems: []
      }
    });
  } catch (error) {
    console.error('❌ [houses/PUT] Error updating house:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update house',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

// DELETE - מחיקת בית
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const houseId = searchParams.get('houseId');

    if (!houseId) {
      return NextResponse.json(
        { error: 'House ID is required' },
        { status: 400 }
      );
    }

    // בדוק אם המודל house קיים
    const houseModel = (prisma as any).house;
    if (!houseModel) {
      console.error('❌ [houses/DELETE] House model not found in Prisma client');
      return NextResponse.json(
        { error: 'Database model error', details: 'House model not found. Please restart the server after running: npx prisma generate' },
        { status: 500 }
      );
    }

    // בדוק אם זה בית ברירת מחדל - לא ניתן למחוק אותו
    const house = await houseModel.findUnique({
      where: { id: houseId }
    });

    if (house?.isDefault) {
      return NextResponse.json(
        { error: 'Cannot delete default house' },
        { status: 400 }
      );
    }

    await houseModel.delete({
      where: { id: houseId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting house:', error);
    return NextResponse.json(
      { error: 'Failed to delete house' },
      { status: 500 }
    );
  }
}

