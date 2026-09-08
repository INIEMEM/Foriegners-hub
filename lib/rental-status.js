export const rentalStatusCopy = {
  PENDING: {
    label: "Rental started",
    message: "Your rental request has been created.",
    className: "bg-slate-100 text-slate-700",
  },
  CONTRACT_PENDING: {
    label: "Contract needed",
    message: "Please complete the rental agreement before payment.",
    className: "bg-blue-50 text-blue-700",
  },
  AWAITING_PAYMENT: {
    label: "Payment required",
    message: "Submit your local payment to continue.",
    className: "bg-orange-50 text-orange-700",
  },
  PAYMENT_SUBMITTED: {
    label: "Payment being verified",
    message: "Your payment has been submitted and is waiting for admin review.",
    className: "bg-orange-50 text-orange-700",
  },
  PAYMENT_VERIFIED: {
    label: "Payment confirmed",
    message: "Payment has been confirmed and your rental is being activated.",
    className: "bg-green-50 text-green-700",
  },
  ACTIVE: {
    label: "Active rental",
    message: "Your rental is active.",
    className: "bg-green-50 text-green-700",
  },
  EXPIRED: {
    label: "Expired",
    message: "This rental period has ended.",
    className: "bg-slate-100 text-slate-700",
  },
  CANCELLED: {
    label: "Cancelled",
    message: "This rental was cancelled.",
    className: "bg-red-50 text-red-700",
  },
};

export const paymentStatusCopy = {
  AWAITING_PAYMENT: {
    label: "Payment required",
    message: "Transfer payment and submit your confirmation.",
    className: "bg-orange-50 text-orange-700",
  },
  PAYMENT_SUBMITTED: {
    label: "Payment is being verified",
    message: "Foreigners Hub is reviewing your submitted payment.",
    className: "bg-orange-50 text-orange-700",
  },
  VERIFIED: {
    label: "Payment confirmed",
    message: "Your payment has been verified.",
    className: "bg-green-50 text-green-700",
  },
  REJECTED: {
    label: "Payment could not be verified",
    message: "Please contact support or submit a corrected payment reference.",
    className: "bg-red-50 text-red-700",
  },
};

export function getRentalStatusMeta(status) {
  return rentalStatusCopy[status] || {
    label: "Status unavailable",
    message: "We could not determine this rental status.",
    className: "bg-slate-100 text-slate-700",
  };
}

export function getPaymentStatusMeta(status) {
  return paymentStatusCopy[status] || {
    label: "Payment status unavailable",
    message: "We could not determine this payment status.",
    className: "bg-slate-100 text-slate-700",
  };
}

export function getRentalProgress(startDateValue, endDateValue, nowValue = new Date()) {
  if (!startDateValue || !endDateValue) {
    return {
      percent: 0,
      tone: "slate",
      label: "Dates unavailable",
      message: "Rental dates are not available yet.",
      daysUntilReturn: null,
    };
  }

  const startDate = new Date(startDateValue);
  const endDate = new Date(endDateValue);
  const now = new Date(nowValue);

  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return {
      percent: 0,
      tone: "slate",
      label: "Dates unavailable",
      message: "Rental dates could not be read.",
      daysUntilReturn: null,
    };
  }

  const totalMs = Math.max(endDate.getTime() - startDate.getTime(), 1);
  const remainingMs = endDate.getTime() - now.getTime();
  const percent = Math.min(100, Math.max(0, Math.round((remainingMs / totalMs) * 100)));
  const daysUntilReturn = Math.ceil((endDate.getTime() - now.getTime()) / 86400000);

  if (daysUntilReturn <= 0) {
    return {
      percent: 0,
      tone: "red",
      label: "Return due",
      message: "Your expected return date has arrived or passed.",
      daysUntilReturn,
    };
  }

  if (daysUntilReturn <= 2) {
    return {
      percent,
      tone: "red",
      label: "Return date very close",
      message: "Your return date is within the two-day warning window.",
      daysUntilReturn,
    };
  }

  if (daysUntilReturn <= 7) {
    return {
      percent,
      tone: "orange",
      label: "Return date approaching",
      message: "Your return date is coming up soon.",
      daysUntilReturn,
    };
  }

  return {
    percent,
    tone: "green",
    label: "On track",
    message: "Your return date is still comfortably ahead.",
    daysUntilReturn,
  };
}
