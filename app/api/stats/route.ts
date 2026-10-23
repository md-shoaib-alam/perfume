import { NextResponse } from 'next/server';
import { databases, APPWRITE_DATABASE_ID, Query } from '@/lib/appwriteServer';
import { adminGuard } from '@/lib/roles';

export async function GET() {
  const authError = await adminGuard();
  if (authError) return authError;

  try {
    const [prodsRes, ordersRes, reviewsRes] = await Promise.all([
      databases.listDocuments(APPWRITE_DATABASE_ID, 'products', [Query.limit(100)]),
      databases.listDocuments(APPWRITE_DATABASE_ID, 'orders', [Query.limit(100), Query.orderDesc('$createdAt')]),
      databases.listDocuments(APPWRITE_DATABASE_ID, 'reviews', [Query.limit(100)])
    ]);

    const orders = ordersRes.documents as any[];
    const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
    const pendingOrders = orders.filter((o) => o.status === 'pending' || o.status === 'processing').length;

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const past7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return {
        day: days[d.getDay()],
        dateStr: d.toISOString().split('T')[0],
        revenue: 0,
        orders: 0
      };
    });

    orders.forEach((o) => {
      const orderDate = (o.$createdAt || '').split('T')[0];
      const match = past7Days.find((p) => p.dateStr === orderDate);
      if (match) {
        match.revenue += Number(o.totalAmount || 0);
        match.orders += 1;
      }
    });

    const maxDayRevenue = Math.max(...past7Days.map((d) => d.revenue), 1);
    const weeklyTrends = past7Days.map((d) => ({
      day: d.day,
      amt: d.revenue >= 1000 ? `₹${(d.revenue / 1000).toFixed(0)}k` : `₹${d.revenue}`,
      val: d.revenue === 0 ? 8 : Math.max(12, Math.round((d.revenue / maxDayRevenue) * 100))
    }));

    const stockAlerts = (prodsRes.documents as any[]).slice(0, 5).map((p) => ({
      id: p.$id,
      name: p.name,
      volume: p.volume || '100ml',
      stock: Number(p.stock !== undefined ? p.stock : 100),
      isLow: Number(p.stock !== undefined ? p.stock : 100) < 20,
      isPreOrder: Boolean(p.isPreOrder)
    }));

    return NextResponse.json({
      totalRevenue,
      totalOrders: orders.length,
      totalProducts: prodsRes.total,
      totalReviews: reviewsRes.total,
      pendingOrders,
      lowStockProducts: (prodsRes.documents as any[]).filter((p) => Number(p.stock) < 20).length,
      weeklyTrends,
      stockAlerts,
      recentOrders: orders.slice(0, 5).map((o) => ({
        _id: o.$id,
        id: o.$id,
        orderNumber: `NSH-${o.$id.slice(-5).toUpperCase()}`,
        customerName: o.customerName,
        total: Number(o.totalAmount),
        status: o.status,
        createdAt: o.$createdAt
      }))
    });
  } catch (err: any) {
    console.error('API /api/stats GET error:', err);
    return NextResponse.json({ error: err.message || 'Failed to load stats' }, { status: 500 });
  }
}
