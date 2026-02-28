import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getMetrics() {
    const [
      totalUsers,
      totalOrders,
      totalDemands,
      ordersByStatus,
      usersByRole,
      recentActivityCount,
    ] = await this.prisma.$transaction([
      this.prisma.user.count(),
      this.prisma.order.count(),
      this.prisma.demand.count(),
      this.prisma.order.groupBy({ by: ['status'], _count: { id: true } }) as any,
      this.prisma.user.groupBy({ by: ['role'], _count: { id: true } }) as any,
      this.prisma.notification.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    return {
      totalUsers,
      totalOrders,
      totalDemands,
      ordersByStatus: ordersByStatus.map((o) => ({
        status: o.status,
        count: o._count.id,
      })),
      usersByRole: usersByRole.map((u) => ({
        role: u.role,
        count: u._count.id,
      })),
      recentActivityCount,
    };
  }

  async getLogs(page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.notification.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          user: { select: { id: true, name: true, email: true, role: true } },
        },
      }),
      this.prisma.notification.count(),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
