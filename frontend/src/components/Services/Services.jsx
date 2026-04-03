import Item from "./Item";

const Services = ({
                    isView,
                    handleServiceChange,
                    servicesDefault,
                    services,
                    setServicesDefault
                  }) => {
  // 1. Safety Check: Đảm bảo servicesDefault luôn là mảng trước khi map
  if (!servicesDefault || !Array.isArray(servicesDefault)) {
    return null;
  }

  return (
      <>
        {servicesDefault.map((service) => (
            <Item
                // 2. KEY FIX: Dùng _id thay vì index để React render đúng khi thêm mới
                key={service._id}

                isView={isView}
                service={service}

                // Truyền state xuống để Item biết nó có đang được chọn hay không
                services={services}

                // Các props khác giữ nguyên
                servicesDefault={servicesDefault}
                setServicesDefault={setServicesDefault}
                handleServiceChange={handleServiceChange}
            />
        ))}
      </>
  );
};

export default Services;