import { systemRoles } from "../../utils/systemRoles.js"

systemRoles
export const couponApisRoles = {
    CREATE_COUPON:[systemRoles.ADMIN,systemRoles.SUPERADMIN],
    DELETE_COUPON:[systemRoles.ADMIN,systemRoles.SUPERADMIN],
    UPDATE_COUPON:[systemRoles.ADMIN,systemRoles.SUPERADMIN],

}