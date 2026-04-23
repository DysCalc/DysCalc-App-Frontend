export default function LogoutModal({ setShowLogoutModal, logout }: { setShowLogoutModal: (value: boolean) => void, logout: () => Promise<void> }) {
    return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity">
        <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="mb-2 text-xl font-bold text-gray-900">Confirm Logout</h3>
            <p className="mb-6 text-gray-600">Are you sure you want to log out of your account?</p>
            <div className="flex justify-end gap-3">
                <button
                    onClick={() => setShowLogoutModal(false)}
                    className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
                >
                    Cancel
                </button>
                <button
                    onClick={() => {
                        setShowLogoutModal(false);
                        logout();
                    }}
                    className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
                >
                    Log Out
                </button>
            </div>
        </div>
    </div>
}