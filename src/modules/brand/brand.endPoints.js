import { systemRoles } from "../../utils/systemRoles.js"

systemRoles
export const brandApisRoles = {
    ADD_BRAND:[systemRoles.ADMIN,systemRoles.SUPERADMIN],
    DELETE_BRAND:[systemRoles.ADMIN,systemRoles.SUPERADMIN],
    UPDATE_BRAND:[systemRoles.ADMIN,systemRoles.SUPERADMIN],
    GET_BRAND:[systemRoles.USER,systemRoles.ADMIN,systemRoles.SUPERADMIN],
}