import React from "react";
import api from "../api";

export default function PayButton({ fee }) {
    console.log(fee);

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handlePayment = async () => {
        const amountDue = parseFloat(fee.total_amount) - parseFloat(fee.amount_paid || 0);

        if (amountDue <= 0) {
            alert("No due amount left to pay.");
            return;
        }

        const res = await loadRazorpayScript();
        if (!res) {
            alert("Failed to load Razorpay SDK. Are you online?");
            return;
        }

        try {
            console.log("Creating order with:", {
                amount: Math.round(amountDue),
                currency: "INR",
                receipt: `fee_receipt_${fee.id}`,
            });

            const orderRes = await api.post("/payment/create-order", {
                amount: Math.round(amountDue),
                currency: "INR",
                receipt: `fee_receipt_${fee.id}`,
            });

            const { id: order_id, amount, currency } = orderRes.data;

            const options = {
                key: process.env.REACT_APP_RAZORPAY_KEY_ID,
                amount,
                currency,
                name: "AcadmiVault UFM",
                description: `Payment for Fee ID ${fee.id}`,
                order_id,
                handler: async (response) => {
                    await api.post("/payment/verify-payment", {
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_signature: response.razorpay_signature,
                        student_id: fee.student_id,
                        fee_structure_id: fee.fee_structure_id,
                        student_fee_record_id: fee.id, 
                        amount: fee.total_amount, 
                        user_id: fee.user_id,
                        amount_paid: amount / 100,
                    });

                    alert("Payment Successful!");
                },
                prefill: {
                    name: fee.student_name || "Student",
                    email: "student@example.com",
                    contact: "9999999999",
                },
                theme: {
                    color: "#1A73E8",
                },
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (err) {
            console.error("Payment error:", err.response?.data || err.message);
            alert("Payment failed.");
        }
    };

    return (
        <button
            onClick={handlePayment}
            className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700"
        >
            Pay ₹{(parseFloat(fee.total_amount) - parseFloat(fee.amount_paid || 0)).toLocaleString()}
        </button>
    );
}
