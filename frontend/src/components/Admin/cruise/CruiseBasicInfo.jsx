import { Card, Row, Col, Input, Select, InputNumber, DatePicker } from "antd";
import { FaShip } from "react-icons/fa";
import { cities } from "../../../common/common.js";

const CruiseBasicInfo = ({ data, setData }) => {
    const handleChange = (field, value) => {
        setData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <Card title={<><FaShip className="inline mr-2"/> Cruise Information</>} className="shadow-sm rounded-2xl">
            <Row gutter={[24, 24]}>
                <Col span={24} md={12}>
                    <label className="font-semibold block mb-1">Title</label>
                    <Input value={data.title} onChange={e => handleChange('title', e.target.value)} size="large" placeholder="Cruise Name" />
                </Col>
                <Col span={12} md={6}>
                    <label className="font-semibold block mb-1">Type</label>
                    <Select value={data.cruiseType} onChange={v => handleChange('cruiseType', v)} options={["Luxury cruise", "Party cruise", "Adventure cruise", "Family cruise", "Classic cruise"].map(t => ({ label: t, value: t }))} className="w-full" size="large" />
                </Col>
                <Col span={12} md={6}>
                    <label className="font-semibold block mb-1">City / Port</label>
                    <Select showSearch value={data.city} onChange={v => handleChange('city', v)} options={cities.map(c => ({ label: c.name, value: c.name }))} className="w-full" size="large" placeholder="Select City" />
                </Col>
                <Col span={12} md={6}>
                    <label className="font-semibold block mb-1">Duration (Days)</label>
                    <InputNumber min={1} value={data.duration} onChange={v => handleChange('duration', v)} style={{"width": "100%"}} size="large" />
                </Col>
                <Col span={12} md={6}>
                    <label className="font-semibold block mb-1">Starting Price (VND)</label>
                    <InputNumber style={{"width": "100%"}} value={data.price} formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")} className="w-full bg-gray-100" size="large" disabled />
                    <span className="text-xs text-gray-400">* Auto-calculated from lowest cabin price</span>
                </Col>
                <Col span={12} md={6}>
                    <label className="font-semibold block mb-1">Departure Date</label>
                    <DatePicker format="DD/MM/YYYY" value={data.departureTime} onChange={v => handleChange('departureTime', v)} className="w-full" size="large" />
                </Col>
                <Col span={12} md={6}>
                    <label className="font-semibold block mb-1">Launched On</label>
                    <DatePicker format="DD/MM/YYYY" value={data.launchedOn} onChange={v => handleChange('launchedOn', v)} className="w-full" size="large" />
                </Col>
            </Row>
        </Card>
    );
};

export default CruiseBasicInfo;