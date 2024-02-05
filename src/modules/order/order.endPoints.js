import { systemRoles } from "../../utils/systemRoles.js"

systemRoles
export const orderApisRoles = {
    CREATE_ORDER:[systemRoles.USER,systemRoles.ADMIN,systemRoles.SUPERADMIN],
    CART_TO_ORDER:[systemRoles.USER,systemRoles.ADMIN,systemRoles.SUPERADMIN],
}