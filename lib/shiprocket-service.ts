import { EnvLoader } from './env-loader';

interface ShiprocketConfig {
  token?: string;
  email?: string;
  password?: string;
  baseUrl: string;
}

interface ShiprocketAuthResponse {
  token: string;
  first_name: string;
  last_name: string;
  company_id: number;
}

interface ShiprocketOrderRequest {
  order_id: string;
  order_date: string;
  pickup_location: string;
  billing_customer_name: string;
  billing_last_name: string;
  billing_address: string;
  billing_city: string;
  billing_pincode: string;
  billing_state: string;
  billing_country: string;
  billing_email: string;
  billing_phone: string;
  shipping_is_billing: boolean;
  shipping_customer_name?: string;
  shipping_last_name?: string;
  shipping_address?: string;
  shipping_city?: string;
  shipping_pincode?: string;
  shipping_state?: string;
  shipping_country?: string;
  shipping_email?: string;
  shipping_phone?: string;
  order_items: Array<{
    name: string;
    sku: string;
    units: number;
    selling_price: number;
    discount?: number;
    tax?: number;
    hsn?: number;
  }>;
  payment_method: string;
  shipping_charges: number;
  giftwrap_charges: number;
  transaction_charges: number;
  total_discount: number;
  sub_total: number;
  length: number;
  breadth: number;
  height: number;
  weight: number;
}

interface ShiprocketOrderResponse {
  order_id: number;
  shipment_id: number;
  status: string;
  status_code: number;
  onboarding_completed_now: number;
  awb_code?: string;
  courier_company_id?: number;
  courier_name?: string;
}

interface ShiprocketTrackingResponse {
  tracking_data: {
    track_status: number;
    shipment_status: number;
    shipment_track: Array<{
      id: number;
      awb_code: string;
      courier_company_id: number;
      shipment_id: number;
      order_id: number;
      pickup_date: string;
      delivered_date: string;
      weight: string;
      packages: number;
      current_status: string;
      delivered_to: string;
      destination: string;
      consignee_name: string;
      origin: string;
      courier_agent_details: string;
      edd: string;
    }>;
    shipment_track_activities: Array<{
      date: string;
      status: string;
      activity: string;
      location: string;
      sr_status_label: string;
    }>;
  };
}

export class ShiprocketService {
  private static config: ShiprocketConfig = {
    email: '',
    password: '',
    baseUrl: 'https://apiv2.shiprocket.in/v1/external'
  };

  private static authToken: string | null = null;
  private static tokenExpiry: number | null = null;

  // Clear cached authentication token
  static clearAuthToken() {
    this.authToken = null;
    this.tokenExpiry = null;
    console.log('Cleared cached Shiprocket auth token');
  }

  // Get config with fresh environment variables
  private static getConfig(): ShiprocketConfig {
    // Try manual loading first, then fallback to process.env
    const manualConfig = EnvLoader.getShiprocketConfig();
    
    return {
      token: manualConfig.token || process.env.SHIPROCKET_TOKEN || '',
      email: manualConfig.email || process.env.SHIPROCKET_EMAIL || 'lunarz.info@gmail.com',
      password: manualConfig.password || process.env.SHIPROCKET_PASSWORD || 'Passw0rd@2026#!',
      baseUrl: 'https://apiv2.shiprocket.in/v1/external'
    };
  }

