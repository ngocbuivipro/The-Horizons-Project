import { useState } from 'react';
import { Modal, Form, Input, InputNumber, Select, Upload, message, Row, Col } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { createCabinApi } from "../../api/client/service.api.js";
import { uploadByFilesApi } from "../../api/client/api.js";

const { TextArea } = Input;

const CabinCreateModal = ({ visible, onClose, onSuccess }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [fileList, setFileList] = useState([]);

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);

            let photoUrls = [];
            if (fileList.length > 0) {
                const formData = new FormData();
                fileList.forEach(file => {
                    if (file.originFileObj) formData.append("photos", file.originFileObj);
                });

                if (formData.has("photos")) {
                    const uploadRes = await uploadByFilesApi(formData);
                    if (uploadRes.success) {
                        photoUrls = uploadRes.data.map(item => item.url);
                    }
                }
            }

            const payload = {
                name: values.name,
                viewType: values.viewType,
                pricePerNight: values.pricePerNight,
                description: values.description,
                amenities: values.amenities,
                specifications: {
                    size: values.size,
                    maxGuests: values.maxGuests
                },
                photos: photoUrls.length > 0 ? photoUrls : [],
            };

            const res = await createCabinApi(payload);

            if (res && res.success) {
                message.success("Đã tạo mẫu Cabin mới!");
                form.resetFields();
                setFileList([]);
                if (onSuccess) onSuccess();
                onClose();
            } else {
                message.error(res.message || "Lỗi khi tạo Cabin");
            }
        } catch (error) {
            console.error("Submit Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUploadChange = ({ fileList: newFileList }) => setFileList(newFileList);

    return (
        <Modal
            title={<div className="text-xl font-bold text-gray-800">Tạo Mẫu Cabin (Template)</div>}
            open={visible}
            onOk={handleOk}
            onCancel={onClose}
            confirmLoading={loading}
            width={800} // Tăng độ rộng để bố cục thoáng hơn
            centered // Căn giữa màn hình
            okText="Lưu vào thư viện"
            cancelText="Hủy bỏ"
            maskClosable={false}
            okButtonProps={{ size: 'large', className: 'bg-indigo-600' }}
            cancelButtonProps={{ size: 'large' }}
        >
            <Form
                form={form}
                layout="vertical"
                initialValues={{ viewType: "Ocean View", amenities: [] }}
                className="mt-4"
                requiredMark="optional" // Bỏ dấu sao đỏ, nhìn clean hơn (antd sẽ vẫn constants)
            >
                {/* HÀNG 1: THÔNG TIN CƠ BẢN */}
                <Row gutter={24}>
                    <Col span={16}>
                        <Form.Item
                            name="name"
                            label={<span className="font-semibold text-gray-600">Tên loại phòng</span>}
                            rules={[{ required: true, message: 'Vui lòng nhập tên phòng' }]}
                        >
                            <Input placeholder="Ví dụ: Deluxe Ocean Balcony Suite" size="large" />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            name="viewType"
                            label={<span className="font-semibold text-gray-600">Loại View</span>}
                        >
                            <Select
                                size="large"
                                options={["Ocean View", "City View", "Internal", "Suite", "Balcony"].map(v => ({label: v, value: v}))}
                            />
                        </Form.Item>
                    </Col>
                </Row>

                {/* HÀNG 2: THÔNG SỐ KỸ THUẬT & GIÁ */}
                <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-100">
                    <Row gutter={24}>
                        <Col span={10}>
                            <Form.Item
                                name="pricePerNight"
                                label={<span className="font-semibold text-gray-600">Giá theo đêm (VND)</span>}
                                rules={[{ required: true, message: 'Vui lòng nhập giá' }]}
                                className="mb-0" // Remove bottom margin inside container
                            >
                                <InputNumber
                                    className="w-full"
                                    size="large"
                                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    parser={value => value.replace(/\$\s?|(,*)/g, '')}
                                    min={0}
                                    style={{"width" : "100%"}}
                                    placeholder="0"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={7}>
                            <Form.Item
                                name="size"
                                label={<span className="font-semibold text-gray-600">Diện tích (m²)</span>}
                                className="mb-0"
                            >
                                <InputNumber className="w-full" style={{"width" : "100%"}} size="large" min={1} placeholder="25" />
                            </Form.Item>
                        </Col>
                        <Col span={7}>
                            <Form.Item
                                name="maxGuests"
                                label={<span className="font-semibold text-gray-600">Số khách tối đa</span>}
                                className="mb-0"
                            >
                                <InputNumber className="w-full" style={{"width" : "100%"}} size="large" min={1} placeholder="2" />
                            </Form.Item>
                        </Col>
                    </Row>
                </div>

                {/* HÀNG 3: TIỆN ÍCH */}
                <Form.Item
                    name="amenities"
                    label={<span className="font-semibold text-gray-600">Tiện ích phòng</span>}
                >
                    <Select
                        mode="tags"
                        size="large"
                        placeholder="Nhập tiện ích rồi nhấn Enter (VD: Wifi, TV, Minibar...)"
                        tokenSeparators={[',']}
                    />
                </Form.Item>

                {/* HÀNG 4: MÔ TẢ */}
                <Form.Item
                    name="description"
                    label={<span className="font-semibold text-gray-600">Mô tả chi tiết</span>}
                >
                    <TextArea
                        rows={4}
                        placeholder="Mô tả chi tiết về không gian, thiết kế và trải nghiệm..."
                        showCount
                        maxLength={500}
                    />
                </Form.Item>

                {/* HÀNG 5: HÌNH ẢNH */}
                <Form.Item label={<span className="font-semibold text-gray-600">Hình ảnh minh họa</span>}>
                    <Upload
                        listType="picture-card"
                        fileList={fileList}
                        onChange={handleUploadChange}
                        beforeUpload={() => false}
                        maxCount={5}
                    >
                        {fileList.length < 5 && (
                            <div className="flex flex-col items-center justify-center text-gray-400">
                                <PlusOutlined />
                                <div className="mt-2 text-xs">Upload</div>
                            </div>
                        )}
                    </Upload>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default CabinCreateModal;