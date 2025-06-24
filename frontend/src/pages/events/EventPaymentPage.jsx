import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ArrowLeft, CreditCard, Shield, CheckCircle, AlertCircle } from 'lucide-react';
import { events } from '../../data/events';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';

const EventPaymentPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, addActivity, getCurrentUser } = useAuth();
  const [event, setEvent] = useState(events.find((e) => e.id === Number(id)));
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    billingAddress: '',
    city: '',
    state: '',
    pincode: ''
  });
  const [errors, setErrors] = useState({});

  // Get registration data from location state
  const registrationData = location.state?.registrationData;

  useEffect(() => {
    if (!event) {
      navigate('/events');
      return;
    }

    if (!user) {
      navigate('/login', { state: { from: `/events/${id}/payment` } });
      return;
    }

    if (!registrationData) {
      navigate(`/events/${id}/register`);
      return;
    }

    // If event is free, redirect directly to success
    if (event.price === 'Free' || event.price === '₹0') {
      handleFreeEventRegistration();
    }
  }, [id, navigate, event, user, registrationData]);

  const handleFreeEventRegistration = () => {
    // Add activity for free event registration
    addActivity(
      'event',
      'Event Registration Completed',
      `Successfully registered for ${event.title}`
    );
    
    setPaymentSuccess(true);
    setTimeout(() => {
      navigate('/dashboard');
    }, 3000);
  };

  if (!event || !registrationData) {
    return null;
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Format card number with spaces
    if (name === 'cardNumber') {
      const formattedValue = value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
      if (formattedValue.length <= 19) { // 16 digits + 3 spaces
        setPaymentData({ ...paymentData, [name]: formattedValue });
      }
    }
    // Format expiry date
    else if (name === 'expiryDate') {
      const formattedValue = value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2');
      if (formattedValue.length <= 5) {
        setPaymentData({ ...paymentData, [name]: formattedValue });
      }
    }
    // Limit CVV to 3 digits
    else if (name === 'cvv') {
      const formattedValue = value.replace(/\D/g, '');
      if (formattedValue.length <= 3) {
        setPaymentData({ ...paymentData, [name]: formattedValue });
      }
    }
    else {
      setPaymentData({ ...paymentData, [name]: value });
    }

    // Clear error when user types
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!paymentData.cardNumber.replace(/\s/g, '') || paymentData.cardNumber.replace(/\s/g, '').length !== 16) {
      newErrors.cardNumber = 'Please enter a valid 16-digit card number';
    }
    
    if (!paymentData.expiryDate || paymentData.expiryDate.length !== 5) {
      newErrors.expiryDate = 'Please enter expiry date in MM/YY format';
    }
    
    if (!paymentData.cvv || paymentData.cvv.length !== 3) {
      newErrors.cvv = 'Please enter a valid 3-digit CVV';
    }
    
    if (!paymentData.cardholderName.trim()) {
      newErrors.cardholderName = 'Cardholder name is required';
    }
    
    if (!paymentData.billingAddress.trim()) {
      newErrors.billingAddress = 'Billing address is required';
    }
    
    if (!paymentData.city.trim()) {
      newErrors.city = 'City is required';
    }
    
    if (!paymentData.state.trim()) {
      newErrors.state = 'State is required';
    }
    
    if (!paymentData.pincode.trim() || paymentData.pincode.length !== 6) {
      newErrors.pincode = 'Please enter a valid 6-digit pincode';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsProcessing(true);
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Add activity to dashboard
      try {
        await fetch('/api/users/activity', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({
            type: 'event',
            title: 'Event Registration & Payment Completed',
            description: `Successfully registered and paid ${event.price} for ${event.title}`,
            relatedId: event.id,
          }),
        });
        await getCurrentUser();
      } catch (activityError) {
        console.error('Failed to add activity:', activityError);
        // Continue with payment success even if activity logging fails
      }
      
      setPaymentSuccess(true);
      setIsProcessing(false);
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        try {
          navigate('/dashboard', { 
            replace: true,
            state: { paymentSuccess: true, eventTitle: event.title }
          });
        } catch (navError) {
          console.error('Navigation failed:', navError);
          setErrors(prev => ({
            ...prev,
            navigation: 'Failed to redirect to dashboard. Please try clicking the button below.'
          }));
        }
      }, 2000);
    } catch (error) {
      console.error('Payment processing error:', error);
      setIsProcessing(false);
      setErrors(prev => ({
        ...prev,
        payment: 'Payment processing failed. Please try again.'
      }));
    }
  };

  // Extract price amount for calculations
  const priceAmount = event.price.replace('₹', '').replace(',', '');
  const numericPrice = parseInt(priceAmount);
  const processingFee = Math.round(numericPrice * 0.02); // 2% processing fee
  const totalAmount = numericPrice + processingFee;

  if (paymentSuccess) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center py-8">
        <div className="max-w-md mx-auto px-4">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
            <p className="text-gray-600 mb-4">
              Your registration for <strong>{event.title}</strong> has been confirmed.
            </p>
            <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
              <p className="text-green-800 font-medium">Amount Paid: {event.price}</p>
              <p className="text-green-700 text-sm">Transaction ID: TXN{Date.now()}</p>
            </div>
            <p className="text-sm text-gray-500 mb-6">
              You will be redirected to your dashboard in a few seconds...
            </p>
            <Button 
              variant="primary" 
              onClick={() => navigate('/dashboard')}
              fullWidth
            >
              Go to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate(`/events/${event.id}/register`)}
          className="mb-6 flex items-center text-blue-600 hover:text-blue-800 transition-colors"
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          Back to Registration
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Form */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow-sm rounded-lg border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                  <CreditCard className="mr-3 h-6 w-6 text-blue-600" />
                  Payment Details
                </h1>
                <p className="text-gray-600 mt-1">Complete your registration by making the payment</p>
              </div>

              <form onSubmit={handlePayment} className="p-6">
                <div className="space-y-6">
                  {/* Card Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Card Information</h3>
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
                          Card Number*
                        </label>
                        <input
                          type="text"
                          id="cardNumber"
                          name="cardNumber"
                          value={paymentData.cardNumber}
                          onChange={handleInputChange}
                          placeholder="1234 5678 9012 3456"
                          className={`block w-full px-3 py-2 border ${
                            errors.cardNumber ? 'border-red-500' : 'border-gray-300'
                          } rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                        />
                        {errors.cardNumber && <p className="mt-1 text-sm text-red-600">{errors.cardNumber}</p>}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-1">
                            Expiry Date*
                          </label>
                          <input
                            type="text"
                            id="expiryDate"
                            name="expiryDate"
                            value={paymentData.expiryDate}
                            onChange={handleInputChange}
                            placeholder="MM/YY"
                            className={`block w-full px-3 py-2 border ${
                              errors.expiryDate ? 'border-red-500' : 'border-gray-300'
                            } rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                          />
                          {errors.expiryDate && <p className="mt-1 text-sm text-red-600">{errors.expiryDate}</p>}
                        </div>
                        <div>
                          <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-1">
                            CVV*
                          </label>
                          <input
                            type="text"
                            id="cvv"
                            name="cvv"
                            value={paymentData.cvv}
                            onChange={handleInputChange}
                            placeholder="123"
                            className={`block w-full px-3 py-2 border ${
                              errors.cvv ? 'border-red-500' : 'border-gray-300'
                            } rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                          />
                          {errors.cvv && <p className="mt-1 text-sm text-red-600">{errors.cvv}</p>}
                        </div>
                      </div>

                      <div>
                        <label htmlFor="cardholderName" className="block text-sm font-medium text-gray-700 mb-1">
                          Cardholder Name*
                        </label>
                        <input
                          type="text"
                          id="cardholderName"
                          name="cardholderName"
                          value={paymentData.cardholderName}
                          onChange={handleInputChange}
                          placeholder="John Doe"
                          className={`block w-full px-3 py-2 border ${
                            errors.cardholderName ? 'border-red-500' : 'border-gray-300'
                          } rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                        />
                        {errors.cardholderName && <p className="mt-1 text-sm text-red-600">{errors.cardholderName}</p>}
                      </div>
                    </div>
                  </div>

                  {/* Billing Address */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Billing Address</h3>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="billingAddress" className="block text-sm font-medium text-gray-700 mb-1">
                          Address*
                        </label>
                        <input
                          type="text"
                          id="billingAddress"
                          name="billingAddress"
                          value={paymentData.billingAddress}
                          onChange={handleInputChange}
                          placeholder="123 Main Street"
                          className={`block w-full px-3 py-2 border ${
                            errors.billingAddress ? 'border-red-500' : 'border-gray-300'
                          } rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                        />
                        {errors.billingAddress && <p className="mt-1 text-sm text-red-600">{errors.billingAddress}</p>}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                            City*
                          </label>
                          <input
                            type="text"
                            id="city"
                            name="city"
                            value={paymentData.city}
                            onChange={handleInputChange}
                            placeholder="Mumbai"
                            className={`block w-full px-3 py-2 border ${
                              errors.city ? 'border-red-500' : 'border-gray-300'
                            } rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                          />
                          {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city}</p>}
                        </div>
                        <div>
                          <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                            State*
                          </label>
                          <input
                            type="text"
                            id="state"
                            name="state"
                            value={paymentData.state}
                            onChange={handleInputChange}
                            placeholder="Maharashtra"
                            className={`block w-full px-3 py-2 border ${
                              errors.state ? 'border-red-500' : 'border-gray-300'
                            } rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                          />
                          {errors.state && <p className="mt-1 text-sm text-red-600">{errors.state}</p>}
                        </div>
                      </div>

                      <div className="w-1/2">
                        <label htmlFor="pincode" className="block text-sm font-medium text-gray-700 mb-1">
                          Pincode*
                        </label>
                        <input
                          type="text"
                          id="pincode"
                          name="pincode"
                          value={paymentData.pincode}
                          onChange={handleInputChange}
                          placeholder="400001"
                          maxLength="6"
                          className={`block w-full px-3 py-2 border ${
                            errors.pincode ? 'border-red-500' : 'border-gray-300'
                          } rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                        />
                        {errors.pincode && <p className="mt-1 text-sm text-red-600">{errors.pincode}</p>}
                      </div>
                    </div>
                  </div>

                  {/* Security Notice */}
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                    <div className="flex items-start">
                      <Shield className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-medium text-blue-900">Secure Payment</h4>
                        <p className="text-sm text-blue-700 mt-1">
                          Your payment information is encrypted and secure. We use industry-standard security measures to protect your data.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4">
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={isProcessing}
                      fullWidth
                      className="py-3 text-lg"
                    >
                      {isProcessing ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Processing Payment...
                        </div>
                      ) : (
                        `Pay ₹${totalAmount.toLocaleString()}`
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow-sm rounded-lg border border-gray-200 sticky top-4">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
                
                {/* Event Details */}
                <div className="mb-6">
                  <div className="flex items-start">
                    <img
                      src={event.imageUrl}
                      alt={event.title}
                      className="h-16 w-16 object-cover rounded-md mr-4"
                    />
                    <div>
                      <h3 className="font-medium text-gray-900 text-sm">{event.title}</h3>
                      <p className="text-gray-600 text-sm">{event.organizer}</p>
                      <p className="text-gray-600 text-sm">{new Date(event.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                {/* Registration Details */}
                <div className="mb-6 border-t border-gray-200 pt-4">
                  <h4 className="font-medium text-gray-900 mb-2">Registration Details</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><span className="font-medium">Name:</span> {registrationData.name}</p>
                    <p><span className="font-medium">Email:</span> {registrationData.email}</p>
                    <p><span className="font-medium">Phone:</span> {registrationData.phone}</p>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Event Fee</span>
                      <span className="text-gray-900">₹{numericPrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Processing Fee</span>
                      <span className="text-gray-900">₹{processingFee}</span>
                    </div>
                    <div className="border-t border-gray-200 pt-2">
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-900">Total</span>
                        <span className="font-medium text-gray-900">₹{totalAmount.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Methods */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600 mb-2">We accept:</p>
                  <div className="flex space-x-2">
                    <div className="bg-gray-100 px-2 py-1 rounded text-xs font-medium">Visa</div>
                    <div className="bg-gray-100 px-2 py-1 rounded text-xs font-medium">Mastercard</div>
                    <div className="bg-gray-100 px-2 py-1 rounded text-xs font-medium">RuPay</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventPaymentPage;