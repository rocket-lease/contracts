import { describe, expect, it } from 'vitest';
import {
  DashboardPeriodSchema,
  DashboardSummaryRequestSchema,
  DashboardSummaryResponseSchema,
  DashboardVehicleDetailResponseSchema,
  DashboardVehicleMetricSchema,
} from '../../src/dashboard/dashboard';

const validUuid = '018f8b3c-4d0e-7000-8000-000000000001';

const vehicleMetric = {
  vehicleId: validUuid,
  brand: 'Toyota',
  model: 'Corolla',
  plate: 'ABC123',
  photoUrl: 'https://example.com/photo.jpg',
  occupancyRatePercent: 42.5,
  occupiedRanges: [
    { startAt: '2026-06-03T00:00:00.000Z', endAt: '2026-06-05T00:00:00.000Z' },
  ],
  revenueCents: 1_500_000,
  reservationCount: 7,
  cancellationRatePercent: 12.5,
  lowOccupancy: false,
};

const summary = {
  period: 'month' as const,
  range: {
    startAt: '2026-06-01T00:00:00.000Z',
    endAt: '2026-06-30T23:59:59.000Z',
  },
  totalVehicles: 5,
  activeReservations: 3,
  monthlyRevenueCents: 9_520_000,
  fleetOccupancyRatePercent: 60,
  cancellationRatePercent: 8,
  reputationScore: 4.8,
  revenueByDay: [
    { date: '2026-06-01', totalCents: 820_000 },
    { date: '2026-06-02', totalCents: 0 },
  ],
  vehicles: [vehicleMetric],
  topVehicles: [vehicleMetric],
  attentionVehicles: [
    {
      vehicleId: validUuid,
      brand: 'Toyota',
      model: 'Corolla',
      plate: 'ABC123',
      upcomingOccupancyRatePercent: 10,
    },
  ],
};

describe('DashboardPeriodSchema', () => {
  it('accepts week, month and quarter', () => {
    expect(DashboardPeriodSchema.parse('week')).toBe('week');
    expect(DashboardPeriodSchema.parse('month')).toBe('month');
    expect(DashboardPeriodSchema.parse('quarter')).toBe('quarter');
  });

  it('rejects an unknown period', () => {
    expect(DashboardPeriodSchema.safeParse('year').success).toBe(false);
  });
});

describe('DashboardSummaryRequestSchema', () => {
  it('defaults period to month', () => {
    expect(DashboardSummaryRequestSchema.parse({})).toEqual({ period: 'month' });
  });

  it('rejects an invalid period', () => {
    expect(
      DashboardSummaryRequestSchema.safeParse({ period: 'decade' }).success,
    ).toBe(false);
  });

  it('accepts a custom period with from/to', () => {
    const parsed = DashboardSummaryRequestSchema.parse({
      period: 'custom',
      from: '2026-05-01T00:00:00.000Z',
      to: '2026-05-31T00:00:00.000Z',
    });
    expect(parsed.period).toBe('custom');
  });

  it('rejects a custom period without dates', () => {
    expect(
      DashboardSummaryRequestSchema.safeParse({ period: 'custom' }).success,
    ).toBe(false);
  });

  it('rejects a custom period with from after to', () => {
    expect(
      DashboardSummaryRequestSchema.safeParse({
        period: 'custom',
        from: '2026-06-10T00:00:00.000Z',
        to: '2026-06-01T00:00:00.000Z',
      }).success,
    ).toBe(false);
  });
});

describe('DashboardVehicleMetricSchema', () => {
  it('parses a valid vehicle metric', () => {
    const parsed = DashboardVehicleMetricSchema.parse(vehicleMetric);
    expect(parsed.vehicleId).toBe(validUuid);
    expect(parsed.lowOccupancy).toBe(false);
  });

  it('accepts a null photoUrl', () => {
    const parsed = DashboardVehicleMetricSchema.parse({
      ...vehicleMetric,
      photoUrl: null,
    });
    expect(parsed.photoUrl).toBeNull();
  });

  it('rejects occupancy above 100', () => {
    expect(
      DashboardVehicleMetricSchema.safeParse({
        ...vehicleMetric,
        occupancyRatePercent: 101,
      }).success,
    ).toBe(false);
  });

  it('rejects a non-uuid vehicleId', () => {
    expect(
      DashboardVehicleMetricSchema.safeParse({
        ...vehicleMetric,
        vehicleId: 'not-a-uuid',
      }).success,
    ).toBe(false);
  });

  it('rejects negative revenue', () => {
    expect(
      DashboardVehicleMetricSchema.safeParse({
        ...vehicleMetric,
        revenueCents: -1,
      }).success,
    ).toBe(false);
  });
});

describe('DashboardSummaryResponseSchema', () => {
  it('parses a full summary', () => {
    const parsed = DashboardSummaryResponseSchema.parse(summary);
    expect(parsed.totalVehicles).toBe(5);
    expect(parsed.revenueByDay).toHaveLength(2);
    expect(parsed.topVehicles).toHaveLength(1);
  });

  it('rejects a cancellation rate above 100', () => {
    expect(
      DashboardSummaryResponseSchema.safeParse({
        ...summary,
        cancellationRatePercent: 150,
      }).success,
    ).toBe(false);
  });
});

describe('DashboardVehicleDetailResponseSchema', () => {
  it('parses a valid vehicle detail', () => {
    const parsed = DashboardVehicleDetailResponseSchema.parse({
      period: 'week',
      range: summary.range,
      vehicle: vehicleMetric,
      revenueByDay: summary.revenueByDay,
      reservationCount: 7,
      cancelledCount: 1,
    });
    expect(parsed.cancelledCount).toBe(1);
    expect(parsed.vehicle.plate).toBe('ABC123');
  });

  it('rejects a negative cancelledCount', () => {
    expect(
      DashboardVehicleDetailResponseSchema.safeParse({
        period: 'week',
        range: summary.range,
        vehicle: vehicleMetric,
        revenueByDay: summary.revenueByDay,
        reservationCount: 7,
        cancelledCount: -1,
      }).success,
    ).toBe(false);
  });
});
