import AlertModal from "./AlertModal";

export default function LogoutModal({
    setShowLogoutModal,
    logout,
}: {
    setShowLogoutModal: (value: boolean) => void;
    logout: () => Promise<void>;
}) {
    return (
        <AlertModal
            isOpen={true}
            onClose={() => setShowLogoutModal(false)}
            title="Confirm Logout"
            description="Are you sure you want to log out of your account?"
            primaryAction={{
                label: "Log Out",
                onClick: () => {
                    setShowLogoutModal(false);
                    logout();
                },
                variant: "danger",
            }}
            secondaryAction={{
                label: "Cancel",
                onClick: () => setShowLogoutModal(false),
            }}
        />
    );
}