  // Authenticate with Shiprocket
  static async authenticate(): Promise<string> {
    try {
      // Get fresh config with environment variables
      const config = this.getConfig();

      // If we have a token, use it directly (no need to authenticate)
      if (config.token && config.token !== 'your-shiprocket-api-token-here') {
        console.log('=== USING SHIPROCKET TOKEN ===');
        console.log('Token preview:', config.token.substring(0, 10) + '...');
        console.log('==============================');
        return config.token;
      }

      // Check if we have a valid cached token from email/password auth
      if (this.authToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
        console.log('Using cached token from email/password auth');
        return this.authToken;
      }

      // Debug environment variables
      console.log('=== SHIPROCKET AUTHENTICATION DEBUG ===');
      console.log('Has token:', !!config.token && config.token !== 'your-shiprocket-api-token-here');
      console.log('Config email:', config.email ? `${config.email.substring(0, 5)}***` : 'UNDEFINED');
      console.log('Config password:', config.password ? `***${config.password.slice(-3)}` : 'UNDEFINED');
      console.log('Base URL:', config.baseUrl);

      // Check if credentials are configured
      if (!config.email || !config.password) {
        throw new Error('Shiprocket credentials not configured. Please set SHIPROCKET_TOKEN or SHIPROCKET_EMAIL and SHIPROCKET_PASSWORD in your environment variables.');
      }

      console.log('Making authentication request to Shiprocket...');
      
      const authPayload = {
        email: config.email,
        password: config.password,
      };
      
      console.log('Auth payload:', { 
        email: authPayload.email, 
        password: '***' + authPayload.password.slice(-3) 
      });

      const response = await fetch(`${config.baseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'Lunarz-Web/1.0'
        },
        body: JSON.stringify(authPayload),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      const responseText = await response.text();
      console.log('Response body:', responseText);

      if (!response.ok) {
        let errorMessage = `Authentication failed: ${response.status} ${response.statusText}`;
        
        try {
          const errorData = JSON.parse(responseText);
          if (errorData.message) {
            errorMessage += ` - ${errorData.message}`;
          }
          if (errorData.errors) {
            errorMessage += ` - Errors: ${JSON.stringify(errorData.errors)}`;
          }
        } catch (parseError) {
          errorMessage += ` - Raw response: ${responseText}`;
        }
        
        throw new Error(errorMessage);
      }

      let data: ShiprocketAuthResponse;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        throw new Error(`Invalid JSON response from Shiprocket: ${responseText}`);
      }

      console.log('Parsed response data:', {
        hasToken: !!data.token,
        tokenLength: data.token ? data.token.length : 0,
        firstName: data.first_name,
        lastName: data.last_name,
        companyId: data.company_id
      });

      if (!data.token) {
        throw new Error(`No token received from Shiprocket. Response: ${JSON.stringify(data)}`);
      }
      
      this.authToken = data.token;
      // Set token expiry to 23 hours from now (tokens typically last 24 hours)
      this.tokenExpiry = Date.now() + (23 * 60 * 60 * 1000);
      
      console.log('✅ Shiprocket authentication successful');
      console.log('Token expires at:', new Date(this.tokenExpiry).toISOString());
      console.log('========================================');
      
      return data.token;
    } catch (error) {
      console.error('❌ Shiprocket authentication error:', error);
      console.log('========================================');
      throw new Error(`Failed to authenticate with Shiprocket: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Create order in Shiprocket
  static async createOrder(orderData: ShiprocketOrderRequest): Promise<ShiprocketOrderResponse> {
    try {
      const token = await this.authenticate();
      const config = this.getConfig();

      const response = await fetch(`${config.baseUrl}/orders/create/adhoc`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Shiprocket order creation error:', errorData);
        throw new Error(`Order creation failed: ${response.statusText}`);
      }

      const result: ShiprocketOrderResponse = await response.json();
      return result;
    } catch (error) {
      console.error('Error creating Shiprocket order:', error);
      throw error;
    }
  }

  // Track order using AWB code or order ID
  static async trackOrder(awbCode?: string, orderId?: string): Promise<ShiprocketTrackingResponse> {
    try {
      const token = await this.authenticate();
      const config = this.getConfig();
      
      let url = `${config.baseUrl}/courier/track`;
      const params = new URLSearchParams();
      
      if (awbCode) {
        params.append('awb_code', awbCode);
      } else if (orderId) {
        params.append('order_id', orderId);
      } else {
        throw new Error('Either AWB code or Order ID is required for tracking');
      }

      url += `?${params.toString()}`;
      
      console.log('=== SHIPROCKET TRACKING REQUEST ===');
      console.log('URL:', url);
      console.log('Token length:', token.length);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'User-Agent': 'Lunarz-Web/1.0'
        },
      });

      const responseText = await response.text();
      console.log('Tracking response status:', response.status);
      console.log('Tracking response headers:', Object.fromEntries(response.headers.entries()));
      console.log('Tracking response body:', responseText);

      if (!response.ok) {
        // If authentication failed, clear token and retry once
        if (response.status === 401) {
          console.log('Authentication failed, clearing token and retrying...');
          this.clearAuthToken();
          
          // Retry once with fresh authentication
          const newToken = await this.authenticate();
          const retryResponse = await fetch(url, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${newToken}`,
              'Accept': 'application/json',
              'User-Agent': 'Lunarz-Web/1.0'
            },
          });

          const retryResponseText = await retryResponse.text();
          console.log('Retry response status:', retryResponse.status);
          console.log('Retry response body:', retryResponseText);

          if (!retryResponse.ok) {
            throw new Error(`Tracking failed after retry: ${retryResponse.status} ${retryResponse.statusText} - ${retryResponseText}`);
          }

          // Parse retry response
          let retryResult: ShiprocketTrackingResponse;
          try {
            retryResult = JSON.parse(retryResponseText);
          } catch (parseError) {
            throw new Error(`Invalid JSON response from Shiprocket on retry: ${retryResponseText}`);
          }

          console.log('✅ Tracking successful on retry');
          console.log('===================================');
          return retryResult;
        }

        throw new Error(`Tracking failed: ${response.status} ${response.statusText} - ${responseText}`);
      }

      let result: ShiprocketTrackingResponse;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        throw new Error(`Invalid JSON response from Shiprocket: ${responseText}`);
      }

      console.log('✅ Tracking successful');
      console.log('===================================');
      return result;
    } catch (error) {
      console.error('❌ Error tracking Shiprocket order:', error);
      console.log('===================================');
      throw new Error(`Failed to track order: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get all orders
  static async getOrders(page: number = 1, perPage: number = 10) {
    try {
      const token = await this.authenticate();
      const config = this.getConfig();

      const response = await fetch(`${config.baseUrl}/orders?page=${page}&per_page=${perPage}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch orders: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching Shiprocket orders:', error);
      throw error;
    }
  }

  // Cancel order
  static async cancelOrder(orderId: string) {
    try {
      const token = await this.authenticate();
      const config = this.getConfig();

      const response = await fetch(`${config.baseUrl}/orders/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ids: [orderId]
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to cancel order: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error cancelling Shiprocket order:', error);
      throw error;
    }
  }

  // Generate AWB (Air Waybill) for shipment
  static async generateAWB(shipmentId: number, courierId: number) {
    try {
      const token = await this.authenticate();
      const config = this.getConfig();

      const response = await fetch(`${config.baseUrl}/courier/assign/awb`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          shipment_id: shipmentId,
          courier_id: courierId,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to generate AWB: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error generating AWB:', error);
      throw error;
    }
  }

  // Get available couriers for a shipment
  static async getAvailableCouriers(pickupPostcode: string, deliveryPostcode: string, weight: number, codAmount: number = 0) {
    try {
      const token = await this.authenticate();
      const config = this.getConfig();

      const params = new URLSearchParams({
        pickup_postcode: pickupPostcode,
        delivery_postcode: deliveryPostcode,
        weight: weight.toString(),
        cod: codAmount > 0 ? '1' : '0'
      });

      const response = await fetch(`${config.baseUrl}/courier/serviceability/?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get couriers: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching available couriers:', error);
      throw error;
    }
  }

  // Convert order data from your system to Shiprocket format
  static formatOrderForShiprocket(order: any): ShiprocketOrderRequest {
    // Calculate total weight and dimensions (you may need to adjust these based on your products)
    const totalWeight = order.items.reduce((total: number, item: any) => total + (item.quantity * 0.2), 0); // Assuming 200g per item
    
    return {
      order_id: order.id,
      order_date: new Date(order.createdAt).toISOString().split('T')[0],
      pickup_location: "Primary", // You'll need to set this up in Shiprocket dashboard
      billing_customer_name: order.customerInfo.firstName || order.customerInfo.name?.split(' ')[0] || '',
      billing_last_name: order.customerInfo.lastName || order.customerInfo.name?.split(' ').slice(1).join(' ') || '',
      billing_address: order.shippingAddress.address,
      billing_city: order.shippingAddress.city,
      billing_pincode: order.shippingAddress.pincode,
      billing_state: order.shippingAddress.state,
      billing_country: order.shippingAddress.country || 'India',
      billing_email: order.customerInfo.email,
      billing_phone: order.customerInfo.phone,
      shipping_is_billing: true,
      order_items: order.items.map((item: any) => ({
        name: item.product.name,
        sku: item.product.sku || item.product.id,
        units: item.quantity,
        selling_price: item.product.price,
        discount: 0,
        tax: 0,
        hsn: 61091000, // HSN code for t-shirts, adjust as needed
      })),
      payment_method: order.paymentMethod === 'COD' ? 'COD' : 'Prepaid',
      shipping_charges: order.shippingCharges || 0,
      giftwrap_charges: 0,
      transaction_charges: 0,
      total_discount: order.discount || 0,
      sub_total: order.totalAmount,
      length: 25, // cm
      breadth: 20, // cm  
      height: 5,  // cm
      weight: totalWeight, // kg
    };
  }

  // Convert Shiprocket tracking data to your system format
  static formatTrackingData(shiprocketData: ShiprocketTrackingResponse) {
    const trackData = shiprocketData.tracking_data;
    const shipmentTrack = trackData.shipment_track[0];
    const activities = trackData.shipment_track_activities;

    return {
      orderNumber: shipmentTrack?.order_id?.toString() || '',
      trackingNumber: shipmentTrack?.awb_code || '',
      status: this.mapShiprocketStatus(shipmentTrack?.current_status || ''),
      estimatedDelivery: shipmentTrack?.edd || '',
      currentLocation: activities[0]?.location || '',
      carrier: 'Shiprocket',
      orderDate: shipmentTrack?.pickup_date || '',
      customerName: shipmentTrack?.consignee_name || '',
      shippingAddress: shipmentTrack?.destination || '',
      items: [
        {
          name: 'Order Items',
          quantity: shipmentTrack?.packages || 1,
          image: '/placeholder.jpg'
        }
      ],
      statusHistory: activities.map(activity => ({
        status: this.mapShiprocketStatus(activity.status),
        timestamp: new Date(activity.date).toLocaleString('en-IN'),
        location: activity.location,
        description: activity.activity,
        completed: this.isStatusCompleted(activity.status)
      }))
    };
  }

  // Map Shiprocket status to your system status
  private static mapShiprocketStatus(shiprocketStatus: string): string {
    const statusMap: { [key: string]: string } = {
      'Order Confirmed': 'Order Placed',
      'Pickup Generated': 'Processing',
      'Manifested': 'Shipped',
      'In Transit': 'In Transit',
      'Out For Delivery': 'Out for Delivery',
      'Delivered': 'Delivered',
      'RTO Initiated': 'Return Initiated',
      'RTO Delivered': 'Returned',
      'Lost': 'Lost',
      'Damaged': 'Damaged'
    };

    return statusMap[shiprocketStatus] || shiprocketStatus;
  }

  // Check if status is completed
  private static isStatusCompleted(status: string): boolean {
    const completedStatuses = [
      'Order Confirmed',
      'Pickup Generated', 
      'Manifested',
      'In Transit',
      'Delivered'
    ];
    
    return completedStatuses.includes(status);
  }
}

export default ShiprocketService;