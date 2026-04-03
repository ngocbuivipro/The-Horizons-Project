import MaintenanceWrapper from '../components/Utils/MaintenanceWrapper/MaintenanceWrapper';

const PublicLayout = ({children}) => {
    return (
        <MaintenanceWrapper>
            {children}
        </MaintenanceWrapper>
    );
};
export default PublicLayout;
