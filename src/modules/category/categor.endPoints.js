import { systemRoles } from "../../utils/systemRoles.js"

systemRoles
export const categoryApisRoles = {
    CREATE_CATEGORY:[systemRoles.ADMIN,systemRoles.SUPERADMIN],
    DELETE_CATEGORY:[systemRoles.ADMIN,systemRoles.SUPERADMIN],
    UPDATE_CATEGORY:[systemRoles.ADMIN,systemRoles.SUPERADMIN],
    GET_ALL_CATEGORIES:[systemRoles.USER,systemRoles.ADMIN,systemRoles.SUPERADMIN]
}