import { State } from "country-state-city";
import unidecode from "unidecode";

// 1. Hàm bỏ dấu tiếng Việt
function removeDiacritics(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

// 2. Lấy danh sách Tỉnh/Thành từ thư viện (Cấp 1)
const libCities = State.getStatesOfCountry("VN").map((city) => ({
    ...city,
    name: removeDiacritics(city.name),
}));

// 3. Danh sách các thành phố/địa danh du lịch bổ sung (Cấp 2 hoặc đặc biệt)
const popularDestinations = [
    { name: "Hoi An", countryCode: "VN", isoCode: "VN-HA" },
    { name: "Da Lat", countryCode: "VN", isoCode: "VN-DL" },
    { name: "Sa Pa", countryCode: "VN", isoCode: "VN-SP" },
    { name: "Ha Long", countryCode: "VN", isoCode: "VN-HL" },
    { name: "Phu Quoc", countryCode: "VN", isoCode: "VN-PQ" },
    { name: "Nha Trang", countryCode: "VN", isoCode: "VN-NT" },
    { name: "Vung Tau", countryCode: "VN", isoCode: "VN-VT" },
    { name: "Mui Ne", countryCode: "VN", isoCode: "VN-MN" },
    { name: "Quy Nhon", countryCode: "VN", isoCode: "VN-QN" },
    { name: "Hue", countryCode: "VN", isoCode: "VN-HUE" },
    { name: "Phan Thiet", countryCode: "VN", isoCode: "VN-PT" },
    { name: "Buon Ma Thuot", countryCode: "VN", isoCode: "VN-BMT" },
    { name: "Con Dao", countryCode: "VN", isoCode: "VN-CD" },
    { name: "Tam Dao", countryCode: "VN", isoCode: "VN-TD" },
    { name: "Moc Chau", countryCode: "VN", isoCode: "VN-MC" },
    { name: "Cam Ranh", countryCode: "VN", isoCode: "VN-CR" },
    { name: "Tuy Hoa", countryCode: "VN", isoCode: "VN-TH" },
    { name: "Dong Hoi", countryCode: "VN", isoCode: "VN-DH" },
    { name: "Pleiku", countryCode: "VN", isoCode: "VN-PL" },
    { name: "Chau Doc", countryCode: "VN", isoCode: "VN-CDC" }
];

// 4. Gộp danh sách -> Lọc trùng -> Sắp xếp A-Z
const allLocations = [...libCities, ...popularDestinations];

const cities = allLocations
    .filter((city, index, self) =>
        index === self.findIndex((t) => t.name === city.name)
    )
    .sort((a, b) => a.name.localeCompare(b.name));


// --- Các hàm tiện ích khác giữ nguyên ---

const searchCity = (citiesArray, value) => {
    return citiesArray.filter((city) =>
        unidecode(city.name).toLowerCase().includes(value.toLowerCase())
    );
}

const changeTime = (text) => {
    const date = new Date(text);
    return new Intl.DateTimeFormat("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Ho_Chi_Minh",
    }).format(date);
}

const isInTimeRange = (x, timeRanges) => {
    return timeRanges.some(range => {
        const [start, end] = range.split(" - ");

        if (end === "00:00") {
            const [startHour, startMinute] = start.split(":").map(Number);
            const [xHour, xMinute] = x.split(":").map(Number);

            const startTime = new Date(0, 0, 0, startHour, startMinute);
            const xTime = new Date(0, 0, 0, xHour, xMinute);

            if (xTime >= startTime) return true;

            const endHour = 6; // "06:00"
            const endMinute = 0;
            const endTime = new Date(0, 0, 0, endHour, endMinute);

            return xTime <= endTime;
        }

        const [startHour, startMinute] = start.split(":").map(Number);
        const [endHour, endMinute] = end.split(":").map(Number);
        const [xHour, xMinute] = x.split(":").map(Number);

        const startTime = new Date(0, 0, 0, startHour, startMinute);
        const endTime = new Date(0, 0, 0, endHour, endMinute);
        const xTime = new Date(0, 0, 0, xHour, xMinute);

        return xTime >= startTime && xTime <= endTime;
    });
}

export {
    removeDiacritics,
    cities,
    searchCity,
    changeTime,
    isInTimeRange
}
