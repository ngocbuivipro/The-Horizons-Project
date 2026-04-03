// swagger.js
import swaggerAutogen from 'swagger-autogen';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 8800;

const doc = {
    info: {
        title: 'The Horizons API',
        description: 'Comprehensive API documentation for Betel Hospitality Platform (Hotels, Tours, Cruises, Buses)',
        version: '1.0.0',
        contact: {
            name: 'Dev Team',
            email: 'dev@betelhospitality.com'
        }
    },
    // 3. Sử dụng dynamic host dựa trên PORT
    host: `localhost:${PORT}`,
    schemes: ['http', 'https'], // Hỗ trợ cả HTTP và HTTPS
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT'
            }
        }
    },
    security: [{ bearerAuth: [] }],

    // ĐỊNH NGHĨA TAGS ĐỂ PHÂN LOẠI ROUTE TRÊN UI
    tags: [
        { name: 'Auth', description: 'Authentication (Login, Register, Google, OTP)' },
        { name: 'Users', description: 'User profile operations' },
        { name: 'Admin', description: 'Administrative dashboard operations' },
        { name: 'Hotels', description: 'Hotel services, facilities, and management' },
        { name: 'Rooms', description: 'Hotel room inventory' },
        { name: 'cruise', description: 'cruise ships, cabins, and itineraries' },
        { name: 'Bus', description: 'Bus schedules and routes' },
        { name: 'Tour', description: 'Tour packages' },
        { name: 'Booking', description: 'Centralized booking management' },
        { name: 'Payment', description: 'Payment gateway integration (OnePay, Paypal)' },
        { name: 'Upload', description: 'File upload services (Cloudinary)' },
        { name: 'Search', description: 'Global search functionality' },
        { name: 'Public', description: 'Public endpoints' },
        { name: 'Policy', description: 'System policies and terms' }
    ]
};

const outputFile = './swagger-output.json';


const endpointsFiles = ['./index.js'];

swaggerAutogen({openapi: '3.0.0'})(outputFile, endpointsFiles, doc).then(() => {
    console.log(`Swagger JSON generated successfully for port: ${PORT}`);
    console.log(`Run 'npm start' to serve the documentation.`);
});