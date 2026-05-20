function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).toLowerCase());
}

function isValidDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value))) {
    return false;
  }
  const date = new Date(`${value}T00:00:00`);
  return !Number.isNaN(date.getTime());
}

function validateRegistration(input) {
  const errors = [];

  if (!isNonEmptyString(input.name) || input.name.trim().length < 2) {
    errors.push("Name must be at least 2 characters.");
  }

  if (!isValidEmail(input.email)) {
    errors.push("A valid email is required.");
  }

  if (!isNonEmptyString(input.password) || input.password.length < 6) {
    errors.push("Password must be at least 6 characters.");
  }

  return errors;
}

function validateLogin(input) {
  const errors = [];

  if (!isValidEmail(input.email)) {
    errors.push("A valid email is required.");
  }

  if (!isNonEmptyString(input.password)) {
    errors.push("Password is required.");
  }

  return errors;
}

function validateProduct(input) {
  const errors = [];

  ["name", "brand", "category"].forEach((field) => {
    if (!isNonEmptyString(input[field])) {
      errors.push(`${field} is required.`);
    }
  });

  if (!isValidDate(input.purchaseDate)) {
    errors.push("Purchase date must be a valid date.");
  }

  if (!isValidDate(input.warrantyEndDate)) {
    errors.push("Warranty end date must be a valid date.");
  }

  if (isValidDate(input.purchaseDate) && isValidDate(input.warrantyEndDate)) {
    const purchase = new Date(`${input.purchaseDate}T00:00:00`);
    const warrantyEnd = new Date(`${input.warrantyEndDate}T00:00:00`);
    if (warrantyEnd < purchase) {
      errors.push("Warranty end date cannot be before purchase date.");
    }
  }

  return errors;
}

function validateServiceRecord(input) {
  const errors = [];

  if (!Number.isInteger(Number(input.productId)) || Number(input.productId) <= 0) {
    errors.push("A valid product is required.");
  }

  if (!isValidDate(input.serviceDate)) {
    errors.push("Service date must be a valid date.");
  }

  ["provider", "description"].forEach((field) => {
    if (!isNonEmptyString(input[field])) {
      errors.push(`${field} is required.`);
    }
  });

  if (input.cost !== undefined && input.cost !== "" && Number(input.cost) < 0) {
    errors.push("Cost cannot be negative.");
  }

  return errors;
}

module.exports = {
  isValidDate,
  validateRegistration,
  validateLogin,
  validateProduct,
  validateServiceRecord
};
