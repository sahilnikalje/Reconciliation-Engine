const validateRow = (row) => {
  //! Check Transaction ID
  if (!row.transaction_id || row.transaction_id.trim() === "") {
    return { isValid: false, reason: "Missing transaction_id" };
  }

  //! Check Timestamp
  if (!row.timestamp || isNaN(new Date(row.timestamp).getTime())) {
    return { isValid: false, reason: "Missing timestamp" };
  }

  //! Asset name
  if (!row.asset || row.asset.trim() === "") {
    return { isValid: false, reason: "Missing asset" };
  }

  //! Quantity
  if (
    !row.quantity ||
    isNaN(parseFloat(row.quantity)) ||
    parseFloat(row.quantity) <= 0
  ) {
    return { isValid: false, reason: "Invalid or missing quantity" };
  }

  //! Transaction type
  if (!row.type || row.type.trim() === "") {
    return { isValid: false, reason: "Missing transaction_type" };
  }

  return { isValid: true, reason: null };
};

module.exports = { validateRow };
