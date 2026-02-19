import api from "./api";
import authHeader from "./auth-header";

const getPublicContent = () => {
    return api.get("test/all");
};

const getUserBoard = () => {
    return api.get("test/user", { headers: authHeader() });
};

const getAdminBoard = () => {
    return api.get("test/admin", { headers: authHeader() });
};

const UserService = {
    getPublicContent,
    getUserBoard,
    getAdminBoard,
};

export default UserService;
