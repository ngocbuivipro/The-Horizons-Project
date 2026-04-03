import mongoose from "mongoose";
import { MONGO_URI } from "./config/env.js"; // <-- THÊM: Import MONGO_URI từ file config

// --- SỬA ĐƯỜNG DẪN IMPORT MODEL CHO ĐÚNG VỚI DỰ ÁN CỦA BẠN ---

import ServiceHotel from "./models/hotel/ServiceHotel.js";
import Policy from "./models/Policy.js";
import Hotel from "./models/hotel/Hotel.js";
import Room from "./models/hotel/Room.js"; // Nếu có model Policy

// --- 15 DỮ LIỆU KHÁCH SẠN MẪU ---
const sampleHotels = [
    {
        name: "Melia Ba Vi Mountain Retreat",
        type: "Resort",
        city: "Ha Noi",
        address: "Vườn Quốc Gia Ba Vì, Huyện Ba Vì",
        cheapestPrice: 4500000,
        checkIn: "14:00",
        checkOut: "12:00",
        description: "<p>Khu nghỉ dưỡng sinh thái cao cấp nằm giữa vườn quốc gia Ba Vì.</p>",
        photos: ["https://cf.bstatic.com/xdata/images/hotel/max1024x768/164626284.jpg?k=3f40076205737677567705777626075677526756"],
        roomTypesList: ["Deluxe Room", "Junior Suite", "Family Villa"]
    },
    {
        name: "InterContinental Danang Sun Peninsula",
        type: "Resort",
        city: "Da Nang",
        address: "Bãi Bắc, Bán đảo Sơn Trà",
        cheapestPrice: 8000000,
        checkIn: "15:00",
        checkOut: "12:00",
        description: "<p>Sang trọng bậc nhất châu Á với kiến trúc độc đáo.</p>",
        photos: ["https://cf.bstatic.com/xdata/images/hotel/max1280x900/49563273.jpg?k=..."],
        roomTypesList: ["Classic Room", "Terrace Suite", "Heavenly Penthouse"]
    },
    {
        name: "Dalat Edensee Lake Resort & Spa",
        type: "Resort",
        city: "Da Lat",
        address: "Khu chức năng VII.2, Hồ Tuyền Lâm",
        cheapestPrice: 2200000,
        checkIn: "14:00",
        checkOut: "12:00",
        description: "<p>Ngôi làng Châu Âu thu nhỏ bên hồ Tuyền Lâm thơ mộng.</p>",
        photos: ["https://pix10.agoda.net/hotelImages/287/287332/287332_15062410360030737422.jpg"],
        roomTypesList: ["Mimosa Deluxe", "Jasmine Suite", "Camellia Villa"]
    },
    {
        name: "Rex Hotel Saigon",
        type: "Hotel",
        city: "Ho Chi Minh",
        address: "141 Nguyễn Huệ, Bến Nghé, Quận 1",
        cheapestPrice: 3100000,
        checkIn: "14:00",
        checkOut: "12:00",
        description: "<p>Khách sạn biểu tượng lịch sử ngay phố đi bộ Nguyễn Huệ.</p>",
        photos: ["https://example.com/rex.jpg"],
        roomTypesList: ["Premium", "Governor Suite"]
    },
    {
        name: "Flamingo Dai Lai Resort",
        type: "Resort",
        city: "Vinh Phuc",
        address: "Ngọc Thanh, Phúc Yên",
        cheapestPrice: 1800000,
        checkIn: "14:00",
        checkOut: "12:00",
        description: "<p>Top 10 resort đẹp nhất hành tinh với kiến trúc xanh.</p>",
        photos: ["https://example.com/flamingo.jpg"],
        roomTypesList: ["Forest Villa", "Hilltop Villa", "Lakeview Villa"]
    },
    {
        name: "Legacy Yen Tu - MGallery",
        type: "Hotel",
        city: "Quang Ninh",
        address: "Thượng Yên Công, Uông Bí",
        cheapestPrice: 3500000,
        checkIn: "14:00",
        checkOut: "12:00",
        description: "<p>Tinh hoa kiến trúc cung đình nhà Trần thế kỷ 13.</p>",
        photos: ["https://example.com/legacy.jpg"],
        roomTypesList: ["Superior Room", "Junior Suite"]
    },
    {
        name: "Vinpearl Resort & Spa Nha Trang Bay",
        type: "Resort",
        city: "Khanh Hoa", // Nha Trang thuộc Khánh Hòa
        address: "Đảo Hòn Tre",
        cheapestPrice: 2900000,
        checkIn: "14:00",
        checkOut: "12:00",
        description: "<p>Kỳ nghỉ trọn vẹn bên vịnh biển đẹp bậc nhất thế giới.</p>",
        photos: ["https://example.com/vinpearl.jpg"],
        roomTypesList: ["Deluxe Ocean View", "3-Bedroom Villa"]
    },
    {
        name: "Topas Ecolodge",
        type: "Villa",
        city: "Lao Cai", // Sapa thuộc Lào Cai
        address: "Thanh Kim, Sa Pa, Lào Cai",
        cheapestPrice: 4200000,
        checkIn: "14:00",
        checkOut: "11:00",
        description: "<p>Nằm trên đỉnh đồi với tầm nhìn hùng vĩ xuống thung lũng Mường Hoa.</p>",
        photos: ["https://example.com/topas.jpg"],
        roomTypesList: ["Premium Executive Bungalow", "Suite Bungalow"]
    },
    {
        name: "The Imperial Hotel",
        type: "Hotel",
        city: "Ba Ria - Vung Tau", // Vũng Tàu thuộc Bà Rịa - Vũng Tàu
        address: "159 Thùy Vân, Phường Thắng Tam",
        cheapestPrice: 2600000,
        checkIn: "15:00",
        checkOut: "12:00",
        description: "<p>Khách sạn 5 sao phong cách Victoria cổ điển.</p>",
        photos: ["https://example.com/imperial.jpg"],
        roomTypesList: ["Deluxe", "Grand Suite", "Family Suite"]
    },
    {
        name: "Silk Sense Hoi An River Resort",
        type: "Resort",
        city: "Quang Nam", // Hội An thuộc Quảng Nam
        address: "01 Đống Đa, Cẩm An",
        cheapestPrice: 1900000,
        checkIn: "14:00",
        checkOut: "12:00",
        description: "<p>Nơi lụa là và thiên nhiên giao hòa bên dòng sông Cổ Cò.</p>",
        photos: ["https://example.com/silk.jpg"],
        roomTypesList: ["Superior Garden", "River Suite"]
    },
    {
        name: "JW Marriott Phu Quoc Emerald Bay",
        type: "Resort",
        city: "Kien Giang", // Phú Quốc thuộc Kiên Giang
        address: "Bãi Khem, An Thới",
        cheapestPrice: 7500000,
        checkIn: "15:00",
        checkOut: "12:00",
        description: "<p>Trường đại học giả tưởng Lamarck với thiết kế độc bản.</p>",
        photos: ["https://example.com/jw.jpg"],
        roomTypesList: ["Emerald Bay View", "Le Jardin", "Turquoise Suite"]
    },
    {
        name: "Avana Retreat",
        type: "Resort",
        city: "Hoa Binh",
        address: "Bản Pạnh, Xã Bao La, Mai Châu",
        cheapestPrice: 5500000,
        checkIn: "14:00",
        checkOut: "12:00",
        description: "<p>Ẩn mình giữa núi rừng Tây Bắc với thác nước tự nhiên.</p>",
        photos: ["https://example.com/avana.jpg"],
        roomTypesList: ["Lantana Mountain View", "Ferns Grand Mountain Suite"]
    },
    {
        name: "Azerai La Residence",
        type: "Hotel",
        city: "Thua Thien Hue", // Huế thuộc Thừa Thiên Huế
        address: "5 Lê Lợi, Vĩnh Ninh",
        cheapestPrice: 4800000,
        checkIn: "14:00",
        checkOut: "12:00",
        description: "<p>Biệt thự thống đốc cũ bên dòng sông Hương thơ mộng.</p>",
        photos: ["https://example.com/azerai.jpg"],
        roomTypesList: ["Superior Standard", "Deluxe Colonial"]
    },
    {
        name: "Six Senses Con Dao",
        type: "Villa",
        city: "Ba Ria - Vung Tau",
        address: "Biển Đất Dốc, Côn Đảo",
        cheapestPrice: 12000000,
        checkIn: "15:00",
        checkOut: "12:00",
        description: "<p>Thiên đường nghỉ dưỡng biệt lập và đẳng cấp.</p>",
        photos: ["https://example.com/sixsenses.jpg"],
        roomTypesList: ["Ocean View Duplex", "Ocean Front Villa"]
    },
    {
        name: "Tam Dao Belvedere Resort",
        type: "Resort",
        city: "Vinh Phuc",
        address: "Khu 2, Thị trấn Tam Đảo",
        cheapestPrice: 1500000,
        checkIn: "14:00",
        checkOut: "12:00",
        description: "<p>Tầm nhìn tuyệt đẹp từ bể bơi vô cực trên mây.</p>",
        photos: ["https://example.com/belvedere.jpg"],
        roomTypesList: ["Standard", "Deluxe Room"]
    }
];

