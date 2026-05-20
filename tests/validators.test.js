const {
  validateRegistration,
  validateProduct,
  validateServiceRecord
} = require("../src/utils/validators");

describe("validators", () => {
  test("validates registration fields", () => {
    const errors = validateRegistration({ name: "A", email: "wrong", password: "123" });
    expect(errors).toContain("Name must be at least 2 characters.");
    expect(errors).toContain("A valid email is required.");
    expect(errors).toContain("Password must be at least 6 characters.");
  });

  test("rejects warranty end dates before purchase dates", () => {
    const errors = validateProduct({
      name: "Phone",
      brand: "Apple",
      category: "Electronics",
      purchaseDate: "2026-05-20",
      warrantyEndDate: "2026-05-19"
    });

    expect(errors).toContain("Warranty end date cannot be before purchase date.");
  });

  test("rejects negative service cost", () => {
    const errors = validateServiceRecord({
      productId: 1,
      serviceDate: "2026-05-20",
      provider: "Authorized Service",
      description: "Battery replacement",
      cost: -10
    });

    expect(errors).toContain("Cost cannot be negative.");
  });
});
