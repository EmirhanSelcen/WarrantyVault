function calculateWarrantyStatus(warrantyEndDate, today = new Date()) {
  const end = new Date(`${warrantyEndDate}T00:00:00`);
  const current = new Date(today);
  current.setHours(0, 0, 0, 0);

  const diffMs = end.getTime() - current.getTime();
  const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (Number.isNaN(daysRemaining)) {
    return { status: "unknown", daysRemaining: null };
  }

  if (daysRemaining < 0) {
    return { status: "expired", daysRemaining };
  }

  if (daysRemaining <= 30) {
    return { status: "expiring-soon", daysRemaining };
  }

  return { status: "active", daysRemaining };
}

function enrichProductWithWarranty(product, today) {
  return {
    ...product,
    warranty: calculateWarrantyStatus(product.warranty_end_date, today)
  };
}

module.exports = { calculateWarrantyStatus, enrichProductWithWarranty };
