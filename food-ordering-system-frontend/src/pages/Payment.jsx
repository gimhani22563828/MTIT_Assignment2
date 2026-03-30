import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { CreditCard, CheckCircle, AlertCircle, Truck, Wallet, Copy } from 'lucide-react';

const Payment = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const userId = localStorage.getItem('userId');
    
    const [step, setStep] = useState(1); // 1: method selection, 2: payment form, 3: result
    const [paymentMethod, setPaymentMethod] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [copied, setCopied] = useState(false);
    const [orderData, setOrderData] = useState(null);
    const [orderLoading, setOrderLoading] = useState(true);

    // Form states
    const [formData, setFormData] = useState({
        cardNumber: '',
        cardHolder: '',
        cardExpiry: '',
        cvv: '',
        upiId: '',
        bankName: ''
    });

    const [errors, setErrors] = useState({});

    const paymentOptions = [
        { id: 'card', label: 'Card Payment', icon: '💳', description: 'Credit/Debit Card' },
        { id: 'cash', label: 'Cash on Delivery', icon: '💵', description: 'Pay when you receive' }
    ];

    // Fetch order data on component mount
    useEffect(() => {
        const fetchOrderData = async () => {
            try {
                const response = await api.get(`/orders/details/${orderId}`);
                setOrderData(response.data);
            } catch (error) {
                console.error('Failed to fetch order data:', error);
                // Handle error - maybe redirect back
            } finally {
                setOrderLoading(false);
            }
        };

        if (orderId) {
            fetchOrderData();
        }
    }, [orderId]);

    const banks = [
        'HDFC Bank',
        'ICICI Bank',
        'Axis Bank',
        'SBI',
        'Kotak Bank',
        'IndusInd Bank'
    ];

    const handlePaymentMethodSelect = (methodId) => {
        setPaymentMethod(methodId);
        setFormData({
            cardNumber: '',
            cardHolder: '',
            cardExpiry: '',
            cvv: '',
            upiId: '',
            bankName: ''
        });
        setErrors({});
        setStep(2);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        let formattedValue = value;

        // Format card number with spaces
        if (name === 'cardNumber') {
            formattedValue = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
        }

        // Format expiry as MM/YY
        if (name === 'cardExpiry') {
            formattedValue = value.replace(/\D/g, '');
            if (formattedValue.length >= 2) {
                formattedValue = formattedValue.slice(0, 2) + '/' + formattedValue.slice(2, 4);
            }
        }

        // Limit CVV to 4 digits
        if (name === 'cvv') {
            formattedValue = value.replace(/\D/g, '').slice(0, 4);
        }

        setFormData(prev => ({ ...prev, [name]: formattedValue }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (paymentMethod === 'card') {
            const cleanCardNumber = formData.cardNumber.replace(/\s/g, '');
            if (!/^\d{13,19}$/.test(cleanCardNumber)) {
                newErrors.cardNumber = 'Please enter a valid card number';
            }

            if (!formData.cardHolder || formData.cardHolder.trim().length < 3) {
                newErrors.cardHolder = 'Please enter the cardholder name';
            }

            if (!/^\d{2}\/\d{2}$/.test(formData.cardExpiry)) {
                newErrors.cardExpiry = 'Expiry should be in MM/YY format';
            } else {
                // Check expiry not in the past
                const [mm, yy] = formData.cardExpiry.split('/').map(s => parseInt(s, 10));
                if (mm < 1 || mm > 12) {
                    newErrors.cardExpiry = 'Invalid expiry month';
                } else {
                    const current = new Date();
                    const fullYear = 2000 + yy;
                    const expiryDate = new Date(fullYear, mm, 0, 23, 59, 59);
                    if (expiryDate < current) {
                        newErrors.cardExpiry = 'Card has expired';
                    }
                }
            }

            if (!/^\d{3,4}$/.test(formData.cvv)) {
                newErrors.cvv = 'Please enter a valid CVV';
            }

            setErrors(newErrors);
            return Object.keys(newErrors).length === 0;
        }

        if (paymentMethod === 'cash') {
            setErrors({});
            return true;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const isCardFormValid = () => {
        if (paymentMethod !== 'card') return true;
        const cleanCardNumber = formData.cardNumber.replace(/\s/g, '');
        if (!/^\d{13,19}$/.test(cleanCardNumber)) return false;
        if (!formData.cardHolder || formData.cardHolder.trim().length < 3) return false;
        if (!/^\d{2}\/\d{2}$/.test(formData.cardExpiry)) return false;
        const [mm, yy] = formData.cardExpiry.split('/').map(s => parseInt(s, 10));
        if (isNaN(mm) || isNaN(yy) || mm < 1 || mm > 12) return false;
        const fullYear = 2000 + yy;
        const expiryDate = new Date(fullYear, mm, 0, 23, 59, 59);
        if (expiryDate < new Date()) return false;
        if (!/^\d{3,4}$/.test(formData.cvv)) return false;
        return true;
    };

    const handlePayment = async () => {
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        try {
            const payload = {
                orderId,
                userId,
                amount: orderData?.totalAmount || 0, // Use actual order amount
                paymentMethod,
                cardNumber: formData.cardNumber,
                cardHolder: formData.cardHolder,
                cardExpiry: formData.cardExpiry,
                cvv: formData.cvv,
                upiId: formData.upiId,
                bankName: formData.bankName
            };

            const response = await api.post('/payments', payload);
            setResult(response.data);
            setStep(3);

            // If payment failed, no need to redirect
            if (response.data.status === 'Success') {
                // Show order being prepared message, then redirect
                setTimeout(() => {
                    navigate(`/delivery/${orderId}`);
                }, 4000);
            }
        } catch (error) {
            setResult({
                status: 'Failed',
                errorMessage: error.response?.data?.error || error.message
            });
            setStep(3);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-[100vh] bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
            <div className="max-w-2xl mx-auto">
                {orderLoading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading order details...</p>
                    </div>
                ) : !orderData ? (
                    <div className="text-center py-12">
                        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Order Not Found</h2>
                        <p className="text-gray-600">Unable to load order details. Please try again.</p>
                    </div>
                ) : (
                    <div>
                        {step === 1 && (
                            <div className="animate-fade-in-up">
                                <div className="text-center mb-12">
                            <h1 className="text-4xl font-black text-slate-900 mb-2">Select Payment Method</h1>
                            <p className="text-gray-600">Choose how you'd like to pay for your order</p>
                            <div className="mt-4 inline-block bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-bold">
                                Order ID: {orderId.slice(0, 8)}...
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {paymentOptions.map(option => (
                                <button
                                    key={option.id}
                                    onClick={() => handlePaymentMethodSelect(option.id)}
                                    className="bg-white border-2 border-gray-200 hover:border-primary-500 hover:shadow-lg rounded-2xl p-6 text-left transition-all transform hover:-translate-y-1 cursor-pointer"
                                >
                                    <div className="text-4xl mb-3">{option.icon}</div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-1">{option.label}</h3>
                                    <p className="text-sm text-gray-500">{option.description}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 2: Payment Form */}
                {step === 2 && (
                    <div className="animate-fade-in-up">
                        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
                            <div className="mb-8 flex items-center">
                                <button
                                    onClick={() => setStep(1)}
                                    className="text-primary-600 hover:text-primary-700 font-bold mr-4"
                                >
                                    ← Back
                                </button>
                                <h2 className="text-3xl font-bold text-gray-900 flex-1">
                                    {paymentOptions.find(opt => opt.id === paymentMethod)?.label}
                                </h2>
                            </div>

                            <form onSubmit={(e) => { e.preventDefault(); handlePayment(); }} className="space-y-6">
                                {/* Card Payment Form */}
                                {paymentMethod === 'card' && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Card Number</label>
                                            <input
                                                type="text"
                                                name="cardNumber"
                                                placeholder="1234 5678 9012 3456"
                                                value={formData.cardNumber}
                                                onChange={handleInputChange}
                                                maxLength="19"
                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-primary-500"
                                            />
                                                {errors.cardNumber && (
                                                    <p className="text-red-600 text-sm mt-2">{errors.cardNumber}</p>
                                                )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Cardholder Name</label>
                                            <input
                                                type="text"
                                                name="cardHolder"
                                                placeholder="John Doe"
                                                value={formData.cardHolder}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl uppercase focus:outline-none focus:ring-2 focus:ring-primary-500"
                                            />
                                            {errors.cardHolder && (
                                                <p className="text-red-600 text-sm mt-2">{errors.cardHolder}</p>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-2">Expiry (MM/YY)</label>
                                                <input
                                                    type="text"
                                                    name="cardExpiry"
                                                    placeholder="12/25"
                                                    value={formData.cardExpiry}
                                                    onChange={handleInputChange}
                                                    maxLength="5"
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-center font-mono focus:outline-none focus:ring-2 focus:ring-primary-500"
                                                />
                                                {errors.cardExpiry && (
                                                    <p className="text-red-600 text-sm mt-2">{errors.cardExpiry}</p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-2">CVV</label>
                                                <input
                                                    type="password"
                                                    name="cvv"
                                                    placeholder="123"
                                                    value={formData.cvv}
                                                    onChange={handleInputChange}
                                                    maxLength="4"
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-center font-mono focus:outline-none focus:ring-2 focus:ring-primary-500"
                                                />
                                                {errors.cvv && (
                                                    <p className="text-red-600 text-sm mt-2">{errors.cvv}</p>
                                                )}
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* Cash Payment - No form needed */}
                                {paymentMethod === 'cash' && (
                                    <div className="text-center py-8">
                                        <div className="text-6xl mb-4">💵</div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">Cash on Delivery</h3>
                                        <p className="text-gray-600">You will pay in cash when your order is delivered to your doorstep.</p>
                                    </div>
                                )}

                                {/* Payment Summary */}
                                <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-700">Order Amount</span>
                                        <span className="font-bold text-gray-900">${(orderData?.totalAmount || 0).toFixed(2)}</span>
                                    </div>
                                    <div className="h-px bg-slate-200"></div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-lg font-bold text-gray-900">Total Payable</span>
                                        <span className="text-2xl font-black text-primary-600">${(orderData?.totalAmount || 0).toFixed(2)}</span>
                                    </div>
                                </div>

                                {/* Submit Button - Hide if payment successful */}
                                {(!result || result.status !== 'Success') && (
                                    <button
                                        type="submit"
                                        disabled={loading || (paymentMethod === 'card' && !isCardFormValid())}
                                        className={`w-full py-4 rounded-xl font-bold text-lg text-white transition-all shadow-lg ${
                                            loading || (paymentMethod === 'card' && !isCardFormValid())
                                                ? 'bg-primary-400 cursor-not-allowed'
                                                : 'bg-primary-600 hover:bg-primary-700 transform hover:-translate-y-1'
                                        }`}
                                    >
                                        {loading ? (
                                            <span className="flex items-center justify-center">
                                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Processing Payment...
                                            </span>
                                        ) : (
                                            `Pay $${(orderData?.totalAmount || 0).toFixed(2)} Securely`
                                        )}
                                    </button>
                                )}
                            </form>
                        </div>
                    </div>
                )}

                {/* Step 3: Payment Result */}
                {step === 3 && result && (
                    <div className="animate-fade-in-up">
                        {result.status === 'Success' ? (
                            <div className="bg-white rounded-3xl shadow-2xl p-8 text-center">
                                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-scale-in">
                                    <CheckCircle className="h-12 w-12 text-green-600" />
                                </div>

                                <h2 className="text-4xl font-black text-green-600 mb-2">Payment Successful! 🎉</h2>
                                <p className="text-gray-600 text-lg mb-2">Your order has been confirmed and is <span className="font-bold text-green-700">being prepared</span>.</p>
                                <p className="text-blue-700 text-base mb-8">You will be redirected to delivery tracking soon.</p>

                                {/* Transaction Details */}
                                <div className="bg-slate-50 rounded-2xl p-6 mb-8 text-left space-y-3">
                                    <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                                        <span className="text-gray-700">Transaction ID</span>
                                        <div className="flex items-center gap-2">
                                            <code className="font-mono font-bold text-gray-900">{result.transactionId}</code>
                                            <button
                                                onClick={() => copyToClipboard(result.transactionId)}
                                                className="text-primary-600 hover:text-primary-700"
                                            >
                                                <Copy className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                                        <span className="text-gray-700">Amount Paid</span>
                                        <span className="font-bold text-gray-900">${result.amount.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                                        <span className="text-gray-700">Payment Method</span>
                                        <span className="font-bold text-gray-900 capitalize">
                                            {result.paymentMethod.replace('_', ' ')}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-700">Time</span>
                                        <span className="font-bold text-gray-900">{new Date(result.createdAt).toLocaleString()}</span>
                                    </div>
                                </div>

                                {/* Delivery Info */}
                                <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 mb-8">
                                    <div className="flex items-start gap-3">
                                        <Truck className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                                        <div className="text-left">
                                            <h3 className="font-bold text-blue-900 mb-1">Delivery Being Arranged</h3>
                                            <p className="text-blue-700 text-sm">Your delivery partner will be assigned shortly and you'll receive a notification with their details</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => navigate(`/delivery/${orderId}`)}
                                        className="flex-1 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl transition transform hover:-translate-y-1 flex items-center justify-center gap-2"
                                    >
                                        <Truck className="h-5 w-5" />
                                        Track Delivery
                                    </button>
                                    <button
                                        onClick={() => navigate('/orders')}
                                        className="flex-1 py-3 bg-gray-200 hover:bg-gray-300 text-gray-900 font-bold rounded-xl transition"
                                    >
                                        My Orders
                                    </button>
                                </div>

                                <p className="text-sm text-gray-500 mt-4">Redirecting to delivery tracking in a few seconds...</p>
                            </div>
                        ) : (
                            <div className="bg-white rounded-3xl shadow-2xl p-8 text-center">
                                <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <AlertCircle className="h-12 w-12 text-red-600" />
                                </div>

                                <h2 className="text-4xl font-black text-red-600 mb-2">Payment Failed</h2>
                                <p className="text-gray-600 text-lg mb-6">{result.errorMessage}</p>

                                <div className="bg-red-50 rounded-xl p-4 mb-8 text-left">
                                    <p className="text-red-700 font-medium">
                                        Your payment could not be processed. Please try again or use a different payment method.
                                    </p>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setStep(2)}
                                        className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition"
                                    >
                                        Retry Payment
                                    </button>
                                    <button
                                        onClick={() => { setStep(1); setPaymentMethod(''); }}
                                        className="flex-1 py-3 bg-gray-200 hover:bg-gray-300 text-gray-900 font-bold rounded-xl transition"
                                    >
                                        Change Method
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Payment;
