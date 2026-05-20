const { calculateWarrantyStatus } = require("../src/utils/warranty");

describe("calculateWarrantyStatus", () => {
  test("returns expired when warranty end date is in the past", () => {
    const result = calculateWarrantyStatus("2026-01-01", new Date("2026-02-01T00:00:00"));
    expect(result.status).toBe("expired");
    expect(result.daysRemaining).toBeLessThan(0);
  });

  test("returns expiring-soon when warranty ends within 30 days", () => {
    const result = calculateWarrantyStatus("2026-05-25", new Date("2026-05-20T00:00:00"));
    expect(result).toEqual({ status: "expiring-soon", daysRemaining: 5 });
  });

  test("returns active when warranty has more than 30 days left", () => {
    const result = calculateWarrantyStatus("2026-08-20", new Date("2026-05-20T00:00:00"));
    expect(result.status).toBe("active");
    expect(result.daysRemaining).toBe(92);
  });
});
