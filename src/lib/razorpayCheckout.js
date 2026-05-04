let scriptPromise;

export function loadRazorpayCheckout() {
  if (window.Razorpay) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = resolve;
    script.onerror = () => reject(new Error("Unable to load Razorpay Checkout."));
    document.head.appendChild(script);
  });

  return scriptPromise;
}

export async function openRazorpayCheckout({ order, keyId, user, onSuccess }) {
  await loadRazorpayCheckout();

  return new Promise((resolve, reject) => {
    const checkout = new window.Razorpay({
      key: keyId,
      amount: order.amount,
      currency: order.currency,
      name: "DrivePDF",
      description: order.planName || "DrivePDF Premium",
      order_id: order.id,
      prefill: {
        name: user?.name,
        email: user?.email,
      },
      theme: {
        color: "#0f172a",
      },
      handler: async (response) => {
        try {
          await onSuccess(response);
          resolve(response);
        } catch (err) {
          reject(err);
        }
      },
      modal: {
        ondismiss: () => resolve(null),
      },
    });

    checkout.open();
  });
}
