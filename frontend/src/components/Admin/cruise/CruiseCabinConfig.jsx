import { useState } from 'react';
import { Button, Card, Table, Tag, Modal, Empty, Row, Col, Input, Select, InputNumber, Space, Tooltip } from "antd";
import { IoAddCircleOutline, IoTrashOutline, IoLibraryOutline, IoPencil } from "react-icons/io5";
import { FaBed } from "react-icons/fa";
import toast from "react-hot-toast";
import { updateCabinApi } from "../../../api/client/service.api.js";

const CruiseCabinConfig = ({ cabins, templates, onCabinsChange, onTemplateCreated, onTemplateCreateRequest }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);

    // State to track what we are editing
    const [editingId, setEditingId] = useState(null); // For updating TEMPLATES (API)
    const [editingTempId, setEditingTempId] = useState(null); // For updating LOCAL CABINS (State)

    const [newCabinForm, setNewCabinForm] = useState({
        name: "",
        viewType: "Ocean View",
        pricePerNight: 0,
        description: "",
        specifications: { maxOccupancy: 2, cabinSize: 20 }
    });

    // --- HANDLERS FOR SELECTION ---
    const handleAddFromLibrary = (template) => {
        const newCabin = { ...template, tempId: Date.now() + Math.random() };
        delete newCabin._id; // Remove template ID to treat as new instance
        onCabinsChange([...cabins, newCabin]);
        toast.success(`Added ${template.name}`);
    };

    const handleRemoveCabin = (tempId) => {
        const newCabins = cabins.filter(c => c.tempId !== tempId);
        onCabinsChange(newCabins);
    };

    // --- HANDLERS FOR MODAL OPENING ---

    // 1. Open Create Template
    const handleOpenCreateModal = () => {
        setEditingId(null);
        setEditingTempId(null);
        setNewCabinForm({ name: "", viewType: "Ocean View", pricePerNight: 0, description: "", specifications: { maxOccupancy: 2, cabinSize: 20 } });
        setIsModalOpen(true);
    };

    // 2. Open Edit Template (Library)
    const handleOpenEditTemplateModal = (template) => {
        setEditingId(template._id);
        setEditingTempId(null);
        setNewCabinForm({
            name: template.name,
            viewType: template.viewType,
            pricePerNight: template.pricePerNight,
            description: template.description,
            specifications: {
                maxOccupancy: template.specifications?.maxOccupancy || 2,
                cabinSize: template.specifications?.cabinSize || 20
            }
        });
        setIsModalOpen(true);
    };

    // 3. Open Edit Local Cabin (Table)
    const handleOpenEditLocalModal = (record) => {
        setEditingTempId(record.tempId);
        setEditingId(null);
        setNewCabinForm({
            name: record.name,
            viewType: record.viewType,
            pricePerNight: record.pricePerNight,
            description: record.description,
            specifications: {
                maxOccupancy: record.specifications?.maxOccupancy || 2,
                cabinSize: record.specifications?.cabinSize || 20
            }
        });
        setIsModalOpen(true);
    };

    // --- MAIN SUBMIT HANDLER ---
    const handleModalSubmit = async () => {
        if (!newCabinForm.name || !newCabinForm.pricePerNight) {
            return toast.error("Name and Price are required");
        }
        setModalLoading(true);
        try {
            if (editingTempId) {
                // --- CASE A: UPDATE LOCAL CABIN (In Table) ---
                const updatedCabins = cabins.map(c =>
                    c.tempId === editingTempId ? { ...c, ...newCabinForm } : c
                );
                onCabinsChange(updatedCabins);
                toast.success("Cabin updated locally!");
                setIsModalOpen(false);
            }
            else if (editingId) {
                // --- CASE B: UPDATE TEMPLATE (Via API) ---
                const res = await updateCabinApi(editingId, newCabinForm);
                if (res.success) {
                    toast.success("Cabin template updated!");
                    setIsModalOpen(false);
                    onTemplateCreated(); // Refresh Library
                } else {
                    toast.error(res.message);
                }
            }
            else {
                // --- CASE C: CREATE NEW LOCAL CABIN (Directly to Table) ---
                const newCabin = { ...newCabinForm, tempId: Date.now() + Math.random() };
                onCabinsChange([...cabins, newCabin]);
                toast.success("New cabin added!");
                setIsModalOpen(false);
            }
        } catch (error) {
            console.error(error);
            toast.error("An error occurred");
        } finally {
            setModalLoading(false);
        }
    };

    // Determine Modal Title
    const getModalTitle = () => {
        if (editingTempId) return "Edit Selected Cabin";
        if (editingId) return "Edit Library Template";
        return "Create New Cabin";
    };

    const getModalOkText = () => {
        if (editingTempId) return "Update Cabin";
        if (editingId) return "Update Template";
        return "Create & Add to Cruise";
    };

    return (
        <>
            <Card
                title={<><FaBed className="inline mr-2"/> Cabin Configuration</>}
                className="shadow-sm rounded-2xl"
                extra={
                    <Button type="primary" icon={<IoAddCircleOutline />} onClick={handleOpenCreateModal} className="bg-indigo-600">
                        Create New Cabin
                    </Button>
                }
            >
                {/* Selected Cabins Table */}
                <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                        <h3 className="text-sm font-bold text-gray-700 uppercase">Selected Cabins for this Cruise</h3>
                        <Tag color={cabins.length > 0 ? "green" : "red"}>{cabins.length} Selected</Tag>
                    </div>
                    <Table
                        dataSource={cabins}
                        rowKey="tempId"
                        pagination={false}
                        size="small"
                        className="border border-gray-200 rounded-lg overflow-hidden"
                        locale={{ emptyText: <div className="py-4 text-gray-400"></div> }}
                        columns={[
                            { title: 'Name', dataIndex: 'name', key: 'name', render: t => <span className="font-bold text-gray-800">{t}</span> },
                            { title: 'Type', dataIndex: 'viewType', key: 'viewType', render: t => <Tag color="geekblue">{t}</Tag> },
                            { title: 'Price', dataIndex: 'pricePerNight', key: 'price', render: t => <span className="font-medium">{t?.toLocaleString()} đ</span> },
                            { title: 'Occupancy', render: (_, r) => <span className="text-gray-500">{r.specifications?.maxOccupancy || 2} pax</span> },
                            {
                                title: 'Action',
                                key: 'action',
                                width: 100,
                                render: (_, record) => (
                                    <Space size="small">
                                        <Tooltip title="Edit this cabin">
                                            <Button
                                                type="text"
                                                size="small"
                                                className="text-blue-600 hover:bg-blue-50"
                                                icon={<IoPencil size={16}/>}
                                                onClick={() => handleOpenEditLocalModal(record)}
                                            />
                                        </Tooltip>
                                        <Tooltip title="Remove">
                                            <Button
                                                danger
                                                type="text"
                                                size="small"
                                                icon={<IoTrashOutline size={16}/>}
                                                onClick={() => handleRemoveCabin(record.tempId)}
                                            />
                                        </Tooltip>
                                    </Space>
                                )
                            }
                        ]}
                    />
                </div>

                <div className="border-t border-gray-200 my-6 hidden"></div>

                {/* Available Library Grid */}
                <div className="hidden">
                    <div className="flex items-center gap-2 mb-3">
                        <IoLibraryOutline className="text-indigo-600" />
                        <h3 className="text-sm font-bold text-gray-700 uppercase">Available Templates (Library)</h3>
                    </div>

                    {templates.length === 0 ? <Empty description="Library is empty. Create a new template to start." /> : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[400px] overflow-y-auto p-1">
                            {templates.map((template) => (
                                <div key={template._id} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all flex flex-col justify-between group relative">

                                    {/* Edit Button (Top Right) */}
                                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Tooltip title="Edit Template Source">
                                            <Button
                                                type="text"
                                                size="small"
                                                className="bg-gray-100 text-gray-500 hover:text-blue-600 hover:bg-blue-50"
                                                icon={<IoPencil />}
                                                onClick={() => handleOpenEditTemplateModal(template)}
                                            />
                                        </Tooltip>
                                    </div>

                                    <div>
                                        <div className="flex justify-between items-start mb-2 pr-8">
                                            <h4 className="font-bold text-gray-800 line-clamp-1" title={template.name}>{template.name}</h4>
                                        </div>
                                        <div className="mb-2">
                                            <Tag className="mr-0">{template.viewType}</Tag>
                                        </div>
                                        <div className="text-lg font-bold text-indigo-600 mb-2">
                                            {template.pricePerNight?.toLocaleString()} đ<span className="text-xs text-gray-400 font-normal">/night</span>
                                        </div>
                                        <div className="text-xs text-gray-500 mb-3 line-clamp-2 min-h-[32px]">
                                            {template.description || "No description available."}
                                        </div>
                                        <div className="flex gap-2 text-xs text-gray-400 mb-4">
                                            <span className="bg-gray-100 px-2 py-1 rounded">{template.specifications?.maxOccupancy || 2} Guests</span>
                                            <span className="bg-gray-100 px-2 py-1 rounded">{template.specifications?.cabinSize || 0} m²</span>
                                        </div>
                                    </div>
                                    <Button type="dashed" block onClick={() => handleAddFromLibrary(template)} className="text-indigo-600 border-indigo-200 hover:text-indigo-700 hover:border-indigo-400 group-hover:bg-indigo-50">
                                        Add to Cruise
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </Card>

            {/* Config Modal */}
            <Modal
                title={getModalTitle()}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onOk={handleModalSubmit}
                confirmLoading={modalLoading}
                width={700}
                okText={getModalOkText()}
            >
                <div className="space-y-4 py-2">
                    <Row gutter={16}>
                        <Col span={12}>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Cabin Name</label>
                            <Input placeholder="e.g. Presidential Suite" value={newCabinForm.name} onChange={e => setNewCabinForm({...newCabinForm, name: e.target.value})} />
                        </Col>
                        <Col span={12}>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">View Type</label>
                            <Select className="w-full" value={newCabinForm.viewType} onChange={v => setNewCabinForm({...newCabinForm, viewType: v})} options={["Ocean View", "City View", "Internal", "Suite", "Balcony"].map(v => ({label: v, value: v}))} />
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={8}>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Price / Night</label>
                            <InputNumber style={{"width" : "100%"}} className="w-full" value={newCabinForm.pricePerNight} onChange={v => setNewCabinForm({...newCabinForm, pricePerNight: v})} formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")} />
                        </Col>
                        <Col span={8}>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Max Guests</label>
                            <InputNumber style={{"width" : "100%"}} className="w-full" min={1} value={newCabinForm.specifications?.maxOccupancy} onChange={v => setNewCabinForm({...newCabinForm, specifications: {...newCabinForm.specifications, maxOccupancy: v}})} />
                        </Col>
                        <Col span={8}>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Size (m²)</label>
                            <InputNumber style={{"width" : "100%"}} className="w-full" min={1} value={newCabinForm.specifications?.cabinSize} onChange={v => setNewCabinForm({...newCabinForm, specifications: {...newCabinForm.specifications, cabinSize: v}})} />
                        </Col>
                    </Row>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description</label>
                        <Input.TextArea rows={3} value={newCabinForm.description} onChange={e => setNewCabinForm({...newCabinForm, description: e.target.value})} />
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default CruiseCabinConfig;