const deleteAllData = async () => {
    console.log("🗑️ Deleting all existing Hotel and Room data...");
    const hotelDeletion = Hotel.deleteMany({});
    const roomDeletion = Room.deleteMany({});
    await Promise.all([hotelDeletion, roomDeletion]);
    console.log("✅ All Hotel and Room data deleted.");
};

const seedDB = async () => {
    try {
        // 1. KẾT NỐI DB
        await mongoose.connect(MONGO_URI); // <-- SỬA: Sử dụng biến MONGO_URI đã import
        console.log("🔥 Connected to DB");

        // --- CONFIG: Đặt thành true nếu bạn muốn xóa sạch dữ liệu trước khi seed ---
        const shouldDelete = true;
        if (shouldDelete) {
            await deleteAllData();
        }

        // Tạo Service giả
        let services = await ServiceHotel.find();
        if (services.length === 0) {
            const newServices = await ServiceHotel.insertMany([
                { name: "Wifi Free", icon: "FaWifi" },
                { name: "Swimming Pool", icon: "FaSwimmingPool" },
                { name: "Breakfast", icon: "MdFreeBreakfast" }
            ]);
            services = newServices;
        }
        const serviceIds = services.map(s => s._id);

        // Tạo Policy giả
        let policies = [];
        // Nếu bạn có model Policy thì uncomment đoạn dưới, nếu không thì để array rỗng
        /*
        policies = await Policy.find();
        if (policies.length === 0) {
           policies = await Policy.insertMany([{ name: "No Smoking", type: "House Rule" }]);
        }
        */
        const policyIds = policies.map(p => p._id);


        // 3. LOOP TẠO HOTEL VÀ ROOM (Logic giống controller)
        console.log("🚀 Starting to seed hotels...");

        for (const hotelData of sampleHotels) {
            // FIX: Convert time strings to valid Date objects.
            const checkInTime = new Date(`1970-01-01T${hotelData.checkIn}:00Z`);
            const checkOutTime = new Date(`1970-01-01T${hotelData.checkOut}:00Z`);

            // A. TẠO CÁC ROOM TRƯỚC ĐỂ LẤY ID (FIXED)
            // Thay vì dùng insertMany, ta tạo từng room để đảm bảo plugin slug được kích hoạt
            const tempHotelId = new mongoose.Types.ObjectId();
            const roomIds = [];
            for (const rTypeStr of hotelData.roomTypesList) {
                const newRoom = await Room.create({
                    RoomType: rTypeStr,
                    services: serviceIds,
                    hotel: tempHotelId, // Link tạm thời
                    price: hotelData.cheapestPrice
                });
                roomIds.push(newRoom._id);
            }

            // B. TẠO HOTEL VỚI DANH SÁCH ROOM ID ĐÃ CÓ
            const newHotel = await Hotel.create({
                _id: tempHotelId, // Sử dụng lại ID đã tạo để link chính xác
                name: hotelData.name,
                type: hotelData.type,
                city: hotelData.city,
                address: hotelData.address,
                photos: hotelData.photos,
                description: hotelData.description,
                services: serviceIds,
                policy: policyIds,
                cheapestPrice: hotelData.cheapestPrice,
                checkIn: checkInTime,
                checkOut: checkOutTime,
                roomType: roomIds // Gán mảng ID của các room đã tạo
            });

            console.log(`Created: ${hotelData.name} with ${roomIds.length} rooms.`);
        }

        console.log("Seeding completed successfully!");
        process.exit(0);

    } catch (error) {
        console.error("Seeding failed:", error);
        process.exit(1);
    }
};

// seedDB();
const updateAllHotelsVisibility = async () => {
    try {
        console.log("🔄 Connecting to Database...");

        // 1. Kết nối DB
        await mongoose.connect(MONGO_URI);
        console.log("🔥 Connected to DB successfully");

        // 2. Thực hiện Update
        // updateMany({}, ...) nghĩa là áp dụng cho TẤT CẢ document trong collection
        // $set: { isVisible: true } sẽ thêm field này nếu chưa có, hoặc cập nhật nếu đã có
        const result = await Hotel.updateMany(
            {},
            { $set: { isVisible: true } }
        );

        console.log("------------------------------------------------");
        console.log(`✅ Update hoàn tất!`);
        console.log(`📊 Số lượng khách sạn tìm thấy: ${result.matchedCount}`);
        console.log(`✨ Số lượng khách sạn đã cập nhật: ${result.modifiedCount}`);
        console.log("------------------------------------------------");

        process.exit(0);
    } catch (error) {
        console.error("❌ Có lỗi xảy ra:", error);
        process.exit(1);
    }
};

// Chạy hàm
updateAllHotelsVisibility();