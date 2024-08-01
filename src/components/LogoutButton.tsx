import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Button, Tooltip } from 'antd';
import { LogoutOutlined } from '@ant-design/icons';

interface LogoutButtonProps {
    className?: string;
}

const LogoutButton: React.FC<LogoutButtonProps> = ({ className }) => {
    const { logout } = useAuth0();

    return (
        <Tooltip title="Cerrar Sesión">
            <Button
                type="primary"
                icon={<LogoutOutlined />}
                className={className}
                onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
            />
        </Tooltip>
    );
};

export default LogoutButton;
